"use client";

import { useState } from "react";
import Link from "next/link";

interface PromptItem {
  id: string;
  text: string;
  resultsCount: number;
  createdAt: string;
}

interface ProjectData {
  id: string;
  domain: string;
  brandName: string;
  industry: string;
  prompts: PromptItem[];
}

interface PromptsClientProps {
  initialProjects: ProjectData[];
  planLimit: number;
  planName: string;
}

// Icons
const IconSparkle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v1M12 20v1M4.22 4.22l.7.7M18.36 18.36l.71.71M3 12h1M20 12h1M4.22 19.78l.7-.7M18.36 5.64l.71-.71M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
  </svg>
);

const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
    <path d="M16 16h5v5"/>
  </svg>
);

const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

export default function PromptsClient({
  initialProjects,
  planLimit,
  planName,
}: PromptsClientProps) {
  const [projects, setProjects] = useState<ProjectData[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState(
    initialProjects[0]?.id || ""
  );
  const [isRunning, setIsRunning] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-3">Prompts</h1>
          <p className="text-zinc-400 text-sm">No projects found. Create a project first.</p>
        </div>
      </div>
    );
  }

  const showStatus = (msg: string, type: "success" | "error") => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => setStatusMessage(""), 5000);
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this prompt? All its visibility results will be deleted too."
      )
    ) return;

    try {
      const res = await fetch(`/api/prompts/${promptId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete prompt");

      setProjects(projects.map((p) => {
        if (p.id === activeProject.id) {
          return { ...p, prompts: p.prompts.filter((pt) => pt.id !== promptId) };
        }
        return p;
      }));
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleRunAll = async () => {
    setIsRunning(true);
    try {
      const res = await fetch(`/api/projects/${activeProject.id}/run`, { method: "POST" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Failed to trigger run");
      }
      const data = await res.json();
      showStatus(`Queued ${data.promptCount} prompt runs.`, "success");
    } catch (err: any) {
      console.error(err);
      showStatus(err.message, "error");
    } finally {
      setIsRunning(false);
    }
  };

  const handleRegenerate = async () => {
    if (
      !confirm(
        "This will delete all current prompts and results for this project, then generate a fresh AI set. Continue?"
      )
    ) return;

    setIsRegenerating(true);
    try {
      const res = await fetch(
        `/api/projects/${activeProject.id}/regenerate-prompts`,
        { method: "POST" }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Failed to regenerate prompts");
      }

      const data = await res.json();

      // Update UI with the fresh prompts
      setProjects(projects.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            prompts: data.prompts.map((pt: { id: string; text: string }) => ({
              id: pt.id,
              text: pt.text,
              resultsCount: 0,
              createdAt: new Date().toISOString(),
            })),
          };
        }
        return p;
      }));

      showStatus(`AI generated ${data.promptCount} fresh prompts for this project.`, "success");
    } catch (err: any) {
      console.error(err);
      showStatus(err.message, "error");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b px-6 md:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 backdrop-blur-xl"
        style={{ background: "var(--color-header-bg)", borderColor: "var(--color-header-border)" }}>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/dashboard" className="text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors duration-[160ms]">
            Dashboard
          </Link>
          <span className="text-[var(--color-border)]">/</span>
          <span className="text-[var(--color-fg)] font-medium">Prompts</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Project selector */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-4 py-2 rounded-xl focus:outline-none focus:border-[var(--color-fg)] transition-all text-sm font-medium border"
            style={{
              background: "var(--color-surface-2)",
              borderColor: "var(--color-border)",
              color: "var(--color-fg)",
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="text-[var(--color-fg)]" style={{ background: "var(--color-surface-2)" }}>
                {p.domain}
              </option>
            ))}
          </select>

          {/* Regenerate */}
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating || isRunning}
            className="px-3 py-2 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-[160ms] active:scale-[0.97] text-sm flex items-center gap-1.5 border"
            style={{
              background: "var(--color-surface-2)",
              borderColor: "var(--color-border)",
              color: "var(--color-fg)",
            }}
            title="Regenerate all prompts with AI"
          >
            {isRegenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: "var(--color-fg)", borderTopColor: "transparent" }} />
                Regenerating...
              </>
            ) : (
              <>
                <IconSparkle />
                Regenerate
              </>
            )}
          </button>

          {/* Run all */}
          <button
            onClick={handleRunAll}
            disabled={isRunning || isRegenerating || activeProject.prompts.length === 0}
            className="px-4 py-2 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-[160ms] active:scale-[0.97] text-sm flex items-center gap-1.5 shadow-sm text-[var(--color-bg)] hover:opacity-90"
            style={{ background: "var(--color-fg)" }}
          >
            {isRunning ? (
              <>
                <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: "var(--color-bg)", borderTopColor: "transparent" }} />
                Running...
              </>
            ) : (
              <>
                <IconPlay />
                Run all
              </>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6">
        {/* Status message */}
        {statusMessage && (
          <div className={`p-4 rounded-xl text-xs font-mono border ${
            statusType === "error"
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}>
            {statusMessage}
          </div>
        )}

        <div className="dash-card rounded-xl p-5 md:p-6">
          {/* Title + plan counter */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b pb-6 mb-6 gap-4" style={{ borderColor: "var(--color-border)" }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-[var(--color-fg)]">AI-Generated Prompts</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold text-[var(--color-fg-muted)] uppercase tracking-wider" style={{ background: "var(--color-surface-3)", borderColor: "var(--color-border)" }}>
                  <IconSparkle />
                  AI
                </span>
              </div>
              <p className="text-[var(--color-fg-muted)] text-xs mt-1">
                Search queries crafted by AI for{" "}
                <span className="text-[var(--color-fg)] font-medium">{activeProject.brandName || activeProject.domain}</span>{" "}
                in the <span className="text-[var(--color-fg)] font-medium">{activeProject.industry}</span> space.
                <br />
                These are the exact queries potential customers type into ChatGPT, Gemini &amp; Perplexity.
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-fg-muted)] font-semibold">{planName} Limit</p>
              <p className="text-lg font-bold text-[var(--color-fg)] font-mono mt-0.5">
                {activeProject.prompts.length}{" "}
                <span className="text-[var(--color-fg-muted)] text-sm font-normal">/ {planLimit}</span>
              </p>
            </div>
          </div>

          {/* Prompt list */}
          <div className="space-y-3">
            {activeProject.prompts.length === 0 ? (
              <div className="p-6 text-center border border-dashed rounded-xl space-y-3" style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)" }}>
                <div className="mx-auto w-10 h-10 rounded-xl border flex items-center justify-center text-[var(--color-fg-muted)]" style={{ background: "var(--color-surface-3)", borderColor: "var(--color-border)" }}>
                  <IconSparkle />
                </div>
                <p className="text-sm text-[var(--color-fg-muted)]">No AI prompts generated yet.</p>
                <p className="text-xs text-[var(--color-fg-muted)]">
                  They may still be generating. Refresh in a moment, or click{" "}
                  <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="text-[var(--color-fg)] underline underline-offset-2 hover:no-underline transition-all"
                  >
                    Regenerate
                  </button>{" "}
                  to trigger generation now.
                </p>
              </div>
            ) : (
              activeProject.prompts.map((pt, idx) => (
                <div
                  key={pt.id}
                  className="flex items-start justify-between p-4 rounded-xl border transition-all group gap-4"
                  style={{
                    animationDelay: `${idx * 20}ms`,
                    background: "var(--color-surface-2)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-medium text-[var(--color-fg)] leading-snug">
                      {pt.text}
                    </p>
                    <p className="text-xs text-[var(--color-fg-muted)] mt-1.5 font-mono">
                      {pt.resultsCount} run result{pt.resultsCount !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeletePrompt(pt.id)}
                    className="px-3 py-1.5 text-xs text-[var(--color-fg-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all active:scale-[0.95] shrink-0 mt-0.5"
                    title="Delete this prompt"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          {activeProject.prompts.length > 0 && (
            <div className="mt-6 pt-5 border-t flex items-center gap-2 text-xs text-[var(--color-fg-muted)]" style={{ borderColor: "var(--color-border)" }}>
              <IconRefresh />
              <span>
                Use <strong className="text-[var(--color-fg)]">Regenerate</strong> to replace all prompts with a fresh
                AI-generated set tailored to your brand.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
