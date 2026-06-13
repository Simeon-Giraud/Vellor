import { getCurrentDbUser } from "@/lib/auth";

import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";
import { getProjectDetailData } from "@/lib/projects";
import ProjectDetailClient from "./projects/[id]/ProjectDetailClient";
import AnimatedCounter from "@/components/AnimatedCounter";
import TrendChart from "@/components/TrendChart";

export const metadata: Metadata = { title: "Dashboard — Vellor" };

// SVG icons
const IconTrend = ({ up }: { up: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {up
      ? <><path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/></>
      : <><path d="m22 17-8.5-8.5-5 5L2 7"/><path d="M16 17h6v-6"/></>
    }
  </svg>
);
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);
const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);
const IconEmpty = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9"/>
  </svg>
);

async function getDashboardData(supabaseId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true, stripePriceId: true, subscriptionStatus: true },
    });

    if (!user) return null;

    let plan: typeof PLANS[keyof typeof PLANS] = PLANS.starter;
    if (user.subscriptionStatus !== "inactive") {
      if (user.stripePriceId === process.env.STRIPE_PRO_PRICE_ID) plan = PLANS.pro;
      else if (user.stripePriceId === process.env.STRIPE_GROWTH_PRICE_ID) plan = PLANS.growth;
    }
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - plan.dataHistoryDays);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const [projects, allRecentResults, enginesUsed, recentRuns] = await Promise.all([
      prisma.project.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          domain: true,
          status: true,
          competitors: true,
          prompts: {
            select: {
              id: true,
              results: {
                where: { createdAt: { gte: cutoff } },
                orderBy: { createdAt: "desc" },
                select: {
                  id: true,
                  brandMentioned: true,
                  createdAt: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.promptResult.findMany({
        where: {
          prompt: { project: { userId: user.id } },
          createdAt: { gte: fourteenDaysAgo },
        },
        select: {
          createdAt: true,
          brandMentioned: true,
        },
      }),
      prisma.promptResult.findMany({
        where: { prompt: { project: { userId: user.id } } },
        select: { engine: true },
        distinct: ["engine"],
      }),
      prisma.promptResult.findMany({
        where: { 
          prompt: { project: { userId: user.id } },
          createdAt: { gte: cutoff }
        },
        select: {
          engine: true,
          brandMentioned: true,
          mentionPosition: true,
          createdAt: true,
          prompt: { select: { text: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    let totalResults = 0;
    let mentionedResults = 0;
    let promptsRun = 0;

    for (const p of projects) {
      for (const pr of p.prompts) {
        if (pr.results.length > 0) {
          promptsRun++;
        }
        totalResults += pr.results.length;
        for (const r of pr.results) {
          if (r.brandMentioned) {
            mentionedResults++;
          }
        }
      }
    }

    const avgMentionRate = totalResults > 0
      ? Math.round((mentionedResults / totalResults) * 1000) / 10
      : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyData: { day: string; rate: number; total: number; mentioned: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().slice(0, 10);
      const dayResults = allRecentResults.filter(
        (r) => r.createdAt.toISOString().slice(0, 10) === dayStr
      );
      const dayMentioned = dayResults.filter((r) => r.brandMentioned).length;
      dailyData.push({
        day: date.toLocaleDateString("en", { weekday: "short" }),
        rate: dayResults.length > 0 ? Math.round((dayMentioned / dayResults.length) * 100) : 0,
        total: dayResults.length,
        mentioned: dayMentioned,
      });
    }

    const prevWeekResults = allRecentResults.filter(r => {
      const d = new Date(r.createdAt);
      return d >= fourteenDaysAgo && d < sevenDaysAgo;
    });
    const prevTotal = prevWeekResults.length;
    const prevMentioned = prevWeekResults.filter((r) => r.brandMentioned).length;
    const prevRate = prevTotal > 0 ? Math.round((prevMentioned / prevTotal) * 1000) / 10 : 0;
    const weeklyDelta = Math.round((avgMentionRate - prevRate) * 10) / 10;

    const projectStats = projects.map((p) => {
      const allResults = p.prompts.flatMap((pr) => pr.results);
      const pMentioned = allResults.filter((r) => r.brandMentioned).length;
      const pRate = allResults.length > 0
        ? Math.round((pMentioned / allResults.length) * 1000) / 10
        : 0;

      const thisWeekProjectResults = allResults.filter((r) => new Date(r.createdAt) >= sevenDaysAgo);
      const prevWeekProjectResults = allResults.filter(
        (r) => {
          const d = new Date(r.createdAt);
          return d < sevenDaysAgo && d >= fourteenDaysAgo;
        }
      );
      const twRate = thisWeekProjectResults.length > 0
        ? (thisWeekProjectResults.filter((r) => r.brandMentioned).length / thisWeekProjectResults.length) * 100
        : 0;
      const pwRate = prevWeekProjectResults.length > 0
        ? (prevWeekProjectResults.filter((r) => r.brandMentioned).length / prevWeekProjectResults.length) * 100
        : 0;
      const delta = Math.round((twRate - pwRate) * 10) / 10;
      const lastResult = allResults[0];

      return {
        id: p.id,
        domain: p.domain,
        competitorCount: p.competitors.length,
        promptCount: p.prompts.length,
        mentionRate: pRate,
        trend: delta >= 0 ? "up" as const : "down" as const,
        trendValue: `${delta >= 0 ? "+" : ""}${delta}%`,
        lastRun: lastResult ? getRelativeTime(new Date(lastResult.createdAt)) : "Never",
        status: p.status,
      };
    });

    return {
      totalProjects: projects.length,
      totalPrompts: promptsRun,
      totalResults,
      avgMentionRate,
      weeklyDelta,
      dailyData,
      projects: projectStats,
      enginesTracked: enginesUsed.length || 0,
      recentRuns: recentRuns.map((r) => ({
        prompt: r.prompt.text,
        engine: r.engine === "CHATGPT" ? "ChatGPT" : r.engine === "GEMINI" ? "Gemini" : "Perplexity",
        mentioned: r.brandMentioned,
        position: r.mentionPosition,
        time: getRelativeTime(new Date(r.createdAt)),
      })),
    };
  } catch (err) {
    console.error("[getDashboardData] Error:", err);
    return null;
  }
}

function getRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

import WelcomeScreen from "./WelcomeScreen";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
  if (!userId) redirect("/");

  const userRecord = await prisma.user.findUnique({
    where: { supabaseId: userId },
    select: { hasSeenWelcome: true }
  });

  if (userRecord && !userRecord.hasSeenWelcome) {
    return <WelcomeScreen />;
  }

  const data = await getDashboardData(userId);

  // If there's exactly 1 project, render the project details directly under /dashboard
  if (data && data.totalProjects === 1 && data.projects[0]) {
    const projectDetailData = await getProjectDetailData(data.projects[0].id, dbUser.supabaseId);
    if (projectDetailData) {
      return (
        <ProjectDetailClient
          project={projectDetailData.project}
          prompts={projectDetailData.prompts}
          chartData={projectDetailData.chartData}
          competitorData={projectDetailData.competitorData}
          planLimit={projectDetailData.planLimit}
          planName={projectDetailData.planName}
          maxCompetitors={projectDetailData.maxCompetitors}
          myTrend={projectDetailData.myTrend}
          isDashboardRoot={true}
        />
      );
    }
  }

  // Empty state
  if (!data || data.totalProjects === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-sm animate-fade-in-up">
            <div
              className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: "var(--color-surface-3)", color: "var(--color-fg-muted)" }}
            >
              <IconEmpty />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-3" style={{ color: "var(--color-fg)" }}>
              No projects yet
            </h1>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--color-fg-muted)" }}>
              Start monitoring your brand across ChatGPT, Gemini, and Perplexity.
              Create your first project to see how AI talks about you.
            </p>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-[transform,background-color] duration-[160ms] ease-out active:scale-[0.97] cursor-pointer"
              style={{ background: "var(--color-btn-primary-bg)", color: "var(--color-btn-primary-text)" }}
            >
              <IconPlus /> Create your first project
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const deltaUp = data.weeklyDelta >= 0;

  return (
    <div className="flex-1">
      {/* Header */}
      <header
        className="sticky top-0 z-20 px-6 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl border-b"
        style={{ background: "var(--color-header-bg)", borderColor: "var(--color-header-border)" }}
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>Overview</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-fg-muted)" }}>
            Brand visibility across all active projects
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          id="new-project-btn"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-[transform,background-color] duration-[160ms] ease-out active:scale-[0.97] cursor-pointer"
          style={{ background: "var(--color-btn-primary-bg)", color: "var(--color-btn-primary-text)" }}
        >
          <IconPlus /> New project
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">

        {/* ─── Stats bento ─── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {/* Main KPI */}
          <div className="md:col-span-3 dash-card px-7 py-6 animate-fade-in-up">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-fg-muted)" }}>
              Avg. mention rate
            </p>
            <div className="flex items-end gap-4">
              <span className="text-5xl font-bold font-mono tracking-tighter" style={{ color: "var(--color-fg)" }}>
                <AnimatedCounter value={data.avgMentionRate} suffix="%" />
              </span>
              <span
                className="inline-flex items-center gap-1 text-sm font-medium mb-1.5"
                style={{ color: deltaUp ? "#10b981" : "#ef4444" }}
              >
                <IconTrend up={deltaUp} />
                {deltaUp ? "+" : ""}{data.weeklyDelta}% vs last week
              </span>
            </div>
            <div className="mt-5 h-[100px]">
              <TrendChart data={data.dailyData} />
            </div>
          </div>

          {/* Results collected */}
          <div className="md:col-span-2 dash-card px-7 py-6 flex flex-col justify-between animate-fade-in-up" style={{ animationDelay: "50ms" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--color-fg-muted)" }}>
              Results collected
            </p>
            <span className="text-4xl font-bold font-mono tracking-tighter" style={{ color: "var(--color-fg)" }}>
              <AnimatedCounter value={data.totalResults} />
            </span>
            <p className="text-xs mt-auto pt-3" style={{ color: "var(--color-fg-muted)" }}>
              Across all engines and projects
            </p>
          </div>

          {/* Three smaller stats */}
          {[
            { label: "Active projects", value: data.totalProjects },
            { label: "Prompts run", value: data.totalPrompts },
            { label: "Engines tracked", value: data.enginesTracked || 3 },
          ].map((s, i) => (
            <div
              key={s.label}
              className="dash-card px-5 py-5 animate-fade-in-up"
              style={{ animationDelay: `${100 + i * 50}ms` }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-fg-muted)" }}>
                {s.label}
              </p>
              <span className="text-3xl font-bold font-mono" style={{ color: "var(--color-fg)" }}>
                <AnimatedCounter value={s.value} />
              </span>
            </div>
          ))}
        </div>

        {/* ─── Main content 2/3 + 1/3 ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* Projects table */}
          <div className="dash-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h2 className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>Projects</h2>
              <Link
                href="/dashboard/projects/new"
                className="inline-flex items-center gap-1 text-xs font-medium transition-colors duration-[160ms] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              >
                <IconPlus /> Add project
              </Link>
            </div>

            <div>
              {data.projects.map((project, i) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  id={`project-${project.id}`}
                  className="flex items-center gap-4 px-6 py-4 transition-[background-color] duration-[160ms] cursor-pointer group border-b last:border-b-0 hover:bg-[var(--color-sidebar-hover-bg)]"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  {/* Status dot */}
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${project.status === "generating" ? "pulse-dot-yellow" : "pulse-dot-green"}`}
                    style={{ background: project.status === "generating" ? "#f59e0b" : "#10b981" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold tracking-tight truncate" style={{ color: "var(--color-fg)" }}>
                      {project.domain}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-fg-muted)" }}>
                      {project.competitorCount} competitor{project.competitorCount !== 1 ? "s" : ""} · {project.promptCount} prompts · {project.lastRun}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {project.status === "generating" ? (
                      <span className="text-xs font-medium" style={{ color: "var(--color-fg-muted)" }}>Setting up…</span>
                    ) : (
                      <>
                        <p
                          className="text-lg font-bold font-mono"
                          style={{ color: project.mentionRate >= 70 ? "#10b981" : project.mentionRate >= 40 ? "#f59e0b" : "#ef4444" }}
                        >
                          {project.mentionRate}%
                        </p>
                        <p
                          className="text-[11px] font-mono flex items-center justify-end gap-0.5"
                          style={{ color: project.trend === "up" ? "#10b981" : "#ef4444" }}
                        >
                          <IconTrend up={project.trend === "up"} />
                          {project.trendValue}
                        </p>
                      </>
                    )}
                  </div>
                  <span style={{ color: "var(--color-fg-muted)" }}>
                    <IconChevronRight />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent runs */}
          <div className="dash-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            <div
              className="px-5 py-4 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h2 className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>Recent runs</h2>
            </div>

            {data.recentRuns.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>No prompt runs yet.</p>
                <p className="text-xs mt-1" style={{ color: "var(--color-fg-subtle)" }}>
                  Run prompts from a project to see results here.
                </p>
              </div>
            ) : (
              <div>
                {data.recentRuns.map((run, i) => (
                  <div
                    key={i}
                    className="px-5 py-4 border-b last:border-b-0"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm line-clamp-2 leading-snug flex-1" style={{ color: "var(--color-fg)" }}>
                        {run.prompt}
                      </p>
                      <span
                        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background: run.mentioned ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.10)",
                          color: run.mentioned ? "#10b981" : "#ef4444",
                        }}
                      >
                        {run.mentioned ? <IconCheck /> : <IconX />}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: "var(--color-input-bg)",
                          border: "1px solid var(--color-border)",
                          color: "var(--color-fg-muted)",
                        }}
                      >
                        {run.engine}
                      </span>
                      <span className="text-[11px] font-mono" style={{ color: "var(--color-fg-muted)" }}>
                        {run.mentioned ? `Position #${run.position}` : "Not mentioned"}
                      </span>
                      <span className="text-[11px] font-mono ml-auto" style={{ color: "var(--color-fg-subtle)" }}>
                        {run.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
