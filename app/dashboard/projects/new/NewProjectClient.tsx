"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export default function NewProjectClient({ plan }: { plan: { name: string, maxCompetitors: number } }) {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [competitor, setCompetitor] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const addCompetitor = () => {
    if (competitors.length >= plan.maxCompetitors) return;
    if (competitor.trim() && !competitors.includes(competitor.trim())) {
      setCompetitors([...competitors, competitor.trim()]);
      setCompetitor("");
    }
  };

  const removeCompetitor = (c: string) => {
    setCompetitors(competitors.filter((x) => x !== c));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || !brandName.trim() || !industry.trim()) return;

    setIsLoading(true);
    
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, brandName, industry, competitors }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Failed to create project");
      }
      
      router.push("/dashboard?notice=setup");
    } catch (error: any) {
      console.error(error);
      alert(error.message); // Temporary alert to see the error, will replace with toast later
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 px-6 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl bg-[rgba(10,10,15,0.8)]">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-[var(--color-fg-muted)] hover:text-white transition-colors duration-[160ms]">Dashboard</Link>
          <span className="text-white/20">/</span>
          <span className="text-white">New Project</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
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
              <span className={`text-sm hidden sm:inline ${s === step ? "text-white" : "text-slate-500"}`}>
                {s === 1 ? "Brand Info" : s === 2 ? "Competitors" : "Confirm"}
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
            {/* Step 1: Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Your brand domain <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. acme-saas.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Brand Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Acme SaaS"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Industry / Category <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. CRM Software, Analytics, DevTools"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => domain.trim() && brandName.trim() && industry.trim() && setStep(2)}
                  disabled={!domain.trim() || !brandName.trim() || !industry.trim()}
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
                    <span className="text-slate-500 font-normal">
                      ({plan.name} plan: max {plan.maxCompetitors})
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
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
                      disabled={competitors.length >= plan.maxCompetitors}
                      className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="pt-2 p-4 rounded-xl bg-white/3 border border-white/5">
                  <p className="text-sm font-medium text-white mb-2">Project summary</p>
                  <div className="text-xs text-slate-400 space-y-2">
                    <p>Domain: <span className="text-white ml-1">{domain}</span></p>
                    <p>Brand Name: <span className="text-white ml-1">{brandName}</span></p>
                    <p>Industry: <span className="text-white ml-1">{industry}</span></p>
                    <p>Competitors: <span className="text-white ml-1">{competitors.length || "none"}</span></p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                  <p className="text-sm text-indigo-300 mb-1 font-medium">Automatic Setup</p>
                  <p className="text-xs text-indigo-200/70">
                    We'll automatically generate your tracking prompts using AI based on your industry and domain.
                  </p>
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
                    disabled={isLoading}
                    className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all duration-200"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      "Create project"
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
