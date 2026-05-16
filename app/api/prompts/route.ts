import { getCurrentDbUser } from "@/lib/auth";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAddPrompt, canRunPrompts } from "@/lib/usage";

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

    const prompt = await prisma.prompt.create({
      data: { projectId, text },
      include: { project: true },
    });

    if (runNow) {
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

    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating prompt:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
