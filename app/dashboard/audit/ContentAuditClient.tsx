"use client";

import { useState } from "react";
import { GeoScore } from "@/lib/ai/gemini";
import { GeoRewrite } from "@/lib/ai/claude";

interface ContentAuditClientProps {
  defaultDomain: string;
}

export default function ContentAuditClient({ defaultDomain }: ContentAuditClientProps) {
  const [url, setUrl] = useState(defaultDomain);
  const [isAuditing, setIsAuditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [scores, setScores] = useState<GeoScore | null>(null);
  const [rewrites, setRewrites] = useState<GeoRewrite[] | null>(null);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsAuditing(true);
    setError(null);
    setScores(null);
    setRewrites(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to audit URL");
      }

      setScores(data.scores);
      setRewrites(data.rewrites);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAuditing(false);
    }
  };

  const scoreItems = scores ? [
    { key: "directAnswer", label: "Direct Answer in first 50 words" },
    { key: "faqSchema", label: "FAQ Schema / Sections" },
    { key: "factDensity", label: "High Fact Density" },
    { key: "qaStructure", label: "Q&A Structure" },
    { key: "wordCount", label: "> 800 Words" },
    { key: "authorSchema", label: "Author Schema / Credentials" },
    { key: "externalCitations", label: "External Citations" },
    { key: "contentChunking", label: "Content Chunking (Readability)" },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-8 py-12 space-y-8" style={{ color: "var(--color-fg)" }}>
      
      {/* ── Eyebrow & Header ── */}
      <div className="space-y-2.5 max-w-3xl">
        <div className="fade-up">
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 border border-indigo-500/10">
            GEO Optimization Engine
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-none fade-up fade-up-d1" style={{ color: "var(--color-fg)" }}>
          Content Audit
        </h1>
        <p className="text-sm leading-relaxed fade-up fade-up-d2" style={{ color: "var(--color-fg-muted)" }}>
          Analyze your landing page against 8 Generative Engine Optimization (GEO) factors and get AI-powered rewrite suggestions to improve your visibility in ChatGPT, Gemini, and Perplexity.
        </p>
      </div>

      {/* ── Clean Search Input (Flat Layout, Theme-Aware) ── */}
      <div className="fade-up fade-up-d2 max-w-2xl">
        <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-3 items-center">
          
          <div className="relative flex-1 w-full flex items-center bg-[var(--color-surface-2)] border border-[var(--color-border)] focus-within:border-[var(--color-fg)] rounded-xl px-4 h-[40px] transition-all duration-200">
            <span className="text-[var(--color-fg-subtle)] text-xs font-bold uppercase tracking-wider mr-3 select-none">URL</span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. acme-saas.com"
              className="flex-1 bg-transparent text-[var(--color-fg)] placeholder-[var(--color-fg-subtle)] text-sm focus:outline-none focus:ring-0 focus:border-none border-none p-0 w-full"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isAuditing || !url}
            className="group relative bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-semibold pl-6 pr-2.5 py-2 rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-between gap-3 w-full sm:w-auto h-[40px] shrink-0 active:scale-[0.98]"
          >
            <span className="text-[13px] font-bold tracking-tight">
              {isAuditing ? "Auditing..." : "Run Audit"}
            </span>
            <div className="w-6.5 h-6.5 rounded-full bg-[var(--color-btn-primary-text)]/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:scale-105">
              {isAuditing ? (
                <svg className="animate-spin h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )}
            </div>
          </button>

        </form>
        {error && <p className="text-red-500 mt-2 text-xs font-semibold px-1">{error}</p>}
      </div>

      {/* ── Reflective Bento-Style Audit Results ── */}
      {scores && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          {/* Bento Item 1: Overall radial score */}
          <div className="lg:col-span-1 rounded-2xl border border-[var(--color-border)] bg-gradient-to-b from-white to-[var(--color-card-bg)] dark:from-white/[0.04] dark:to-[var(--color-card-bg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65),_var(--color-card-shadow)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_var(--color-card-shadow)] p-6 flex flex-col items-center justify-center text-center min-h-[280px] fade-up">
            <h3 className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)] font-bold mb-6">Overall GEO Score</h3>
            <div className="relative w-36 h-36 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
                <path
                  className="text-[var(--color-surface-3)] stroke-current"
                  strokeWidth="2.2"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="stroke-current transition-all duration-1000 ease-out"
                  strokeWidth="2.2"
                  strokeDasharray={`${scores.overallScore}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  stroke="url(#scoreGrad)"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold tracking-tighter tabular-nums leading-none" style={{ color: "var(--color-fg)" }}>
                  {scores.overallScore}
                </span>
                <span className="text-[9px] text-[var(--color-fg-subtle)] uppercase tracking-widest mt-1 font-bold">Score</span>
              </div>
            </div>
            <p className="text-xs text-[var(--color-fg-muted)] tracking-wider font-semibold">Out of 100 points</p>
          </div>

          {/* Bento Item 2: Checklist factors */}
          <div className="lg:col-span-2 rounded-2xl border border-[var(--color-border)] bg-gradient-to-b from-white to-[var(--color-card-bg)] dark:from-white/[0.04] dark:to-[var(--color-card-bg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65),_var(--color-card-shadow)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_var(--color-card-shadow)] p-6 flex flex-col justify-center fade-up fade-up-d1">
            <h3 className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)] font-bold mb-6">Optimization Factors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {scoreItems.map((item) => {
                const isPassed = (scores as any)[item.key];
                return (
                  <div key={item.key} className="flex items-center gap-3.5 group/item">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                      isPassed 
                        ? 'bg-[#10b981]/5 border-[#10b981]/15 text-[#10b981]' 
                        : 'bg-[#ef4444]/5 border-[#ef4444]/15 text-[#ef4444]'
                    }`}>
                      {isPassed ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[13px] font-semibold text-[var(--color-fg-muted)] group-hover/item:text-[var(--color-fg)] transition-colors duration-150">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ── AI Suggestions ── */}
      {rewrites && rewrites.length > 0 && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-gradient-to-b from-white to-[var(--color-card-bg)] dark:from-white/[0.04] dark:to-[var(--color-card-bg)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65),_var(--color-card-shadow)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_var(--color-card-shadow)] p-6 fade-up fade-up-d2">
          <h3 className="text-[10px] uppercase tracking-widest text-[var(--color-fg-muted)] font-bold mb-6">
            AI Optimization Suggestions
          </h3>
          
          <div className="space-y-6">
            {rewrites.map((rewrite, i) => (
              <div key={i} className="border border-[var(--color-border)] rounded-2xl overflow-hidden bg-[var(--color-surface)]">
                
                {/* Card Header */}
                <div className="px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Recommendation #{i + 1}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--color-fg-muted)] bg-[var(--color-surface-1)] border border-[var(--color-border)] px-3 py-1 rounded-full w-fit max-w-[280px] sm:max-w-md truncate">
                    Why: {rewrite.reasoning}
                  </span>
                </div>

                {/* Original vs Suggested Side-by-Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
                  
                  {/* Original */}
                  <div className="p-5 bg-red-500/[0.015]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-500/5 border border-red-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Original Content
                      </span>
                    </div>
                    <p className="text-[13px] text-[var(--color-fg-muted)] leading-relaxed line-through decoration-red-500/20">
                      {rewrite.originalText}
                    </p>
                  </div>

                  {/* Suggested */}
                  <div className="p-5 bg-green-500/[0.015]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-500/5 border border-green-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        AI Optimized Suggestion
                      </span>
                    </div>
                    <p className="text-[13px] text-[var(--color-fg)] leading-relaxed font-medium">
                      {rewrite.suggestedText}
                    </p>
                  </div>

                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
