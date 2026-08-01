"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// SVG icons
const IconSparkle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v1M12 20v1M4.22 4.22l.7.7M18.36 18.36l.71.71M3 12h1M20 12h1M4.22 19.78l.7-.7M18.36 5.64l.71-.71M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
  </svg>
);

export default function NewProjectClient({
  plan,
}: {
  plan: { name: string; maxCompetitors: number; maxPromptsPerProject: number };
}) {
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
      alert(error.message);
      setIsLoading(false);
    }
  };

  const STEPS = ["Brand Info", "Competitors", "Confirm"];

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b px-6 md:px-8 py-4 flex items-center justify-between backdrop-blur-xl"
        style={{ background: "var(--color-header-bg)", borderColor: "var(--color-header-border)" }}>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors duration-[160ms]">
            Dashboard
          </Link>
          <span className="text-[var(--color-border)]">/</span>
          <span className="text-[var(--color-fg)]">New Project</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Step indicator — 3 steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  s < step ? "cursor-pointer" : ""
                }`}
                style={{
                  background: s === step ? "var(--color-fg)" : s < step ? "var(--color-surface-3)" : "var(--color-surface-2)",
                  color: s === step ? "var(--color-bg)" : "var(--color-fg)",
                }}
                onClick={() => s < step && setStep(s)}
              >
                {s < step ? "✓" : s}
              </div>
              <span className={`text-sm hidden sm:inline ${s === step ? "text-[var(--color-fg)]" : "text-[var(--color-fg-muted)]"}`}>
                {STEPS[s - 1]}
              </span>
              {s < 3 && <div className="w-8 h-px mx-1" style={{ background: "var(--color-border)" }} />}
            </div>
          ))}
        </div>

        <div className="dash-card rounded-xl p-8">
          <h1 className="text-2xl font-bold mb-2 text-[var(--color-fg)]">Create a new project</h1>
          <p className="text-[var(--color-fg-muted)] text-sm mb-8">
            Set up monitoring for your brand across ChatGPT, Gemini, and Perplexity.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Step 1: Brand Info ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-fg-muted)]">
                    Your brand domain <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. acme-saas.com"
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-[var(--color-fg)] transition-all"
                    style={{
                      background: "var(--color-surface-2)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-fg)",
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-fg-muted)]">
                    Brand Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. Acme SaaS"
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-[var(--color-fg)] transition-all"
                    style={{
                      background: "var(--color-surface-2)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-fg)",
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-fg-muted)]">
                    Industry / Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. CRM Software, Analytics, DevTools"
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-[var(--color-fg)] transition-all"
                    style={{
                      background: "var(--color-surface-2)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-fg)",
                    }}
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => domain.trim() && brandName.trim() && industry.trim() && setStep(2)}
                  disabled={!domain.trim() || !brandName.trim() || !industry.trim()}
                  className="w-full py-3 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--color-bg)] font-semibold transition-all duration-200 active:scale-[0.98]"
                  style={{ background: "var(--color-fg)" }}
                >
                  Continue →
                </button>
              </div>
            )}

            {/* ── Step 2: Competitors ── */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-fg-muted)]">
                    Competitor domains{" "}
                    <span className="text-[var(--color-fg-muted)] font-normal">
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
                      className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:border-[var(--color-fg)] transition-all"
                      style={{
                        background: "var(--color-surface-2)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-fg)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={addCompetitor}
                      disabled={competitors.length >= plan.maxCompetitors}
                      className="px-4 py-3 rounded-xl border transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97]"
                      style={{
                        background: "var(--color-surface-2)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-fg)",
                      }}
                    >
                      Add
                    </button>
                  </div>

                  {competitors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {competitors.map((c) => (
                        <span
                          key={c}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm"
                          style={{
                            background: "var(--color-surface-3)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-fg)",
                          }}
                        >
                          {c}
                          <button
                            type="button"
                            onClick={() => removeCompetitor(c)}
                            className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
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
                    className="flex-1 py-3 rounded-xl border font-medium transition-all duration-200 active:scale-[0.97]"
                    style={{
                      background: "var(--color-surface-2)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-fg)",
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 rounded-xl hover:opacity-90 font-semibold transition-all duration-200 active:scale-[0.97] text-[var(--color-bg)]"
                    style={{ background: "var(--color-fg)" }}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: Confirm ── */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="p-4 rounded-xl border space-y-2" style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)" }}>
                  <p className="text-sm font-medium mb-3 text-[var(--color-fg)]">Project summary</p>
                  <div className="text-xs text-[var(--color-fg-muted)] space-y-2">
                    <p>Domain: <span className="ml-1 font-mono text-[var(--color-fg)]">{domain}</span></p>
                    <p>Brand Name: <span className="ml-1 text-[var(--color-fg)]">{brandName}</span></p>
                    <p>Industry: <span className="ml-1 text-[var(--color-fg)]">{industry}</span></p>
                    <p>Competitors: <span className="ml-1 font-mono text-[var(--color-fg)]">{competitors.length > 0 ? competitors.join(", ") : "none"}</span></p>
                  </div>
                </div>

                {/* AI prompts callout */}
                <div className="flex items-start gap-3 p-4 rounded-xl border" style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)" }}>
                  <span className="text-[var(--color-fg-muted)] mt-0.5 shrink-0">
                    <IconSparkle />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-fg)]">AI will generate your prompts</p>
                    <p className="text-xs text-[var(--color-fg-muted)] mt-1 leading-relaxed">
                      Vellor's AI will craft up to{" "}
                      <span className="font-semibold text-[var(--color-fg)]">{plan.maxPromptsPerProject} search queries</span>{" "}
                      tailored to <span className="text-[var(--color-fg)]">{brandName}</span> and the{" "}
                      <span className="text-[var(--color-fg)]">{industry}</span> space — the exact queries your
                      potential customers type into ChatGPT, Gemini, and Perplexity.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 rounded-xl border font-medium transition-all duration-200 active:scale-[0.97]"
                    style={{
                      background: "var(--color-surface-2)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-fg)",
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200 active:scale-[0.97] text-[var(--color-bg)]"
                    style={{ background: "var(--color-fg)" }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "var(--color-bg)", borderTopColor: "transparent" }} />
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
