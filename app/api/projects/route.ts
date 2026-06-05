import { getCurrentDbUser } from "@/lib/auth";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canCreateProject, getUserPlan } from "@/lib/usage";
import { getUserState } from "@/lib/userState";

export const dynamic = "force-dynamic";

// GET /api/projects — list all projects for current user
export async function GET() {
  const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { supabaseId: userId } });
    if (!user) return NextResponse.json({ projects: [] });

    const projects = await prisma.project.findMany({ 
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { prompts: true }
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("[API] Error fetching projects:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects — create a new project (prompts are always AI-generated)
export async function POST(req: Request) {
  const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { domain, brandName, industry, competitors = [] } = body;

    if (!domain || !brandName || !industry) {
      return NextResponse.json({ error: "Domain, brandName, and industry are required" }, { status: 400 });
    }

    if (!(await canCreateProject(userId))) {
      return NextResponse.json({
        error: 'Project limit reached',
        message: 'Upgrade your plan to create more projects'
      }, { status: 403 });
    }

    const plan = await getUserPlan(userId);
    if (competitors.length > plan.maxCompetitors) {
      return NextResponse.json({
        error: 'Competitor limit reached',
        message: `Your ${plan.name} plan allows up to ${plan.maxCompetitors} competitor${plan.maxCompetitors === 1 ? '' : 's'}.`
      }, { status: 403 });
    }

    const userState = await getUserState(userId);

    // ── Create the project ───────────────────────────────────────────────────
    const project = await prisma.project.create({
      data: {
        userId: dbUser.id,
        domain,
        brandName,
        industry,
        competitors,
        status: "generating",
      },
    });

    // ── Generate AI prompts in the background ────────────────────────────────
    const generateAndSave = async () => {
      try {
        const { generatePrompts } = await import("@/lib/ai/generatePrompts");

        let promptTexts: string[];

        if (userState === "demo") {
          // Demo: use quick template prompts (5 items)
          promptTexts = [
            `What are the best tools for ${industry}?`,
            `Top ${industry} solutions for growing teams`,
            `How does ${brandName} compare to alternatives?`,
            `Best ${industry} software in 2025`,
            `${brandName} reviews and pricing`,
          ];
        } else {
          // Real users: generate up to plan limit (20 / 50 / 100)
          promptTexts = await generatePrompts(
            domain,
            brandName,
            industry,
            plan.maxPromptsPerProject
          );
        }

        // Save prompts to DB
        const createdPrompts: { id: string; text: string }[] = [];
        for (const text of promptTexts) {
          const p = await prisma.prompt.create({ data: { projectId: project.id, text } });
          createdPrompts.push(p);
        }

        if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true") {
          const { seedHistoricalMockResults, executeAndSaveMockResults } = await import("@/lib/ai/mockExecutor");
          
          // Seed historical mock data (last 7 days)
          await seedHistoricalMockResults(createdPrompts, domain, competitors, 7);
          
          // Run a fresh current check
          for (const p of createdPrompts) {
            await executeAndSaveMockResults(p.id, p.text, domain, competitors);
          }
        } else if (userState === "demo") {
          // Generate mock results for demo users immediately
          const { generateDemoResults } = await import("@/lib/ai/demoData");
          for (const p of createdPrompts) {
            const mockResults = generateDemoResults(p.text, domain);
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
          // Queue prompt runs for real users
          for (const p of createdPrompts) {
            try {
              const { promptQueue } = await import("@/lib/queue");
              await promptQueue.add("run-prompt", {
                promptId: p.id,
                promptText: p.text,
                projectId: project.id,
                domain,
                competitors,
              });
            } catch (queueErr) {
              console.warn("[API] Redis/BullMQ error queuing prompt run:", queueErr);
            }
          }
        }

        // Mark project active
        await prisma.project.update({
          where: { id: project.id },
          data: { status: "active" },
        });
      } catch (err) {
        console.error("[API] Error generating AI prompts for project:", err);
        // Don't fail the project — mark active anyway
        await prisma.project.update({
          where: { id: project.id },
          data: { status: "active" },
        }).catch(() => {});
      }
    };

    // Wait for prompt generation and activation
    await generateAndSave();

    const updatedProject = await prisma.project.findUnique({
      where: { id: project.id }
    });

    return NextResponse.json({ project: updatedProject || project }, { status: 201 });
  } catch (error: any) {
    console.error("[API] Project creation error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      message: error.message 
    }, { status: 500 });
  }
}
