import { getCurrentDbUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserPlan } from "@/lib/usage";
import { promptQueue } from "@/lib/queue";

export const dynamic = "force-dynamic";

// GET /api/projects/[id] — retrieve project status and queue run status
export async function GET(
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
    const project = await prisma.project.findFirst({
      where: { id, user: { supabaseId: userId } },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if there are active/waiting/delayed jobs for this project OR if status is running/generating
    let isRunning = project.status === "running" || project.status === "generating";
    if (!isRunning && process.env.NEXT_PUBLIC_USE_MOCK_AI !== "true") {
      try {
        const client = promptQueue.client;
        if (client && (client as any).status === "ready") {
          const getJobsPromise = promptQueue.getJobs(["active", "waiting", "delayed"]);
          const jobs = await Promise.race([
            getJobsPromise,
            new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error("Redis timeout")), 1000))
          ]);
          isRunning = jobs.some((job) => job.data?.projectId === id);
        } else {
          console.warn("[API] Redis client is not ready, skipping queue check");
        }
      } catch (err) {
        console.warn("[API] Redis not available or timed out:", err);
      }
    }

    return NextResponse.json({ project, isRunning });
  } catch (error: any) {
    console.error("[API] Error fetching project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// PATCH /api/projects/[id] — update project details (brandName, industry, competitors)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const project = await prisma.project.findFirst({
      where: { id, user: { supabaseId: userId } },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await req.json();
    const { brandName, industry, competitors } = body;

    // Validate competitor count if they are updated
    if (competitors) {
      const plan = await getUserPlan(userId);
      if (competitors.length > plan.maxCompetitors) {
        return NextResponse.json({
          error: "Competitor limit reached",
          message: `Your ${plan.name} plan allows up to ${plan.maxCompetitors} competitor${plan.maxCompetitors === 1 ? "" : "s"}.`,
        }, { status: 403 });
      }
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        brandName: brandName !== undefined ? brandName : undefined,
        industry: industry !== undefined ? industry : undefined,
        competitors: competitors !== undefined ? competitors : undefined,
      },
    });

    return NextResponse.json({ project: updatedProject });
  } catch (error: any) {
    console.error("[API] Error updating project:", error);
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 });
  }
}

// DELETE /api/projects/[id] — delete project (prompts and results are cascade deleted)
export async function DELETE(
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
    const project = await prisma.project.findFirst({
      where: { id, user: { supabaseId: userId } },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API] Error deleting project:", error);
    return NextResponse.json({ error: "Internal server error", message: error.message }, { status: 500 });
  }
}
