import { getCurrentDbUser } from "@/lib/auth";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAddPrompt, canRunPrompts } from "@/lib/usage";
import { getUserState } from "@/lib/userState";

export const dynamic = "force-dynamic";

// POST /api/prompts — create prompt and optionally enqueue a run
export async function POST(req: Request) {
  const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { projectId, text, runNow = true } = body;

    if (!projectId || !text) {
      return NextResponse.json(
        { error: "projectId and text are required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, user: { supabaseId: userId } }
    });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!(await canAddPrompt(userId, projectId))) {
      return NextResponse.json({
        error: 'Prompt limit reached',
        message: 'Upgrade your plan to add more prompts to this project'
      }, { status: 403 });
    }

    if (runNow && !(await canRunPrompts(userId))) {
      return NextResponse.json({
        error: 'Usage limit reached',
        message: 'Upgrade your plan to run more prompts'
      }, { status: 403 });
    }

    const userState = await getUserState(userId);

    const prompt = await prisma.prompt.create({
      data: { projectId, text },
      include: { project: true },
    });

    if (runNow) {
      if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true") {
        const { seedHistoricalMockResults, executeAndSaveMockResults } = await import("@/lib/ai/mockExecutor");
        
        // Seed 7 days of history for this single prompt
        await seedHistoricalMockResults(
          [{ id: prompt.id, text: prompt.text }],
          prompt.project.domain,
          prompt.project.competitors,
          7
        );

        // Execute current run
        await executeAndSaveMockResults(
          prompt.id,
          prompt.text,
          prompt.project.domain,
          prompt.project.competitors
        );
      } else if (userState === "demo") {
        const { generateDemoResults } = await import("@/lib/ai/demoData");
        const mockResults = generateDemoResults(text, prompt.project.domain);
        
        for (const r of mockResults) {
          const promptResult = await prisma.promptResult.create({
            data: {
              promptId: prompt.id,
              engine: r.engine,
              brandMentioned: r.mentioned,
              mentionPosition: r.position,
              response: r.snippet,
            }
          });

          // Trigger competitor analysis if a competitor exists and position is top 3
          if (prompt.project.competitors && prompt.project.competitors.length > 0 && r.position && r.position <= 3) {
            const topCompetitor = prompt.project.competitors[0];
            try {
              const { analysisQueue } = await import("@/lib/queue");
              // Don't await indefinitely if Redis is down
              Promise.race([
                analysisQueue.add("analyze-competitor", {
                  promptResultId: promptResult.id,
                  competitorDomain: topCompetitor,
                  promptText: text
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Redis timeout")), 2000))
              ]).then(() => {
                console.log(`[API] Queued analysis for competitor ${topCompetitor} on result ${promptResult.id} in demo mode`);
              }).catch(() => {
                console.warn("[API] Redis/BullMQ not available or timeout, skipping queue");
              });
            } catch {
              console.warn("[API] Redis/BullMQ not available, skipping queue");
            }
          }
        }
      } else {
        try {
          const { promptQueue } = await import("@/lib/queue");
          await promptQueue.add("run-prompt", {
            promptId: prompt.id,
            promptText: text,
            projectId: project.id,
            domain: prompt.project.domain,
            competitors: prompt.project.competitors,
          });
        } catch {
          console.warn("[API] Redis/BullMQ not available, skipping queue");
        }
      }
    }

    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating prompt:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
