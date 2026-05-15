"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import type { Metadata } from "next";

const SUGGESTED_PROMPTS = [
  "What are the best {domain} alternatives?",
  "Best tools for tracking brand visibility in AI responses",
  "Which platforms help with generative engine optimization?",
  "Top SaaS tools for digital marketing teams",
];

export default function NewProjectPage() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [promptInput, setPromptInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const addCompetitor = () => {
    if (competitor.trim() && !competitors.includes(competitor.trim())) {
      setCompetitors([...competitors, competitor.trim()]);
      setCompetitor("");
    }
  };

  const removeCompetitor = (c: string) => {
    setCompetitors(competitors.filter((x) => x !== c));
  };

  const addPrompt = (text: string) => {
    const filled = text.replace("{domain}", domain || "your brand");
    if (filled.trim() && !prompts.includes(filled.trim())) {
      setPrompts([...prompts, filled.trim()]);
      setPromptInput("");
    }
  };

  const removePrompt = (p: string) => {
    setPrompts(prompts.filter((x) => x !== p));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setIsLoading(true);
    // Placeholder — wire up API call later
    await new Promise((r) => setTimeout(r, 1200));
    setIsLoading(false);
    router.push("/dashboard/projects/proj_new");
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      {/* Header */}
      <header className="border-b border-white/5 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
              V
            </div>
            <span className="text-white font-bold">Vellor</span>
          </Link>
          <span className="text-slate-600">/</span>
          <Link href="/dashboard" className="text-slate-400 text-sm hover:text-white">Dashboard</Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 text-sm">New Project</span>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 cursor-pointer ${
                  s === step
                    ? "bg-indigo-600 text-white"
                    : s < step
                    ? "bg-indigo-600/30 text-indigo-400"
                    : "bg-white/5 text-slate-500"
                }`}
                onClick={() => s < step && setStep(s)}
              >
                {s < step ? "✓" : s}
              </div>
              <span className={`text-sm ${s === step ? "text-white" : "text-slate-500"}`}>
                {s === 1 ? "Domain" : s === 2 ? "Competitors" : "Prompts"}
              </span>
              {s < 3 && <div className="w-8 h-px bg-white/10 mx-1" />}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create a new project</h1>
          <p className="text-slate-400 text-sm mb-8">
            Set up monitoring for your brand across ChatGPT, Gemini, and Perplexity.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Domain */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your brand domain <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="domain-input"
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. acme-saas.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    We'll search for this domain in AI-generated responses.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => domain.trim() && setStep(2)}
                  disabled={!domain.trim()}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all duration-200"
                >
                  Continue →
                </button>
              </div>
            )}

            {/* Step 2: Competitors */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Competitor domains{" "}
                    <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="competitor-input"
                      type="text"
                      value={competitor}
                      onChange={(e) => setCompetitor(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCompetitor())}
                      placeholder="e.g. competitor.com"
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={addCompetitor}
                      className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
                    >
                      Add
                    </button>
                  </div>

                  {competitors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {competitors.map((c) => (
                        <span
                          key={c}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-sm"
                        >
                          {c}
                          <button
                            type="button"
                            onClick={() => removeCompetitor(c)}
                            className="text-indigo-400 hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl glass glass-hover text-white font-medium transition-all duration-200"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all duration-200"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Prompts */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Monitoring prompts <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="prompt-input"
                      type="text"
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPrompt(promptInput))}
                      placeholder="e.g. Best tools for brand monitoring"
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => addPrompt(promptInput)}
                      className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all"
                    >
                      Add
                    </button>
                  </div>

                  {/* Suggestions */}
                  <div className="mt-3">
                    <p className="text-xs text-slate-500 mb-2">Suggested prompts:</p>
                    <div className="space-y-1">
                      {SUGGESTED_PROMPTS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => addPrompt(p)}
                          className="w-full text-left text-xs px-3 py-2 rounded-lg bg-white/3 hover:bg-white/8 text-slate-400 hover:text-white border border-white/5 hover:border-white/10 transition-all"
                        >
                          + {p.replace("{domain}", domain || "your brand")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {prompts.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {prompts.map((p) => (
                        <div
                          key={p}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
                        >
                          <span className="text-sm text-slate-300 flex-1 mr-2">{p}</span>
                          <button
                            type="button"
                            onClick={() => removePrompt(p)}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 p-4 rounded-xl bg-white/3 border border-white/5">
                  <p className="text-sm font-medium text-white mb-2">Project summary</p>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>🌐 Domain: <span className="text-white">{domain}</span></p>
                    <p>🏢 Competitors: <span className="text-white">{competitors.length || "none"}</span></p>
                    <p>💬 Prompts: <span className="text-white">{prompts.length}</span></p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 rounded-xl glass glass-hover text-white font-medium transition-all duration-200"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    id="create-project-submit"
                    disabled={prompts.length === 0 || isLoading}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all duration-200"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      "Create project ✓"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
