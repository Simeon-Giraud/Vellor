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

  // Greeting based on time of day (server-side, UTC-aware)
  const hour = new Date().getUTCHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Today's date string
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Engine color map
  const engineColors: Record<string, string> = {
    ChatGPT: "#10a37f",
    Gemini: "#0071e3",
    Perplexity: "#ff6b00",
  };

  // KPI data (no accent color references)
  const kpiTiles = [
    { label: "Mention rate", value: data.avgMentionRate, suffix: "%", trend: deltaUp, trendLabel: `${deltaUp ? "+" : ""}${data.weeklyDelta}%` },
    { label: "Results collected", value: data.totalResults, suffix: "", trend: null as null, trendLabel: null as null },
    { label: "Prompts run", value: data.totalPrompts, suffix: "", trend: null as null, trendLabel: null as null },
    { label: "Active projects", value: data.totalProjects, suffix: "", trend: null as null, trendLabel: null as null },
  ];

  return (
    <div className="flex-1" style={{ color: "var(--color-fg)" }}>

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-20 px-6 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl border-b"
        style={{ background: "var(--color-header-bg)", borderColor: "var(--color-header-border)" }}
      >
        <div className="fade-up">
          <p className="text-[11px] font-medium uppercase tracking-widest mb-0.5" style={{ color: "var(--color-fg-muted)" }}>
            {greeting}
          </p>
          <h1 className="text-xl font-bold tracking-tight leading-none" style={{ color: "var(--color-fg)" }}>
            Overview
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs" style={{ color: "var(--color-fg-subtle)" }}>{today}</span>
          <Link
            href="/dashboard/projects/new"
            id="new-project-btn"
            className="btn-black inline-flex items-center gap-1.5"
            style={{ fontSize: "13px", padding: "8px 16px", borderRadius: "980px" }}
          >
            <IconPlus /> New project
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 space-y-5">

        {/* ── KPI row — 4 flat stat tiles ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpiTiles.map((tile, i) => (
            <div
              key={tile.label}
              className={`dash-card px-5 py-5 fade-up ${["fade-up-d1","fade-up-d2","fade-up-d3","fade-up-d4"][i]}`}
            >
              <p className="text-[11px] font-medium mb-3" style={{ color: "var(--color-fg-muted)" }}>
                {tile.label}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-fg)", lineHeight: 1 }}>
                  <AnimatedCounter value={tile.value} suffix={tile.suffix} />
                </span>
                {tile.trend !== null && tile.trendLabel && (
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: tile.trend ? "#10b981" : "#ef4444" }}
                  >
                    {tile.trendLabel}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Trend chart ── */}
        <div className="dash-card overflow-hidden fade-up fade-up-d3" style={{ display: "flex", minHeight: 160 }}>
          <div
            className="px-7 py-6 flex flex-col justify-center shrink-0"
            style={{ borderRight: "1px solid var(--color-border)", minWidth: 190, maxWidth: 210 }}
          >
            <p className="text-[11px] font-medium mb-2" style={{ color: "var(--color-fg-muted)" }}>Avg. mention rate</p>
            <span className="text-5xl font-bold tracking-tighter leading-none" style={{ color: "var(--color-fg)" }}>
              <AnimatedCounter value={data.avgMentionRate} suffix="%" />
            </span>
            <span
              className="text-[12px] font-medium mt-2"
              style={{ color: deltaUp ? "#10b981" : "#ef4444" }}
            >
              {deltaUp ? "▲" : "▼"} {deltaUp ? "+" : ""}{data.weeklyDelta}% vs last week
            </span>
          </div>
          <div className="flex-1 px-6 py-5 min-w-0" style={{ minHeight: 140 }}>
            <TrendChart data={data.dailyData} />
          </div>
        </div>

        {/* ── Projects + Recent runs ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

          {/* Projects list */}
          <div className="dash-card overflow-hidden fade-up fade-up-d4">
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <p className="text-[13px] font-semibold" style={{ color: "var(--color-fg)" }}>
                Projects
                <span className="ml-1.5 text-[11px] font-normal" style={{ color: "var(--color-fg-subtle)" }}>
                  {data.totalProjects}
                </span>
              </p>
              <Link
                href="/dashboard/projects/new"
                className="text-[12px] font-medium transition-colors duration-150"
                style={{ color: "var(--color-fg-muted)" }}
              >
                + Add
              </Link>
            </div>

            {data.projects.map((project, i) => {
              const rateColor =
                project.status === "generating"
                  ? "var(--color-fg-muted)"
                  : project.mentionRate >= 70
                  ? "#10b981"
                  : project.mentionRate >= 40
                  ? "#f59e0b"
                  : "#ef4444";

              return (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  id={`project-${project.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 transition-colors duration-150 group"
                  style={{
                    borderBottom: i < data.projects.length - 1 ? "1px solid var(--color-border)" : undefined,
                    textDecoration: "none",
                    background: "transparent",
                  }}
                  onMouseEnter={undefined}
                >
                  {/* Status dot */}
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      project.status === "generating" ? "pulse-dot-yellow" : "pulse-dot-green"
                    }`}
                    style={{ background: project.status === "generating" ? "#f59e0b" : "#10b981" }}
                  />

                  {/* Domain */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold truncate" style={{ color: "var(--color-fg)" }}>
                      {project.domain}
                    </p>
                    <p className="text-[12px] mt-0.5" style={{ color: "var(--color-fg-subtle)" }}>
                      {project.promptCount} prompt{project.promptCount !== 1 ? "s" : ""} · {project.competitorCount} competitor{project.competitorCount !== 1 ? "s" : ""} · {project.lastRun}
                    </p>
                  </div>

                  {/* Rate + trend */}
                  <div className="text-right shrink-0">
                    {project.status === "generating" ? (
                      <span className="text-[12px]" style={{ color: "var(--color-fg-muted)" }}>Setting up…</span>
                    ) : (
                      <>
                        <p className="text-[15px] font-bold tabular-nums" style={{ color: rateColor }}>
                          {project.mentionRate}%
                        </p>
                        <p className="text-[11px] font-medium" style={{ color: project.trend === "up" ? "#10b981" : "#ef4444" }}>
                          {project.trendValue}
                        </p>
                      </>
                    )}
                  </div>

                  <span style={{ color: "var(--color-fg-subtle)" }}><IconChevronRight /></span>
                </Link>
              );
            })}
          </div>

          {/* Recent runs */}
          <div className="dash-card overflow-hidden fade-up fade-up-d5">
            <div
              className="px-5 py-4"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <p className="text-[13px] font-semibold" style={{ color: "var(--color-fg)" }}>Recent runs</p>
            </div>

            {data.recentRuns.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm" style={{ color: "var(--color-fg-muted)" }}>No runs yet.</p>
                <p className="text-xs mt-1" style={{ color: "var(--color-fg-subtle)" }}>Run prompts from a project.</p>
              </div>
            ) : (
              <div>
                {data.recentRuns.map((run, i) => {
                  const engineColor = engineColors[run.engine] ?? "var(--color-fg-muted)";
                  return (
                    <div
                      key={i}
                      className="px-4 py-3 flex items-start gap-3"
                      style={{
                        borderBottom: i < data.recentRuns.length - 1 ? "1px solid var(--color-border)" : undefined,
                      }}
                    >
                      {/* Engine dot */}
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ background: engineColor }}
                        title={run.engine}
                      />
                      {/* Prompt + meta */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] leading-snug truncate" style={{ color: "var(--color-fg)" }}>
                          {run.prompt}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--color-fg-subtle)" }}>
                          {run.engine} · {run.time}
                        </p>
                      </div>
                      {/* Mentioned */}
                      <span
                        className="text-[11px] font-medium shrink-0 mt-0.5"
                        style={{ color: run.mentioned ? "#10b981" : "var(--color-fg-subtle)" }}
                      >
                        {run.mentioned ? "✓" : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
