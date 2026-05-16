import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getHistoryCutoff } from "@/lib/usage";
import ProjectCharts from "@/components/ProjectCharts";
import RunButton from "@/components/RunButton";

export const metadata: Metadata = { title: "Project Details — Vellor" };

const ENGINE_LABELS: Record<string, string> = {
  CHATGPT: "ChatGPT",
  GEMINI: "Gemini",
  PERPLEXITY: "Perplexity",
};

const ENGINE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  ChatGPT: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  Gemini: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
  Perplexity: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400" },
};

// SVG icons
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
const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

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

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { id } = await params;

  let project;
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    if (!user) redirect("/dashboard");

    const cutoff = await getHistoryCutoff(userId);

    project = await prisma.project.findFirst({
      where: { id, userId: user.id },
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
  } catch {
    // DB not connected
    project = null;
  }

  if (!project) notFound();

  // Compute stats
  const allResults = project.prompts.flatMap((p) => p.results);
  const mentionedCount = allResults.filter((r) => r.brandMentioned).length;
  const mentionRate = allResults.length > 0
    ? Math.round((mentionedCount / allResults.length) * 1000) / 10
    : 0;

  // Daily mention rate per engine for chart
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentResults = allResults.filter((r) => r.createdAt >= sevenDaysAgo);

  const chartData: { day: string; ChatGPT: number; Gemini: number; Perplexity: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStr = date.toISOString().slice(0, 10);
    const dayResults = recentResults.filter((r) => r.createdAt.toISOString().slice(0, 10) === dayStr);

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

  // Competitor mention rates
  const competitorData = project.competitors.map((comp) => {
    // Count how many results mention the competitor
    const compMentions = allResults.filter((r) =>
      r.response.toLowerCase().includes(comp.toLowerCase())
    ).length;
    const compRate = allResults.length > 0
      ? Math.round((compMentions / allResults.length) * 1000) / 10
      : 0;
    return { domain: comp, mentionRate: compRate };
  });

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 px-6 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl bg-[rgba(10,10,15,0.8)]">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/8 flex items-center justify-center text-[var(--color-fg-muted)] hover:text-white transition-[background-color,color] duration-[160ms] ease-out"
          >
            <IconBack />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-dot" />
            <h1 className="text-lg font-bold text-white tracking-tight">{project.domain}</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 ml-2">
            {project.competitors.map((c) => (
              <span key={c} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-[var(--color-fg-muted)]">
                vs {c}
              </span>
            ))}
          </div>
        </div>
        <RunButton projectId={project.id} />
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Prompts", value: project.prompts.length.toString() },
            { label: "Total results", value: allResults.length.toString() },
            { label: "Mentioned", value: mentionedCount.toString(), color: "text-emerald-400" },
            { label: "Mention rate", value: `${mentionRate}%`, color: mentionRate >= 60 ? "text-emerald-400" : "text-yellow-400" },
          ].map((s, i) => (
            <div
              key={s.label}
              className="glass rounded-2xl px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <p className="text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-widest mb-1.5">{s.label}</p>
              <span className={`text-2xl font-bold font-mono ${s.color || "text-white"}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Mention rate over time chart */}
        <div className="glass rounded-2xl p-6 mb-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <h2 className="text-[15px] font-semibold text-white tracking-tight mb-4">Mention rate by engine — 7 days</h2>
          <div className="h-[220px]">
            <ProjectCharts data={chartData} />
          </div>
        </div>

        {/* Competitor comparison */}
        {competitorData.length > 0 && (
          <div className="glass rounded-2xl overflow-hidden mb-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="px-6 py-4 border-b border-white/5">
              <h2 className="text-[15px] font-semibold text-white tracking-tight">Competitor comparison</h2>
            </div>
            <div className="divide-y divide-white/5">
              {/* Your brand */}
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                <span className="text-sm font-medium text-white flex-1">{project.domain}</span>
                <div className="flex items-center gap-3 w-48">
                  <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500/70" style={{ width: `${mentionRate}%` }} />
                  </div>
                  <span className="text-sm font-bold font-mono text-indigo-400 w-14 text-right">{mentionRate}%</span>
                </div>
              </div>
              {competitorData.map((comp) => (
                <div key={comp.domain} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-2 h-2 rounded-full bg-white/20 shrink-0" />
                  <span className="text-sm text-[var(--color-fg-muted)] flex-1">{comp.domain}</span>
                  <div className="flex items-center gap-3 w-48">
                    <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                      <div className="h-full rounded-full bg-white/20" style={{ width: `${comp.mentionRate}%` }} />
                    </div>
                    <span className="text-sm font-mono text-[var(--color-fg-muted)] w-14 text-right">{comp.mentionRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prompt results table */}
        <div className="glass rounded-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] animate-fade-in-up" style={{ animationDelay: "250ms" }}>
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="text-[15px] font-semibold text-white tracking-tight">Prompt results</h2>
          </div>

          {/* Table header */}
          <div className="hidden md:grid grid-cols-[1fr_120px_120px_120px] gap-4 px-6 py-3 border-b border-white/5 text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wider">
            <span>Prompt</span>
            <span className="text-center">ChatGPT</span>
            <span className="text-center">Gemini</span>
            <span className="text-center">Perplexity</span>
          </div>

          <div className="divide-y divide-white/5">
            {project.prompts.map((prompt) => {
              const resultsByEngine: Record<string, typeof prompt.results[0] | undefined> = {};
              for (const r of prompt.results) {
                const label = ENGINE_LABELS[r.engine];
                if (!resultsByEngine[label]) resultsByEngine[label] = r;
              }

              return (
                <div key={prompt.id} className="md:grid md:grid-cols-[1fr_120px_120px_120px] gap-4 px-6 py-4 items-center">
                  <p className="text-sm text-[var(--color-fg)] mb-2 md:mb-0 leading-snug">{prompt.text}</p>

                  {["ChatGPT", "Gemini", "Perplexity"].map((engine) => {
                    const result = resultsByEngine[engine];
                    if (!result) {
                      return (
                        <div key={engine} className="flex items-center justify-center">
                          <span className="text-[11px] text-[var(--color-fg-muted)]">—</span>
                        </div>
                      );
                    }
                    return (
                      <div key={engine} className="flex items-center justify-center">
                        {result.brandMentioned ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-400 border border-emerald-500/15 font-medium">
                            <IconCheck /> #{result.mentionPosition}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-500/8 text-red-400 border border-red-500/12">
                            <IconX /> Miss
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add prompt CTA */}
        <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <p className="text-[var(--color-fg-muted)] text-sm mb-3">Add more prompts to expand monitoring coverage</p>
          <button
            id="add-prompt-btn"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-[transform,background-color] duration-[160ms] ease-out active:scale-[0.97] glow-indigo cursor-pointer"
          >
            + Add prompt
          </button>
        </div>
      </div>
    </div>
  );
}
