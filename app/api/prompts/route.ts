import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { promptQueue } from "@/lib/queue";
import { prisma } from "@/lib/prisma";

// POST /api/prompts — create prompt and optionally enqueue a run
export async function POST(req: Request) {
  const { userId } = await auth();
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

    // Real implementation:
    /*
    const prompt = await prisma.prompt.create({
      data: { projectId, text },
      include: { project: true },
    });

    if (runNow) {
      await promptQueue.add("run-prompt", {
        promptId: prompt.id,
        promptText: text,
        domain: prompt.project.domain,
      });
    }
    */

    const mockPrompt = {
      id: `prompt_${Date.now()}`,
      projectId,
      text,
      createdAt: new Date().toISOString(),
      jobEnqueued: runNow,
    };

    return NextResponse.json({ prompt: mockPrompt }, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating prompt:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
