import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

// Mock data — replace with real DB queries
const MOCK_STATS = {
  totalProjects: 3,
  totalPrompts: 12,
  totalResults: 87,
  avgMentionRate: 68,
};

const MOCK_PROJECTS = [
  {
    id: "proj_1",
    domain: "acme-saas.com",
    competitors: ["rival.io", "competitor.com"],
    promptCount: 5,
    mentionRate: 72,
    lastRun: "2 hours ago",
    trend: "up",
  },
  {
    id: "proj_2",
    domain: "mybrand.co",
    competitors: ["other.io"],
    promptCount: 4,
    mentionRate: 55,
    lastRun: "1 day ago",
    trend: "down",
  },
  {
    id: "proj_3",
    domain: "startup.app",
    competitors: ["bigcorp.com", "rival.ai", "compX.io"],
    promptCount: 3,
    mentionRate: 80,
    lastRun: "3 hours ago",
    trend: "up",
  },
];

const MOCK_RECENT_RUNS = [
  { prompt: "Best CRM tools for startups", engine: "ChatGPT", mentioned: true, position: 2, time: "5m ago" },
  { prompt: "Top SaaS tools in 2025", engine: "Gemini", mentioned: true, position: 1, time: "12m ago" },
  { prompt: "AI monitoring platforms", engine: "Perplexity", mentioned: false, position: null, time: "1h ago" },
  { prompt: "Best CRM tools for startups", engine: "Gemini", mentioned: true, position: 3, time: "1h ago" },
];

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="glass rounded-2xl p-6">
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-indigo-400 mt-1">{sub}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const { userId } = auth();
  if (!userId) redirect("/");

  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      {/* Top bar */}
      <header className="border-b border-white/5 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
              V
            </div>
            <span className="text-white font-bold">Vellor</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 text-sm">Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/projects/new"
            id="new-project-btn"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-200"
          >
            + New Project
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your brand's AI visibility across all projects
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Projects" value={MOCK_STATS.totalProjects} />
          <StatCard label="Total Prompts" value={MOCK_STATS.totalPrompts} />
          <StatCard label="Results Collected" value={MOCK_STATS.totalResults} />
          <StatCard
            label="Avg. Mention Rate"
            value={`${MOCK_STATS.avgMentionRate}%`}
            sub="↑ 5% from last week"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Projects</h2>
              <Link href="/dashboard/projects/new" className="text-indigo-400 text-sm hover:text-indigo-300">
                + Add project
              </Link>
            </div>
            <div className="space-y-3">
              {MOCK_PROJECTS.map((project) => (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="glass glass-hover rounded-xl p-5 flex items-center justify-between group transition-all duration-200 block"
                  id={`project-card-${project.id}`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 pulse-dot" />
                      <span className="text-white font-medium">{project.domain}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {project.competitors.length} competitor{project.competitors.length !== 1 ? "s" : ""} •{" "}
                      {project.promptCount} prompts • Last run {project.lastRun}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-lg font-bold ${project.mentionRate > 60 ? "text-green-400" : "text-yellow-400"}`}>
                        {project.mentionRate}%
                      </div>
                      <div className="text-xs text-slate-500">mention rate</div>
                    </div>
                    <div className={`text-lg ${project.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                      {project.trend === "up" ? "↑" : "↓"}
                    </div>
                    <div className="text-slate-600 group-hover:text-slate-400 transition-colors">→</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent runs */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Recent Runs</h2>
            <div className="space-y-3">
              {MOCK_RECENT_RUNS.map((run, i) => (
                <div key={i} className="glass rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm text-slate-300 line-clamp-1">{run.prompt}</p>
                    <span className={`text-xs font-bold shrink-0 ${run.mentioned ? "text-green-400" : "text-red-400"}`}>
                      {run.mentioned ? "✓" : "✗"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300">
                      {run.engine}
                    </span>
                    <span className="text-xs text-slate-500">
                      {run.mentioned ? `#${run.position}` : "Not mentioned"} • {run.time}
                    </span>
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
