import { getCurrentDbUser } from "@/lib/auth";

import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getHistoryCutoff } from "@/lib/usage";
import AnimatedCounter from "@/components/AnimatedCounter";
import TrendChart from "@/components/TrendChart";
import DashboardNotice from "@/components/DashboardNotice";

export const metadata: Metadata = { title: "Dashboard — Vellor" };

/* ─── taste-skill + Emil + ui-ux-pro-max applied throughout:
 *   - Geist + Geist Mono typography
 *   - Asymmetric bento stats (not 4 equal cards)
 *   - divide-y rows for project list
 *   - Organic data, no fake round numbers
 *   - Staggered entrance animations via CSS
 *   - 160ms ease-out transitions on interactive elements
 *   - Monospace for all numbers
 *   - Empty state with premium CTA
 ─────────────────────────────────────────────────────── */

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
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9"/>
  </svg>
);

async function getDashboardData(supabaseId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { supabaseId },
      select: { id: true },
    });

    if (!user) return null;

    const cutoff = await getHistoryCutoff(supabaseId);

    // Active projects
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        prompts: {
          include: {
            results: {
              where: { createdAt: { gte: cutoff } },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Total results
    const totalResults = await prisma.promptResult.count({
      where: { 
        prompt: { project: { userId: user.id } },
        createdAt: { gte: cutoff }
      },
    });

    // Prompts with at least one result
    const promptsRun = await prisma.prompt.count({
      where: {
        project: { userId: user.id },
        results: { some: { createdAt: { gte: cutoff } } },
      },
    });

    // Mention rate
    const mentionedResults = await prisma.promptResult.count({
      where: {
        prompt: { project: { userId: user.id } },
        brandMentioned: true,
        createdAt: { gte: cutoff }
      },
    });

    const avgMentionRate = totalResults > 0
      ? Math.round((mentionedResults / totalResults) * 1000) / 10
      : 0;

    // 7-day trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentResults = await prisma.promptResult.findMany({
      where: {
        prompt: { project: { userId: user.id } },
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true, brandMentioned: true },
      orderBy: { createdAt: "asc" },
    });

    // Group by day
    const dailyData: { day: string; rate: number; total: number; mentioned: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().slice(0, 10);
      const dayResults = recentResults.filter(
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

    // Weekly delta
    const thisWeekRate = avgMentionRate;
    const prevWeekResults = await prisma.promptResult.findMany({
      where: {
        prompt: { project: { userId: user.id } },
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 14)),
          lt: sevenDaysAgo,
        },
      },
      select: { brandMentioned: true },
    });
    const prevTotal = prevWeekResults.length;
    const prevMentioned = prevWeekResults.filter((r) => r.brandMentioned).length;
    const prevRate = prevTotal > 0 ? Math.round((prevMentioned / prevTotal) * 1000) / 10 : 0;
    const weeklyDelta = Math.round((thisWeekRate - prevRate) * 10) / 10;

    // Per-project stats
    const projectStats = projects.map((p) => {
      const allResults = p.prompts.flatMap((pr) => pr.results);
      const pMentioned = allResults.filter((r) => r.brandMentioned).length;
      const pRate = allResults.length > 0
        ? Math.round((pMentioned / allResults.length) * 1000) / 10
        : 0;

      // Week-over-week delta for this project
      const thisWeekProjectResults = allResults.filter(
        (r) => r.createdAt >= sevenDaysAgo
      );
      const prevWeekProjectResults = allResults.filter(
        (r) => r.createdAt < sevenDaysAgo && r.createdAt >= new Date(new Date().setDate(new Date().getDate() - 14))
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
        lastRun: lastResult ? getRelativeTime(lastResult.createdAt) : "Never",
        status: p.status,
      };
    });

    // Engines tracked — only engines that have results
    const enginesUsed = await prisma.promptResult.findMany({
      where: { prompt: { project: { userId: user.id } } },
      select: { engine: true },
      distinct: ["engine"],
    });

    // Recent runs
    const recentRuns = await prisma.promptResult.findMany({
      where: { 
        prompt: { project: { userId: user.id } },
        createdAt: { gte: cutoff }
      },
      include: { prompt: { select: { text: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
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
        time: getRelativeTime(r.createdAt),
      })),
    };
  } catch {
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

export default async function DashboardPage() {
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

  // Empty state — no user or no projects
  if (!data || data.totalProjects === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <Suspense><DashboardNotice /></Suspense>
        <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-indigo-500/8 border border-indigo-500/15 flex items-center justify-center text-indigo-400 mb-6">
            <IconEmpty />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-3">
            No projects yet
          </h1>
          <p className="text-[var(--color-fg-muted)] text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            Start monitoring your brand across ChatGPT, Gemini, and Perplexity.
            Create your first project to see how AI talks about you.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-[transform,background-color] duration-[160ms] ease-out active:scale-[0.97] glow-indigo cursor-pointer"
          >
            <IconPlus /> Create your first project
          </Link>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Suspense><DashboardNotice /></Suspense>
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 px-6 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl bg-[rgba(10,10,15,0.8)]">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-[var(--color-fg-muted)] text-xs mt-0.5">
            Brand visibility across all active projects
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          id="new-project-btn"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-[transform,background-color] duration-[160ms] ease-out active:scale-[0.97] glow-indigo cursor-pointer"
        >
          <IconPlus /> New project
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        {/* ─── Stats — asymmetric bento ─── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {/* Main KPI — wide */}
          <div className="md:col-span-3 glass rounded-2xl px-7 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] animate-fade-in-up">
            <p className="text-xs font-medium text-[var(--color-fg-muted)] uppercase tracking-widest mb-2">Avg. mention rate</p>
            <div className="flex items-end gap-4">
              <span className="text-5xl font-bold text-white font-mono tracking-tighter">
                <AnimatedCounter value={data.avgMentionRate} suffix="%" />
              </span>
              <span className={`inline-flex items-center gap-1 text-sm font-medium mb-1.5 ${data.weeklyDelta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                <IconTrend up={data.weeklyDelta >= 0} />
                {data.weeklyDelta >= 0 ? "+" : ""}{data.weeklyDelta}% vs last week
              </span>
            </div>
            {/* 7-day trend chart */}
            <div className="mt-5 h-[100px]">
              <TrendChart data={data.dailyData} />
            </div>
          </div>

          {/* Secondary KPI */}
          <div className="md:col-span-2 glass rounded-2xl px-7 py-6 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] animate-fade-in-up" style={{ animationDelay: "50ms" }}>
            <p className="text-xs font-medium text-[var(--color-fg-muted)] uppercase tracking-widest mb-1">Results collected</p>
            <span className="text-4xl font-bold text-white font-mono tracking-tighter">
              <AnimatedCounter value={data.totalResults} />
            </span>
            <p className="text-xs text-[var(--color-fg-muted)] mt-auto pt-3">Across all engines and projects</p>
          </div>

          {/* Three smaller stats */}
          {[
            { label: "Active projects", value: data.totalProjects },
            { label: "Prompts run", value: data.totalPrompts },
            { label: "Engines tracked", value: data.enginesTracked || 3 },
          ].map((s, i) => (
            <div
              key={s.label}
              className="glass rounded-2xl px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] animate-fade-in-up"
              style={{ animationDelay: `${100 + i * 50}ms` }}
            >
              <p className="text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-widest mb-1.5">{s.label}</p>
              <span className="text-3xl font-bold text-white font-mono">
                <AnimatedCounter value={s.value} />
              </span>
            </div>
          ))}
        </div>

        {/* ─── Main content — 2/3 + 1/3 ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* Projects table */}
          <div className="glass rounded-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-[15px] font-semibold text-white tracking-tight">Projects</h2>
              <Link href="/dashboard/projects/new" className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors duration-[160ms] font-medium cursor-pointer">
                <IconPlus /> Add project
              </Link>
            </div>

            <div className="divide-y divide-white/5">
              {data.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  id={`project-${project.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-[background-color] duration-[160ms] cursor-pointer group"
                >
                  <div className="w-2 h-2 rounded-full bg-indigo-400 pulse-dot shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-white tracking-tight truncate">{project.domain}</p>
                    <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">
                      {project.competitorCount} competitor{project.competitorCount !== 1 ? "s" : ""} · {project.promptCount} prompts · {project.lastRun}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {project.status === "generating" ? (
                      <div className="flex items-center justify-end gap-2 h-full">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 pulse-dot" />
                        <span className="text-xs text-indigo-400 font-medium">Setting up...</span>
                      </div>
                    ) : (
                      <>
                        <p className={`text-lg font-bold font-mono ${project.mentionRate >= 70 ? "text-emerald-400" : project.mentionRate >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                          {project.mentionRate}%
                        </p>
                        <p className={`text-[11px] font-mono flex items-center justify-end gap-0.5 ${project.trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                          <IconTrend up={project.trend === "up"} />
                          {project.trendValue}
                        </p>
                      </>
                    )}
                  </div>
                  <span className="text-[var(--color-fg-muted)] group-hover:text-white/50 transition-colors duration-[160ms]">
                    <IconChevronRight />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent runs */}
          <div className="glass rounded-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] animate-fade-in-up" style={{ animationDelay: "250ms" }}>
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-[15px] font-semibold text-white tracking-tight">Recent runs</h2>
            </div>

            {data.recentRuns.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-[var(--color-fg-muted)] text-sm">No prompt runs yet.</p>
                <p className="text-[var(--color-fg-muted)] text-xs mt-1">Run prompts from a project to see results here.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {data.recentRuns.map((run, i) => (
                  <div key={i} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm text-[var(--color-fg)] line-clamp-2 leading-snug flex-1">{run.prompt}</p>
                      <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${run.mentioned ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        {run.mentioned ? <IconCheck /> : <IconX />}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/12 text-indigo-300 border border-indigo-500/15 font-medium">
                        {run.engine}
                      </span>
                      <span className="text-[11px] text-[var(--color-fg-muted)] font-mono">
                        {run.mentioned ? `Position #${run.position}` : "Not mentioned"}
                      </span>
                      <span className="text-[11px] text-[var(--color-fg-muted)] ml-auto font-mono">{run.time}</span>
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
