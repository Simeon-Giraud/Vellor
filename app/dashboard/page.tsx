import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — Vellor" };

/* ─── taste-skill: Dashboard Design Plan ──────────────────────────────────
 * DESIGN_VARIANCE: 8 (asymmetric bento, not 4-equal-stat-cards)
 * MOTION_INTENSITY: 6 (CSS stagger, no Framer Motion dependency needed)
 * VISUAL_DENSITY: 6 (structured, readable — not cockpit-dense)
 * Font: Geist + Geist Mono for all numbers
 * Colors: Zinc-950 base, single Indigo accent, NO neon/purple glows
 * Stats: organic values (47.2%, not 50%) — no fake round numbers
 * Layout: divide-y for recent runs (no card overuse)
 * Hero: left-aligned page title, NOT centered
 ─────────────────────────────────────────────────────────────────────────── */

// Organic mock data (taste-skill: no predictable round numbers, no "Acme")
const MOCK_STATS = {
  totalProjects: 7,
  totalPrompts: 143,
  totalResults: 1047,
  avgMentionRate: 74.3,
  weeklyDelta: +5.2,
};

const MOCK_PROJECTS = [
  {
    id: "proj_1",
    domain: "vertexify.io",
    competitors: ["altflow.ai", "rankpilot.co"],
    promptCount: 47,
    mentionRate: 81.4,
    lastRun: "9 min ago",
    trend: "up",
    trendValue: "+6.2%",
  },
  {
    id: "proj_2",
    domain: "threadwell.com",
    competitors: ["loopcast.io"],
    promptCount: 31,
    mentionRate: 58.7,
    lastRun: "3 hr ago",
    trend: "down",
    trendValue: "−2.1%",
  },
  {
    id: "proj_3",
    domain: "grainhaus.co",
    competitors: ["pellucid.app", "fovea.io", "chartpost.ai"],
    promptCount: 65,
    mentionRate: 91.2,
    lastRun: "22 min ago",
    trend: "up",
    trendValue: "+11.4%",
  },
];

const MOCK_RECENT_RUNS = [
  { prompt: "Best AI monitoring platforms for brand teams", engine: "ChatGPT",    mentioned: true,  position: 2, time: "4m ago"  },
  { prompt: "Top SaaS brand intelligence tools in 2025",   engine: "Gemini",     mentioned: true,  position: 1, time: "17m ago" },
  { prompt: "GEO optimization platforms compared",          engine: "Perplexity", mentioned: false, position: null, time: "1h ago"  },
  { prompt: "Brand monitoring software for startups",       engine: "Gemini",     mentioned: true,  position: 3, time: "2h ago"  },
  { prompt: "AI search visibility tracking tools",          engine: "ChatGPT",    mentioned: true,  position: 1, time: "3h ago"  },
];

