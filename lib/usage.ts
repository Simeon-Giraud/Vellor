import { prisma } from "@/lib/prisma";
import { PLANS } from "./plans";

export async function getUserPlan(clerkUserId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { stripePriceId: true, subscriptionStatus: true }
  });

  if (!user || user.subscriptionStatus === "inactive") return PLANS.starter;

  if (user.stripePriceId === process.env.STRIPE_PRO_PRICE_ID) return PLANS.pro;
  if (user.stripePriceId === process.env.STRIPE_GROWTH_PRICE_ID) return PLANS.growth;
  
  return PLANS.starter;
}

export async function canCreateProject(clerkUserId: string): Promise<boolean> {
  const plan = await getUserPlan(clerkUserId);
  const count = await prisma.project.count({
    where: { user: { clerkId: clerkUserId } }
  });
  return count < plan.maxProjects;
}

export async function canAddPrompt(clerkUserId: string, projectId: string): Promise<boolean> {
  const plan = await getUserPlan(clerkUserId);
  const count = await prisma.prompt.count({
    where: { projectId, project: { user: { clerkId: clerkUserId } } }
  });
  return count < plan.maxPromptsPerProject;
}

export async function canAddCompetitor(clerkUserId: string, projectId: string): Promise<boolean> {
  const plan = await getUserPlan(clerkUserId);
  const project = await prisma.project.findUnique({
    where: { id: projectId, user: { clerkId: clerkUserId } },
    select: { competitors: true }
  });
  if (!project) return false;
  return project.competitors.length < plan.maxCompetitors;
}

export async function getRemainingRuns(clerkUserId: string): Promise<number> {
  const plan = await getUserPlan(clerkUserId);
  const count = await prisma.promptResult.count({
    where: {
      prompt: { project: { user: { clerkId: clerkUserId } } },
      createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    }
  });
  return Math.max(0, plan.maxRunsPerMonth - count);
}

export async function canRunPrompts(clerkUserId: string): Promise<boolean> {
  return (await getRemainingRuns(clerkUserId)) > 0;
}

export async function getHistoryCutoff(clerkUserId: string): Promise<Date> {
  const plan = await getUserPlan(clerkUserId);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - plan.dataHistoryDays);
  return cutoff;
}
