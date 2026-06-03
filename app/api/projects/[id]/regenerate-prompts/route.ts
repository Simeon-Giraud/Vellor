import { getCurrentDbUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserPlan } from "@/lib/usage";
import { getUserState } from "@/lib/userState";

/**
 * POST /api/projects/[id]/regenerate-prompts
 *
 * Deletes all existing prompts for the project and generates a fresh AI set
 * based on the user's current plan limit.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: projectId } = await params;

  try {
    // Verify project belongs to this user
    const project = await prisma.project.findFirst({
      where: { id: projectId, user: { supabaseId: userId } },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const plan = await getUserPlan(userId);
    const userState = await getUserState(userId);

    // Mark project as regenerating
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "generating" },
    });

    // Delete existing prompts (and their results via cascade)
    await prisma.prompt.deleteMany({ where: { projectId } });

    // Generate fresh prompts
    const { generatePrompts } = await import("@/lib/ai/generatePrompts");

    let promptTexts: string[];

    if (userState === "demo") {
      promptTexts = [
        `What are the best tools for ${project.industry}?`,
        `Top ${project.industry} solutions for growing teams`,
        `How does ${project.brandName} compare to alternatives?`,
        `Best ${project.industry} software in 2025`,
        `${project.brandName} reviews and pricing`,
      ];
    } else {
      promptTexts = await generatePrompts(
        project.domain,
        project.brandName || project.domain,
        project.industry || "software",
        plan.maxPromptsPerProject
      );
    }

    // Save new prompts
    const createdPrompts: { id: string; text: string }[] = [];
    for (const text of promptTexts) {
      const p = await prisma.prompt.create({ data: { projectId, text } });
      createdPrompts.push(p);
    }

    if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true") {
      const { seedHistoricalMockResults, executeAndSaveMockResults } = await import("@/lib/ai/mockExecutor");
      
      // Seed 7 days of historical mock results
      await seedHistoricalMockResults(createdPrompts, project.domain, project.competitors, 7);
      
      // Run a current mock check
      for (const p of createdPrompts) {
        await executeAndSaveMockResults(p.id, p.text, project.domain, project.competitors);
      }
    } else if (userState === "demo") {
      const { generateDemoResults } = await import("@/lib/ai/demoData");
      for (const p of createdPrompts) {
        const mockResults = generateDemoResults(p.text, project.domain);
        await prisma.promptResult.createMany({
          data: mockResults.map(r => ({
            promptId: p.id,
            engine: r.engine,
            brandMentioned: r.mentioned,
            mentionPosition: r.position,
            response: r.snippet,
          }))
        });
      }
    } else {
      // Queue runs for the new prompts
      for (const p of createdPrompts) {
        try {
          const { promptQueue } = await import("@/lib/queue");
          await promptQueue.add("run-prompt", {
            promptId: p.id,
            promptText: p.text,
            projectId,
            domain: project.domain,
            competitors: project.competitors,
          });
        } catch {
          console.warn("[API] Redis/BullMQ not available, skipping queue");
        }
      }
    }

    // Mark project active
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "active" },
    });

    return NextResponse.json({
      success: true,
      promptCount: createdPrompts.length,
      prompts: createdPrompts.map(p => ({ id: p.id, text: p.text })),
    });
  } catch (error: any) {
    console.error("[API] Error regenerating prompts:", error);
    // Restore project to active state on failure
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "active" },
    }).catch(() => {});
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
