import { getCurrentDbUser } from "@/lib/auth";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canRunPrompts } from "@/lib/usage";

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

  try {
    if (!(await canRunPrompts(userId))) {
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
