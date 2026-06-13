"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dismissWelcome } from "./actions";

export default function WelcomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreateProject = async () => {
    setLoading(true);
    try {
      await dismissWelcome();
      router.push("/dashboard/projects/new");
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 px-6 lg:px-12 animate-fade-in-up">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center">
        
        {/* Decorative subtle icon */}
        <div className="w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 shadow-sm" style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)", color: "var(--color-fg)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-[var(--color-fg)]">
          Welcome to Vellor
        </h1>
        
        <p className="text-base text-[var(--color-fg-muted)] max-w-xl mx-auto leading-relaxed mb-10">
          See exactly where your brand appears across ChatGPT, Gemini, and Perplexity — and how to rank higher.
        </p>

        {/* Feature Highlights - 3 in a row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-3xl mb-10">
          <div className="dash-card rounded-2xl p-5 flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3.5" style={{ background: "var(--color-surface-2)", color: "var(--color-fg)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m22 12-4-4"/><path d="m22 12-4 4"/><path d="M2 12h20"/></svg>
            </div>
            <h3 className="text-sm font-semibold tracking-tight mb-1.5 text-[var(--color-fg)]">Track LLM presence</h3>
            <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
              Find out if top AI engines are recommending your brand to users searching your category.
            </p>
          </div>
          <div className="dash-card rounded-2xl p-5 flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3.5" style={{ background: "var(--color-surface-2)", color: "var(--color-fg)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            </div>
            <h3 className="text-sm font-semibold tracking-tight mb-1.5 text-[var(--color-fg)]">Monitor competitors</h3>
            <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
              Compare your visibility against competitors to identify gaps and optimization opportunities.
            </p>
          </div>
          <div className="dash-card rounded-2xl p-5 flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3.5" style={{ background: "var(--color-surface-2)", color: "var(--color-fg)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 className="text-sm font-semibold tracking-tight mb-1.5 text-[var(--color-fg)]">Optimize performance</h3>
            <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
              Get actionable insights to improve your Generative Engine Optimization (GEO).
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <button
            onClick={handleCreateProject}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[var(--color-bg)] font-semibold transition-[transform,opacity] duration-[160ms] ease-out active:scale-[0.97] disabled:opacity-70 disabled:scale-100"
            style={{ background: "var(--color-fg)" }}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "var(--color-bg)", borderTopColor: "transparent" }} />
            ) : null}
            Create my first project &rarr;
          </button>
          <p className="text-sm text-[var(--color-fg-muted)] mt-5">
            You&apos;re in demo mode — explore with sample data before starting your 7-day free trial.
            <br className="hidden sm:block" /> No credit card required yet.
          </p>
        </div>

      </div>
    </div>
  );
}
