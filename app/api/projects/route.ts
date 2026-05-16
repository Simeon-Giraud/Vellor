import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/projects — list all projects for current user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // In a real implementation, find user by clerkId first
    // const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    // const projects = await prisma.project.findMany({ where: { userId: user.id } });

    // Mock response for now
    const mockProjects = [
      { id: "proj_1", domain: "acme-saas.com", competitors: ["rival.io"], createdAt: new Date().toISOString() },
    ];
    return NextResponse.json({ projects: mockProjects });
  } catch (error) {
    console.error("[API] Error fetching projects:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects — create a new project
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { domain, competitors = [], prompts = [] } = body;

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    // Placeholder — real implementation below
    /*
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: { clerkId: userId, email: "" },
    });

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        domain,
        competitors,
        prompts: {
          create: prompts.map((text: string) => ({ text })),
        },
      },
      include: { prompts: true },
    });
    */

    const mockProject = {
      id: `proj_${Date.now()}`,
      domain,
      competitors,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ project: mockProject }, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating project:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
