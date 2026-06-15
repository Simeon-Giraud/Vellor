import { getCurrentDbUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getHistoryCutoff, getUserPlan } from "@/lib/usage";
import { getUserState } from "@/lib/userState";
import ProjectDetailClient from "./ProjectDetailClient";

export const metadata: Metadata = { title: "Project Details — Vellor" };

const ENGINE_LABELS: Record<string, string> = {
  CHATGPT: "ChatGPT",
  GEMINI: "Gemini",
  PERPLEXITY: "Perplexity",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
  if (!dbUser || !userId) redirect("/");

  const userState = await getUserState(userId);

  const { id } = await params;

  let project;
  let plan;
  try {
    const cutoff = await getHistoryCutoff(userId);
    plan = await getUserPlan(userId);

    project = await prisma.project.findFirst({
      where: { id, userId: dbUser.id },
      include: {
        prompts: {
          include: {
            results: {
              where: { createdAt: { gte: cutoff } },
              orderBy: { createdAt: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("[ProjectPage] Database error:", error);
    project = null;
  }

  if (!project || !plan) notFound();

  // Compute stats for charts
  const allResults = project.prompts.flatMap((p) => p.results);
  const mentionedCount = allResults.filter((r) => r.brandMentioned).length;
  const mentionRate = allResults.length > 0
    ? Math.round((mentionedCount / allResults.length) * 1000) / 10
    : 0;

  // Daily mention rate per engine for chart (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentResults = allResults.filter((r) => new Date(r.createdAt) >= sevenDaysAgo);
  
  const fourteenDaysAgo = new Date(sevenDaysAgo);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 7);
  const prevWeekResults = allResults.filter(r => {
    const d = new Date(r.createdAt);
    return d >= fourteenDaysAgo && d < sevenDaysAgo;
  });

  const chartData: { day: string; ChatGPT: number; Gemini: number; Perplexity: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStr = date.toISOString().slice(0, 10);
    const dayResults = recentResults.filter((r) => new Date(r.createdAt).toISOString().slice(0, 10) === dayStr);

    const engineRates: Record<string, number> = {};
    for (const engine of ["CHATGPT", "GEMINI", "PERPLEXITY"]) {
      const eResults = dayResults.filter((r) => r.engine === engine);
      engineRates[ENGINE_LABELS[engine]] = eResults.length > 0
        ? Math.round((eResults.filter((r) => r.brandMentioned).length / eResults.length) * 100)
        : 0;
    }

    chartData.push({
      day: date.toLocaleDateString("en", { weekday: "short" }),
      ChatGPT: engineRates.ChatGPT || 0,
      Gemini: engineRates.Gemini || 0,
      Perplexity: engineRates.Perplexity || 0,
    });
  }

  // Your brand trend
  const myCurrMentions = recentResults.filter(r => r.brandMentioned).length;
  const myCurrRate = recentResults.length > 0 ? (myCurrMentions / recentResults.length) * 100 : 0;
  const myPrevMentions = prevWeekResults.filter(r => r.brandMentioned).length;
  const myPrevRate = prevWeekResults.length > 0 ? (myPrevMentions / prevWeekResults.length) * 100 : 0;
  const myTrend = Math.round((myCurrRate - myPrevRate) * 10) / 10;

  // Competitor mention rates and trends
  const competitorData = project.competitors.map((comp) => {
    const compMentions = allResults.filter((r) =>
      r.response.toLowerCase().includes(comp.toLowerCase())
    ).length;
    const compRate = allResults.length > 0
      ? Math.round((compMentions / allResults.length) * 1000) / 10
      : 0;
      
    const currMentions = recentResults.filter(r => r.response.toLowerCase().includes(comp.toLowerCase())).length;
    const currRate = recentResults.length > 0 ? (currMentions / recentResults.length) * 100 : 0;

    const prevMentions = prevWeekResults.filter(r => r.response.toLowerCase().includes(comp.toLowerCase())).length;
    const prevRate = prevWeekResults.length > 0 ? (prevMentions / prevWeekResults.length) * 100 : 0;

    const trend = Math.round((currRate - prevRate) * 10) / 10;
      
    return { domain: comp, mentionRate: compRate, trend };
  });

  // Serialize models into plain objects to prevent Date warnings
  const serializedProject = {
    id: project.id,
    domain: project.domain,
    brandName: project.brandName,
    industry: project.industry,
    status: project.status,
    competitors: project.competitors,
    lastRunAt: project.lastRunAt ? project.lastRunAt.toISOString() : null,
  };

  const serializedPrompts = project.prompts.map((p) => ({
    id: p.id,
    text: p.text,
    results: p.results.map((r) => ({
      id: r.id,
      engine: r.engine,
      response: r.response,
      brandMentioned: r.brandMentioned,
      mentionPosition: r.mentionPosition,
      createdAt: r.createdAt.toISOString(),
    })),
  }));

  return (
    <ProjectDetailClient
      project={serializedProject}
      prompts={serializedPrompts}
      chartData={chartData}
      competitorData={competitorData}
      planLimit={plan.maxPromptsPerProject}
      planName={userState === "demo" ? "Demo" : plan.name}
      maxCompetitors={plan.maxCompetitors}
      myTrend={myTrend}
    />
  );
}
