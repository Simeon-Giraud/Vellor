import { prisma } from "@/lib/prisma";
import { PLANS } from "./plans";

export async function getUserPlan(supabaseUserId: string) {
  const user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUserId },
    select: { stripePriceId: true, subscriptionStatus: true }
  });

  if (!user || user.subscriptionStatus === "inactive") return PLANS.starter;

  if (user.stripePriceId === process.env.STRIPE_PRO_PRICE_ID) return PLANS.pro;
  if (user.stripePriceId === process.env.STRIPE_GROWTH_PRICE_ID) return PLANS.growth;
  
  return PLANS.starter;
}

export async function canCreateProject(supabaseUserId: string): Promise<boolean> {
  const plan = await getUserPlan(supabaseUserId);
  const count = await prisma.project.count({
    where: { user: { supabaseId: supabaseUserId } }
  });
  return count < plan.maxProjects;
}

export async function canAddPrompt(supabaseUserId: string, projectId: string): Promise<boolean> {
  const plan = await getUserPlan(supabaseUserId);
  const count = await prisma.prompt.count({
    where: { projectId, project: { user: { supabaseId: supabaseUserId } } }
  });
  return count < plan.maxPromptsPerProject;
}

export async function canAddCompetitor(supabaseUserId: string, projectId: string): Promise<boolean> {
  const plan = await getUserPlan(supabaseUserId);
  const project = await prisma.project.findUnique({
    where: { id: projectId, user: { supabaseId: supabaseUserId } },
    select: { competitors: true }
  });
  if (!project) return false;
  return project.competitors.length < plan.maxCompetitors;
}

export async function getRemainingRuns(supabaseUserId: string): Promise<number> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true") {
    return 9999;
  }
  const plan = await getUserPlan(supabaseUserId);
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const count = await prisma.projectRun.count({
    where: {
      project: { user: { supabaseId: supabaseUserId } },
      runType: "on_demand",
      createdAt: { gte: startOfMonth }
    }
  });
  return Math.max(0, plan.maxOnDemandRunsPerMonth - count);
}

export async function getUserUsage(supabaseUserId: string): Promise<{ usageCount: number; usageLimit: number }> {
  const plan = await getUserPlan(supabaseUserId);
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true") {
    return { usageCount: 0, usageLimit: plan.maxOnDemandRunsPerMonth };
  }
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const count = await prisma.projectRun.count({
    where: {
      project: { user: { supabaseId: supabaseUserId } },
      runType: "on_demand",
      createdAt: { gte: startOfMonth }
    }
  });
  return {
    usageCount: count,
    usageLimit: plan.maxOnDemandRunsPerMonth
  };
}

export async function canRunPrompts(supabaseUserId: string): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AI === "true") {
    return true;
  }
  return (await getRemainingRuns(supabaseUserId)) > 0;
}


export async function getHistoryCutoff(supabaseUserId: string): Promise<Date> {
  const plan = await getUserPlan(supabaseUserId);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - plan.dataHistoryDays);
  return cutoff;
}