// SVG icons — no emojis
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

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>

      {/* ─── Top bar ─── */}
      <header className="sticky top-0 z-20 border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl bg-[rgba(10,10,15,0.8)] shadow-[inset_0_-1px_0_rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[11px] font-bold shadow-[0_2px_8px_-2px_rgba(79,70,229,0.4)]">
              V
            </div>
            <span className="text-white font-semibold text-sm hidden sm:inline tracking-tight">Vellor</span>
          </Link>
          <span className="text-white/20 hidden sm:inline text-sm">/</span>
          <span className="text-[var(--color-fg-muted)] text-sm hidden sm:inline">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/projects/new"
            id="new-project-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-[transform,background-color] duration-[160ms] ease-out active:scale-[0.97] cursor-pointer glow-indigo"
          >
            <IconPlus /> New project
          </Link>
          <UserButton />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">

        {/* ─── Page title — left-aligned, not centered (taste-skill DESIGN_VARIANCE 8) */}
        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-[var(--color-fg-muted)] text-sm mt-1">
            Brand visibility across all active projects — updated in real time.
          </p>
        </div>

        {/* ─── Stats — asymmetric bento (taste-skill: not 4 equal cards) ─── */}
        {/* Row 1: 2-col 60/40 split | Row 2: 3-col */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {/* Main KPI — wide cell */}
          <div className="md:col-span-3 glass rounded-2xl px-7 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <p className="text-xs font-medium text-[var(--color-fg-muted)] uppercase tracking-widest mb-2">Avg. mention rate</p>
            <div className="flex items-end gap-4">
              <span className="text-5xl font-bold text-white font-mono tracking-tighter">{MOCK_STATS.avgMentionRate}%</span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 mb-1.5">
                <IconTrend up /> +{MOCK_STATS.weeklyDelta}% vs last week
              </span>
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-1 mt-5 h-10">
              {[58,63,61,69,72,70,74].map((v, i) => (
                <div key={i} className="flex-1 rounded-sm" style={{ height: `${(v/100)*100}%`, background: i === 6 ? "rgba(79,70,229,0.7)" : "rgba(255,255,255,0.08)" }} />
              ))}
            </div>
            <p className="text-[10px] text-[var(--color-fg-muted)] mt-1.5 font-mono">7-day trend</p>
          </div>

          {/* Secondary KPI */}
          <div className="md:col-span-2 glass rounded-2xl px-7 py-6 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <p className="text-xs font-medium text-[var(--color-fg-muted)] uppercase tracking-widest mb-1">Results collected</p>
            <span className="text-4xl font-bold text-white font-mono tracking-tighter">{MOCK_STATS.totalResults.toLocaleString()}</span>
            <p className="text-xs text-[var(--color-fg-muted)] mt-auto pt-3">Across all engines and projects</p>
          </div>

          {/* Three smaller stats */}
          {[
            { label: "Active projects", value: MOCK_STATS.totalProjects.toString() },
            { label: "Prompts run",     value: MOCK_STATS.totalPrompts.toString() },
            { label: "Engines tracked", value: "3" },
          ].map(s => (
            <div key={s.label} className="md:col-span-1 glass rounded-2xl px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" style={{ gridColumn: "span 1" }}>
              <p className="text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-widest mb-1.5">{s.label}</p>
              <span className="text-3xl font-bold text-white font-mono">{s.value}</span>
            </div>
          ))}

          {/* Invisible filler to force 3-col last row to 5-col total: handled by auto grid */}
          <div className="md:col-span-2 md:hidden" aria-hidden />
        </div>

        {/* ─── Main content — asymmetric 2/3 + 1/3 split ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* Projects table */}
          <div className="glass rounded-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-[15px] font-semibold text-white tracking-tight">Projects</h2>
              <Link href="/dashboard/projects/new" className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors duration-[160ms] font-medium cursor-pointer">
                <IconPlus /> Add project
              </Link>
            </div>

            {/* divide-y rows (taste-skill: no card overuse for lists) */}
            <div className="divide-y divide-white/5">
              {MOCK_PROJECTS.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  id={`project-${project.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors duration-[160ms] cursor-pointer group"
                >
                  {/* Status dot */}
                  <div className="w-2 h-2 rounded-full bg-indigo-400 pulse-dot shrink-0" />

                  {/* Domain + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-white tracking-tight truncate">{project.domain}</p>
                    <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">
                      {project.competitors.length} competitor{project.competitors.length !== 1 ? "s" : ""} · {project.promptCount} prompts · {project.lastRun}
                    </p>
                  </div>

                  {/* Mention rate */}
                  <div className="text-right shrink-0">
                    <p className={`text-lg font-bold font-mono ${project.mentionRate >= 70 ? "text-emerald-400" : "text-yellow-400"}`}>
                      {project.mentionRate}%
                    </p>
                    <p className={`text-[11px] font-mono flex items-center justify-end gap-0.5 ${project.trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                      <IconTrend up={project.trend === "up"} />
                      {project.trendValue}
                    </p>
                  </div>

                  <IconChevronRight />
                </Link>
              ))}
            </div>

            {MOCK_PROJECTS.length === 0 && (
              <div className="px-6 py-16 text-center">
                <p className="text-[var(--color-fg-muted)] text-sm">No projects yet.</p>
                <Link href="/dashboard/projects/new" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-[transform,background-color] duration-[160ms] active:scale-[0.97] cursor-pointer">
                  <IconPlus /> Create your first project
                </Link>
              </div>
            )}
          </div>

          {/* Recent runs — sidebar */}
          <div className="glass rounded-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-[15px] font-semibold text-white tracking-tight">Recent runs</h2>
            </div>

            <div className="divide-y divide-white/5">
              {MOCK_RECENT_RUNS.map((run, i) => (
                <div key={i} className="px-5 py-4">
                  {/* Prompt + result badge */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm text-[var(--color-fg)] line-clamp-2 leading-snug flex-1">{run.prompt}</p>
                    <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${run.mentioned ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                      {run.mentioned ? <IconCheck /> : <IconX />}
                    </span>
                  </div>

                  {/* Engine + position + time */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
