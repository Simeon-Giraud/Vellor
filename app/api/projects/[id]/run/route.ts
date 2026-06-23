import { getCurrentDbUser } from "@/lib/auth";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canRunPrompts } from "@/lib/usage";
import { rateLimit } from "@/lib/rateLimit";
import { getUserState } from "@/lib/userState";

export const dynamic = "force-dynamic";

// POST /api/projects/[id]/run — queue BullMQ job to re-run all prompts
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userState = await getUserState(userId);

  // Rate limiting
  let rateLimitSuccess = true;
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI !== "true" && userState !== "demo") {
    try {
      const { success } = await rateLimit.limit(userId);
      rateLimitSuccess = success;
    } catch (err) {
      console.warn("[API] Rate limiter error (Upstash Redis probably not configured):", err);
    }
  }

  if (!rateLimitSuccess) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    if (userState !== "demo" && !(await canRunPrompts(userId))) {
      return NextResponse.json({
        error: 'Usage limit reached',
        message: 'Upgrade your plan to run more prompts'
      }, { status: 403 });
    }

    const project = await prisma.project.findFirst({
      where: { id, user: { supabaseId: userId } },
      include: { prompts: { select: { id: true, text: true } } },
    });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Record the on-demand run
    await prisma.projectRun.create({
      data: {
        projectId: id,
        runType: "on_demand",
      },
    });


    if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true" || userState === "demo") {
      // Set status to running
      await prisma.project.update({
        where: { id },
        data: { status: "running" },
      });

      // Execute mock run asynchronously with a delay
      (async () => {
        // Sleep for 5 seconds to simulate API calls
        await new Promise((resolve) => setTimeout(resolve, 5000));

        if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true") {
          const { executeAndSaveMockResults } = await import("@/lib/ai/mockExecutor");
          for (const prompt of project.prompts) {
            await executeAndSaveMockResults(
              prompt.id,
              prompt.text,
              project.domain,
              project.competitors
            );
          }
        } else {
          // Demo mode flow using demoData
          const { generateDemoResults } = await import("@/lib/ai/demoData");
          for (const prompt of project.prompts) {
            const mockResults = generateDemoResults(prompt.text, project.domain);
            
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
              if (project.competitors && project.competitors.length > 0 && r.position && r.position <= 3) {
                const topCompetitor = project.competitors[0];
                try {
                  const { analysisQueue } = await import("@/lib/queue");
                  // Don't await indefinitely if Redis is down
                  Promise.race([
                    analysisQueue.add("analyze-competitor", {
                      promptResultId: promptResult.id,
                      competitorDomain: topCompetitor,
                      promptText: prompt.text
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
          }
        }

        await prisma.project.update({
          where: { id },
          data: { 
            status: "active", 
            lastRunAt: new Date() 
          },
        });
      })().catch((err) => {
        console.error("Mock execution background error:", err);
        // Fallback to active state on error
        prisma.project.update({
          where: { id },
          data: { status: "active" },
        }).catch(() => {});
      });

      return NextResponse.json({
        queued: true,
        executedMock: true,
        promptCount: project.prompts.length,
      });
    }

    // Queue BullMQ jobs
    try {
      const { promptQueue } = await import("@/lib/queue");
      for (const prompt of project.prompts) {
        await promptQueue.add("run-prompt", {
          promptId: prompt.id,
          promptText: prompt.text,
          projectId: project.id,
          domain: project.domain,
          competitors: project.competitors,
        });
      }
    } catch {
      // Redis not available — log and continue
      console.warn("[API] Redis/BullMQ not available, skipping queue");
    }

    return NextResponse.json({
      queued: true,
      promptCount: project.prompts.length,
    });
  } catch (error) {
    console.error("[API] Error queuing prompt run:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
