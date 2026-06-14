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
    <div className="p-8 max-w-5xl mx-auto w-full animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Content Audit</h1>
        <p className="text-[#888]">
          Analyze your landing page against 8 Generative Engine Optimization (GEO) factors and get AI-powered rewrite suggestions to improve your visibility in ChatGPT, Gemini, and Perplexity.
        </p>
      </div>

      <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-2xl p-6 mb-8 shadow-sm">
        <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-domain.com"
            className="flex-1 bg-[#141414] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-[#555] transition-colors"
            required
          />
          <button
            type="submit"
            disabled={isAuditing || !url}
            className="bg-white text-black font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {isAuditing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Auditing...
              </>
            ) : (
              "Run Audit"
            )}
          </button>
        </form>
        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
      </div>

      {scores && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
          <div className="md:col-span-1 bg-[#1C1C1C] border border-[#2E2E2E] rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="text-[#888] font-medium mb-4">Overall GEO Score</h3>
            <div className="relative w-32 h-32 flex items-center justify-center mb-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#333] stroke-current"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-500 stroke-current transition-all duration-1000 ease-out"
                  strokeWidth="3"
                  strokeDasharray={`${scores.overallScore}, 100`}
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold tracking-tighter">{scores.overallScore}</span>
              </div>
            </div>
            <p className="text-sm text-[#888]">Out of 100</p>
          </div>

          <div className="md:col-span-2 bg-[#1C1C1C] border border-[#2E2E2E] rounded-2xl p-6 shadow-sm">
            <h3 className="font-medium mb-4">Optimization Factors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
              {scoreItems.map((item) => {
                const isPassed = (scores as any)[item.key];
                return (
                  <div key={item.key} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isPassed ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {isPassed ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      )}
                    </div>
                    <span className="text-sm text-[#CCC]">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {rewrites && rewrites.length > 0 && (
        <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-2xl p-6 shadow-sm animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-xl font-bold mb-6">AI Optimization Suggestions</h3>
          <div className="space-y-6">
            {rewrites.map((rewrite, i) => (
              <div key={i} className="border border-[#333] rounded-xl overflow-hidden bg-[#141414]">
                <div className="p-4 border-b border-[#333] bg-[#1A1A1A]">
                  <p className="text-sm text-indigo-400 font-medium">Why: {rewrite.reasoning}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#333]">
                  <div className="p-4 bg-red-500/5">
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 block">Original</span>
                    <p className="text-sm text-[#AAA] leading-relaxed line-through decoration-red-500/50">{rewrite.originalText}</p>
                  </div>
                  <div className="p-4 bg-green-500/5">
                    <span className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2 block">Suggested</span>
                    <p className="text-sm text-white leading-relaxed">{rewrite.suggestedText}</p>
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
