import { getCurrentDbUser } from "@/lib/auth";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canCreateProject, getUserPlan } from "@/lib/usage";
import { generateQueue } from "@/lib/queue";

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

// POST /api/projects — create a new project
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

    const dbUser = await getCurrentDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: "User data not found" }, { status: 401 });
    }

    const email = dbUser.email || `${userId}@placeholder.com`;

    // More resilient upsert: try to find by supabaseId first
    let user = await prisma.user.findUnique({ where: { supabaseId: userId } });
    
    if (!user) {
      // If not found by supabaseId, try to find by email
      const existingByEmail = await prisma.user.findUnique({ where: { email } });
      
      if (existingByEmail) {
        // If found by email but has different supabaseId, update the supabaseId
        // This handles cases where a user might have re-created their account
        user = await prisma.user.update({
          where: { email },
          data: { supabaseId: userId }
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: { supabaseId: userId, email }
        });
      }
    }

    const project = await prisma.project.create({
      data: {
        userId: user.id,
        domain,
        brandName,
        industry,
        competitors,
        status: "generating",
      },
    });

    try {
      // Add to queue with a 3-second timeout to prevent hanging the response
      // if Redis is unreachable
      await Promise.race([
        generateQueue.add("generate-prompts", {
          projectId: project.id,
          domain,
          brandName,
          industry,
          userId: user.id,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Queue timeout")), 3000)
        )
      ]);
    } catch (queueErr) {
      console.warn("[API] Redis/BullMQ error or timeout:", queueErr);
      // We don't fail the request here, as the project is already created
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    console.error("[API] Project creation error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      message: error.message 
    }, { status: 500 });
  }
}
