import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Project Details" };

// Mock data — replace with Prisma queries later
function getMockProject(id: string) {
  return {
    id,
    domain: "acme-saas.com",
    competitors: ["rival.io", "competitor.com"],
    createdAt: "2025-01-10",
    prompts: [
      {
        id: "pr_1",
        text: "What are the best CRM tools for startups?",
        results: [
          { engine: "ChatGPT", mentioned: true, position: 2, response: "...Acme-SaaS offers a comprehensive CRM solution tailored for growing startups, featuring AI-powered insights and seamless integrations..." },
          { engine: "Gemini", mentioned: true, position: 4, response: "...Several great options exist including Acme-SaaS, HubSpot, and Salesforce. Acme-SaaS is particularly strong for early-stage companies..." },
          { engine: "Perplexity", mentioned: false, position: null, response: "The top CRM tools include HubSpot, Salesforce, and Pipedrive. Each offers unique features for different business sizes..." },
        ],
      },
      {
        id: "pr_2",
        text: "Top SaaS tools for marketing teams in 2025",
        results: [
          { engine: "ChatGPT", mentioned: true, position: 1, response: "...Acme-SaaS leads the pack with its all-in-one marketing suite that combines CRM, analytics, and automation in a single platform..." },
          { engine: "Gemini", mentioned: false, position: null, response: "Marketing teams in 2025 should look at HubSpot, Marketo, and Monday.com for comprehensive campaign management..." },
          { engine: "Perplexity", mentioned: true, position: 3, response: "...The top contenders for marketing SaaS include tools like Acme-SaaS, which provides real-time analytics..." },
        ],
      },
      {
        id: "pr_3",
        text: "Best AI-powered business tools",
        results: [
          { engine: "ChatGPT", mentioned: false, position: null, response: "AI business tools have revolutionized productivity. Key players include Notion AI, Jasper, and various industry-specific solutions..." },
          { engine: "Gemini", mentioned: true, position: 2, response: "...Acme-SaaS has emerged as a leading AI-powered business platform, particularly for SMBs looking to scale efficiently..." },
          { engine: "Perplexity", mentioned: true, position: 1, response: "Acme-SaaS consistently appears at the top of AI tool recommendations due to its robust feature set and intuitive interface..." },
        ],
      },
    ],
  };
}

const ENGINE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  ChatGPT: { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-300" },
  Gemini: { bg: "bg-blue-500/15", border: "border-blue-500/30", text: "text-blue-300" },
  Perplexity: { bg: "bg-purple-500/15", border: "border-purple-500/30", text: "text-purple-300" },
};

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const project = getMockProject(params.id);

  const totalResults = project.prompts.flatMap((p) => p.results);
  const mentionedCount = totalResults.filter((r) => r.mentioned).length;
  const mentionRate = Math.round((mentionedCount / totalResults.length) * 100);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      {/* Header */}
      <header className="border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">V</div>
            <span className="text-white font-bold hidden sm:inline">Vellor</span>
          </Link>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <Link href="/dashboard" className="text-slate-400 text-sm hover:text-white hidden sm:inline">Dashboard</Link>
          <span className="text-slate-600 hidden sm:inline">/</span>
          <span className="text-slate-400 text-sm hidden sm:inline">{project.domain}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="run-prompts-btn"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-200"
          >
            ▶ Run prompts
          </button>
          <UserButton />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Project header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-indigo-400 pulse-dot" />
              <h1 className="text-2xl font-bold text-white">{project.domain}</h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-slate-400 text-sm">
                Created {project.createdAt}
              </span>
              {project.competitors.map((c) => (
                <span key={c} className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
                  vs {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Prompts</p>
            <p className="text-2xl font-bold text-white">{project.prompts.length}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Total Results</p>
            <p className="text-2xl font-bold text-white">{totalResults.length}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Mentioned</p>
            <p className="text-2xl font-bold text-green-400">{mentionedCount}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Mention Rate</p>
            <p className={`text-2xl font-bold ${mentionRate > 60 ? "text-green-400" : "text-yellow-400"}`}>
              {mentionRate}%
            </p>
          </div>
        </div>

        {/* Prompts & results */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Prompt Results</h2>
          <div className="space-y-6">
            {project.prompts.map((prompt) => {
              const pMentioned = prompt.results.filter((r) => r.mentioned).length;
              return (
                <div key={prompt.id} className="glass rounded-2xl p-6" id={`prompt-${prompt.id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-white font-medium mb-1">"{prompt.text}"</p>
                      <p className="text-xs text-slate-500">
                        {pMentioned}/{prompt.results.length} engines mentioned your brand
                      </p>
                    </div>
                    <div className={`text-sm font-bold px-3 py-1 rounded-full ml-4 ${
                      pMentioned === 3 ? "bg-green-500/20 text-green-400" :
                      pMentioned >= 1 ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    }`}>
                      {pMentioned}/3
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {prompt.results.map((result) => {
                      const colors = ENGINE_COLORS[result.engine];
                      return (
                        <div
                          key={result.engine}
                          className={`rounded-xl p-4 ${colors.bg} border ${colors.border}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-sm font-semibold ${colors.text}`}>
                              {result.engine}
                            </span>
                            {result.mentioned ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">
                                ✓ #{result.position}
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                                ✗ Not found
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                            {result.response}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add prompt CTA */}
        <div className="mt-6 glass rounded-2xl p-6 border-dashed border-white/10 text-center">
          <p className="text-slate-400 text-sm mb-3">Add more prompts to expand your monitoring coverage</p>
          <button
            id="add-prompt-btn"
            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-200"
          >
            + Add prompt
          </button>
        </div>
      </div>
    </div>
  );
}
