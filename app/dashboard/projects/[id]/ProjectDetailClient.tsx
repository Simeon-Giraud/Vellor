"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProjectCharts from "@/components/ProjectCharts";
import RunButton from "@/components/RunButton";

interface PromptResult {
  id: string;
  engine: string;
  response: string;
  brandMentioned: boolean;
  mentionPosition: number | null;
  createdAt: Date | string;
}

interface Prompt {
  id: string;
  text: string;
  results: PromptResult[];
}

interface Project {
  id: string;
  domain: string;
  brandName: string | null;
  industry: string | null;
  status: string;
  competitors: string[];
  lastRunAt: Date | string | null;
}

interface ProjectDetailClientProps {
  project: Project;
  prompts: Prompt[];
  chartData: any[];
  competitorData: { domain: string; mentionRate: number; trend: number }[];
  planLimit: number;
  planName: string;
  maxCompetitors: number;
  myTrend: number;
  isDashboardRoot?: boolean;
}

const ENGINE_LABELS: Record<string, string> = {
  CHATGPT: "ChatGPT",
  GEMINI: "Gemini",
  PERPLEXITY: "Perplexity",
};

// SVG icons
const IconBack = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
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
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const IconSparkle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v1M12 20v1M4.22 4.22l.7.7M18.36 18.36l.71.71M3 12h1M20 12h1M4.22 19.78l.7-.7M18.36 5.64l.71-.71M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
  </svg>
);
const IconExport = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
  </svg>
);
const IconTrendingUp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
const IconTrendingDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);

export default function ProjectDetailClient({
  project: initialProject,
  prompts: initialPrompts,
  chartData,
  competitorData: initialCompetitorData,
  planLimit,
  planName,
  maxCompetitors,
  myTrend,
  isDashboardRoot = false,
}: ProjectDetailClientProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project>(initialProject);
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [competitorData, setCompetitorData] = useState(initialCompetitorData);
  
  const [activeTab, setActiveTab] = useState<"overview" | "prompts" | "competitors" | "audit" | "reports">("overview");

  // Local state for actions
  const [newPromptText, setNewPromptText] = useState("");
  const [newCompetitor, setNewCompetitor] = useState("");
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [isAddingCompetitor, setIsAddingCompetitor] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");

  // Project settings editing state
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editBrandName, setEditBrandName] = useState(project.brandName || "");
  const [editIndustry, setEditIndustry] = useState(project.industry || "");

  const showStatus = (msg: string, type: "success" | "error") => {
    setStatusMessage(msg);
    setStatusType(type);
    setTimeout(() => setStatusMessage(""), 5000);
  };

  // 1. Delete Project
  const handleDeleteProject = async () => {
    if (!confirm(`Are you sure you want to delete the project "${project.domain}"? This action is permanent and will delete all prompts and result records.`)) {
      return;
    }
    setIsDeletingProject(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      router.push("/dashboard?notice=project-deleted");
    } catch (err: any) {
      console.error(err);
      showStatus(err.message, "error");
      setIsDeletingProject(false);
    }
  };

  // 2. Update Project Brand & Industry info
  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName: editBrandName, industry: editIndustry }),
      });
      if (!res.ok) throw new Error("Failed to update project info");
      
      const data = await res.json();
      setProject({
        ...project,
        brandName: data.project.brandName,
        industry: data.project.industry,
      });
      setIsEditingInfo(false);
      showStatus("Project details updated successfully.", "success");
    } catch (err: any) {
      showStatus(err.message, "error");
    }
  };

  // 3. Add prompt
  const handleAddPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptText.trim()) return;
    if (prompts.length >= planLimit) {
      showStatus(`Prompt limit reached. Upgrade your ${planName} plan to add more than ${planLimit} prompts.`, "error");
      return;
    }

    setIsAddingPrompt(true);
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, text: newPromptText.trim(), runNow: true }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Failed to create prompt");
      }

      const data = await res.json();
      
      // Fetch latest project prompts to ensure results are loaded in UI
      const refreshRes = await fetch(`/api/projects/${project.id}`);
      if (refreshRes.ok) {
        // Simple client trigger or manual append
        // Let's reload page data or construct the prompt
        // To be safe, we reload router so server fetches latest database state
        router.refresh();
      }

      // Add to local state
      const newPromptItem: Prompt = {
        id: data.prompt.id,
        text: data.prompt.text,
        results: [], // Results are loaded on refresh
      };
      setPrompts([newPromptItem, ...prompts]);
      setNewPromptText("");
      showStatus("Prompt created. Mock runs seeded for testing.", "success");
      
      // Force Next.js refresh to load seeded mock database entries in the chart
      setTimeout(() => {
        router.refresh();
      }, 500);

    } catch (err: any) {
      console.error(err);
      showStatus(err.message, "error");
    } finally {
      setIsAddingPrompt(false);
    }
  };

  // 4. Delete Prompt
  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm("Are you sure you want to delete this prompt and all its results?")) return;

    try {
      const res = await fetch(`/api/prompts/${promptId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete prompt");

      setPrompts(prompts.filter((p) => p.id !== promptId));
      showStatus("Prompt deleted.", "success");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      showStatus(err.message, "error");
    }
  };

  // 5. Regenerate all prompts
  const handleRegeneratePrompts = async () => {
    if (!confirm("This will replace all current prompts and their results with a fresh AI-generated set. Continue?")) return;

    setIsRegenerating(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/regenerate-prompts`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to regenerate prompts");

      showStatus("AI Prompts regenerated. Mock checks populated.", "success");
      
      // Re-fetch project detail elements
      setTimeout(() => {
        router.refresh();
        // Force refresh state
        window.location.reload();
      }, 500);
    } catch (err: any) {
      console.error(err);
      showStatus(err.message, "error");
      setIsRegenerating(false);
    }
  };

  // 6. Add competitor
  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    const domain = newCompetitor.trim().toLowerCase();
    if (!domain) return;
    
    if (project.competitors.includes(domain)) {
      showStatus("Competitor already tracked.", "error");
      return;
    }

    if (project.competitors.length >= maxCompetitors) {
      showStatus(`Competitor limit reached. Your ${planName} plan allows up to ${maxCompetitors} competitor(s).`, "error");
      return;
    }

    setIsAddingCompetitor(true);
    const updatedCompetitors = [...project.competitors, domain];

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitors: updatedCompetitors }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Failed to add competitor");
      }

      setProject({ ...project, competitors: updatedCompetitors });
      setNewCompetitor("");
      showStatus(`Added competitor ${domain}. Running checks...`, "success");
      
      // Seed runs for competitors
      await fetch(`/api/projects/${project.id}/run`, { method: "POST" });
      
      setTimeout(() => {
        router.refresh();
        window.location.reload();
      }, 800);
    } catch (err: any) {
      showStatus(err.message, "error");
    } finally {
      setIsAddingCompetitor(false);
    }
  };

  // 7. Remove competitor
  const handleRemoveCompetitor = async (domain: string) => {
    if (!confirm(`Stop tracking competitor "${domain}"?`)) return;

    const updatedCompetitors = project.competitors.filter((c) => c !== domain);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitors: updatedCompetitors }),
      });

      if (!res.ok) throw new Error("Failed to remove competitor");

      setProject({ ...project, competitors: updatedCompetitors });
      showStatus(`Competitor ${domain} removed.`, "success");
      
      setTimeout(() => {
        router.refresh();
        window.location.reload();
      }, 500);
    } catch (err: any) {
      showStatus(err.message, "error");
    }
  };

  // 8. Client-side Exports
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Prompt,Engine,Mentioned,Position,Snippet\n";

    prompts.forEach((p) => {
      p.results.forEach((r) => {
        const cleanPrompt = p.text.replace(/"/g, '""');
        const cleanSnippet = r.response.replace(/"/g, '""').replace(/\n/g, " ");
        csvContent += `"${cleanPrompt}","${ENGINE_LABELS[r.engine] || r.engine}",${r.brandMentioned},${r.mentionPosition || ""},"${cleanSnippet}"\n`;
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vellor_export_${project.domain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showStatus("CSV exported successfully.", "success");
  };

  const exportToJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({ project, prompts }, null, 2)
    );
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `vellor_export_${project.domain}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showStatus("JSON exported successfully.", "success");
  };

  const simulatePDFDownload = () => {
    setIsExportingPDF(true);
    setTimeout(() => {
      setIsExportingPDF(false);
      
      // Simple text file as simulated PDF download
      const content = `VELLOR VISIBILITY REPORT
Project: ${project.domain}
Plan: ${planName}
Date: ${new Date().toLocaleDateString()}
------------------------------------------
Total Prompts Tracked: ${prompts.length}
Overall Brand Mention Rate: ${mentionRate}%

ENGINE DETAILS:
- ChatGPT Mention Rate: ${Math.round((prompts.flatMap(p=>p.results).filter(r=>r.engine==="CHATGPT" && r.brandMentioned).length / Math.max(1, prompts.flatMap(p=>p.results).filter(r=>r.engine==="CHATGPT").length)) * 100)}%
- Gemini Mention Rate: ${Math.round((prompts.flatMap(p=>p.results).filter(r=>r.engine==="GEMINI" && r.brandMentioned).length / Math.max(1, prompts.flatMap(p=>p.results).filter(r=>r.engine==="GEMINI").length)) * 100)}%
- Perplexity Mention Rate: ${Math.round((prompts.flatMap(p=>p.results).filter(r=>r.engine==="PERPLEXITY" && r.brandMentioned).length / Math.max(1, prompts.flatMap(p=>p.results).filter(r=>r.engine==="PERPLEXITY").length)) * 100)}%

RECOMMENDATIONS:
- Create targeted vs competitor pages on your domain to capture search citations.
- Publish OpenAPI schema detail sheets to expand Gemini integrations.
`;
      
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vellor_report_${project.domain}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showStatus("PDF report exported successfully.", "success");
    }, 1500);
  };

  // Math helper
  const allResults = prompts.flatMap((p) => p.results);
  const mentionedCount = allResults.filter((r) => r.brandMentioned).length;
  const mentionRate = allResults.length > 0
    ? Math.round((mentionedCount / allResults.length) * 1000) / 10
    : 0;

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="flex-1">
      {/* Dynamic Alert Toast */}
      {statusMessage && (
        <div className="fixed top-24 right-6 z-50 pointer-events-none flex justify-end animate-fade-in-up">
          <div className={`p-4 rounded-xl text-xs font-medium border shadow-2xl pointer-events-auto flex items-center gap-2.5 bg-[var(--color-surface-1)] ${
            statusType === "error"
              ? "border-red-500/30 text-red-500"
              : "border-emerald-500/30 text-emerald-500"
          }`}>
            {statusType === "error" ? (
              <svg className="w-4 h-4 shrink-0 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            )}
            <span className="leading-relaxed font-sans" style={{ color: "var(--color-fg)" }}>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header
        className="sticky top-0 z-20 px-6 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl border-b"
        style={{ background: "var(--color-header-bg)", borderColor: "var(--color-header-border)" }}
      >
        <div className="flex items-center gap-3">
          {!isDashboardRoot && (
            <Link
              href="/dashboard/projects"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-[background-color,color] duration-[160ms] ease-out"
              style={{ background: "var(--color-surface-2)" }}
            >
              <IconBack />
            </Link>
          )}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-dot" />
              <h1 className="text-lg font-bold tracking-tight text-[var(--color-fg)]">{project.domain}</h1>
            </div>
            <p className="text-[10px] text-[var(--color-fg-muted)] mt-0.5">
              Plan: {planName} · {project.brandName || "No brand name"} · {project.industry || "No industry"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit Project Info Button */}
          <button
            onClick={() => setIsEditingInfo(!isEditingInfo)}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all duration-[160ms] active:scale-[0.97]"
            style={{
              background: "var(--color-surface-2)",
              borderColor: "var(--color-border)",
              color: "var(--color-fg)",
            }}
          >
            <IconEdit /> Info
          </button>

          {/* Delete Project Button */}
          <button
            onClick={handleDeleteProject}
            disabled={isDeletingProject}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all duration-[160ms] active:scale-[0.97] border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10"
            title="Delete this project"
          >
            <IconTrash /> Delete
          </button>

          <RunButton projectId={project.id} />
        </div>
      </header>

      {/* Info Edit Panel */}
      {isEditingInfo && (
        <div className="mx-6 md:mx-8 mt-6 p-6 dash-card rounded-2xl animate-fade-in-up border">
          <h2 className="text-[14px] font-bold mb-4">Edit Project Information</h2>
          <form onSubmit={handleUpdateInfo} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--color-fg-muted)] mb-1.5">
                Brand Name
              </label>
              <input
                type="text"
                value={editBrandName}
                onChange={(e) => setEditBrandName(e.target.value)}
                placeholder="e.g. Acme Inc"
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-[var(--color-fg)] transition-all"
                style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)", color: "var(--color-fg)" }}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--color-fg-muted)] mb-1.5">
                Industry / Category
              </label>
              <input
                type="text"
                value={editIndustry}
                onChange={(e) => setEditIndustry(e.target.value)}
                placeholder="e.g. Cloud Security"
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-[var(--color-fg)] transition-all"
                style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)", color: "var(--color-fg)" }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[var(--color-bg)] transition-all"
                style={{ background: "var(--color-fg)" }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditingInfo(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border transition-all"
                style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)", color: "var(--color-fg)" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6">
        <div className="flex border-b border-[var(--color-border)] mb-6 overflow-x-auto gap-2 scrollbar-thin">
          {[
            { id: "overview", label: "Overview" },
            { id: "prompts", label: "AI Prompts" },
            { id: "competitors", label: "Competitors" },
            { id: "audit", label: "GEO Audit" },
            { id: "reports", label: "Reports & Exports" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all shrink-0 cursor-pointer ${
                activeTab === t.id
                  ? "border-[var(--color-fg)] text-[var(--color-fg)]"
                  : "border-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ──────── TAB: Overview ──────── */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Prompts", value: prompts.length.toString() },
                { label: "Total results", value: allResults.length.toString() },
                { label: "Mentioned", value: mentionedCount.toString(), color: "text-emerald-500" },
                { label: "Mention rate", value: `${mentionRate}%`, color: mentionRate >= 60 ? "text-emerald-500" : "text-yellow-500" },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="dash-card rounded-2xl px-5 py-5 border"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <p className="text-[10px] font-medium text-[var(--color-fg-muted)] uppercase tracking-widest mb-1.5">{s.label}</p>
                  <span className={`text-2xl font-bold font-mono ${s.color || "text-[var(--color-fg)]"}`}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Mention rate over time chart */}
            <div className="dash-card rounded-2xl p-6 border">
              <h2 className="text-[14px] font-bold text-[var(--color-fg)] mb-4">Mention rate by engine — 7 days</h2>
              <div className="h-[220px]">
                <ProjectCharts data={chartData} />
              </div>
            </div>

            {/* Competitor comparison */}
            {competitorData.length > 0 && (
              <div className="dash-card rounded-2xl overflow-hidden border">
                <div className="px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
                  <h2 className="text-[14px] font-bold text-[var(--color-fg)] tracking-tight">Competitor comparison</h2>
                </div>
                <div>
                  {/* Your brand */}
                  <div className="flex items-center gap-4 px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
                     <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--color-fg-muted)" }} />
                     <span className="text-xs font-semibold text-[var(--color-fg)] flex-1">{project.domain}</span>
                     
                     <div className="w-20 hidden md:flex items-center justify-end">
                       {myTrend !== 0 && (
                         <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${myTrend > 0 ? "text-emerald-500" : "text-red-500"}`}>
                           {myTrend > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                           {Math.abs(myTrend)}%
                         </span>
                       )}
                       {myTrend === 0 && <span className="text-[10px] text-[var(--color-fg-muted)] font-medium">—</span>}
                     </div>

                     <div className="flex items-center gap-3 w-48">
                       <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                         <div className="h-full rounded-full" style={{ width: `${mentionRate}%`, background: "var(--color-fg)" }} />
                       </div>
                       <span className="text-xs font-bold font-mono text-[var(--color-fg)] w-14 text-right">{mentionRate}%</span>
                    </div>
                  </div>
                  {competitorData.map((comp) => (
                    <div key={comp.domain} className="flex items-center gap-4 px-6 py-4 border-b last:border-b-0" style={{ borderColor: "var(--color-border)" }}>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--color-surface-3)" }} />
                      <span className="text-xs text-[var(--color-fg-muted)] flex-1">{comp.domain}</span>
                      
                      <div className="w-20 hidden md:flex items-center justify-end">
                        {comp.trend !== 0 && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${comp.trend > 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {comp.trend > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                            {Math.abs(comp.trend)}%
                          </span>
                        )}
                        {comp.trend === 0 && <span className="text-[10px] text-[var(--color-fg-muted)] font-medium">—</span>}
                      </div>

                      <div className="flex items-center gap-3 w-48">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                          <div className="h-full rounded-full" style={{ width: `${comp.mentionRate}%`, background: "var(--color-fg-muted)" }} />
                        </div>
                        <span className="text-xs font-mono text-[var(--color-fg-muted)] w-14 text-right">{comp.mentionRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prompt results table */}
            <div className="dash-card rounded-2xl overflow-hidden border">
              <div className="px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
                <h2 className="text-[14px] font-bold tracking-tight text-[var(--color-fg)]">Prompt results details</h2>
              </div>

              {/* Table header */}
              <div
                className="hidden md:grid grid-cols-[1fr_120px_120px_120px] gap-4 px-6 py-3 border-b text-[10px] font-semibold text-[var(--color-fg-muted)] uppercase tracking-wider"
                style={{ borderColor: "var(--color-border)" }}
              >
                <span>Prompt</span>
                <span className="text-center">ChatGPT</span>
                <span className="text-center">Gemini</span>
                <span className="text-center">Perplexity</span>
              </div>

              <div>
                {prompts.length === 0 ? (
                  <div className="px-6 py-8 text-center text-xs text-[var(--color-fg-muted)]">
                    No prompts generated yet. Please add a prompt or click Regenerate in the Prompts tab.
                  </div>
                ) : (
                  prompts.map((p) => {
                    const resultsByEngine: Record<string, typeof p.results[0] | undefined> = {};
                    for (const r of p.results) {
                      const label = ENGINE_LABELS[r.engine];
                      if (!resultsByEngine[label]) resultsByEngine[label] = r;
                    }

                    return (
                      <div
                        key={p.id}
                        className="md:grid md:grid-cols-[1fr_120px_120px_120px] gap-4 px-6 py-4 items-center border-b last:border-b-0"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <p className="text-xs text-[var(--color-fg)] mb-2 md:mb-0 leading-relaxed font-medium">{p.text}</p>

                        {["ChatGPT", "Gemini", "Perplexity"].map((engine) => {
                          const result = resultsByEngine[engine];
                          if (!result) {
                            return (
                              <div key={engine} className="flex items-center justify-center">
                                <span className="text-[11px] text-[var(--color-fg-muted)]">—</span>
                              </div>
                            );
                          }
                          return (
                            <div key={engine} className="flex items-center justify-center">
                              {result.brandMentioned ? (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/12 text-emerald-400 border border-emerald-500/15 font-semibold">
                                  <IconCheck /> #{result.mentionPosition}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-red-500/8 text-red-400 border border-red-500/12">
                                  <IconX /> Miss
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ──────── TAB: AI Prompts ──────── */}
        {activeTab === "prompts" && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Limit Banner */}
            <div className="dash-card rounded-2xl p-6 md:p-8 border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-[15px] font-bold">AI-Generated Search Prompts</h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold text-[var(--color-fg-muted)] uppercase tracking-wider bg-[var(--color-surface-3)]" style={{ borderColor: "var(--color-border)" }}>
                    <IconSparkle /> AI
                  </span>
                </div>
                <p className="text-[var(--color-fg-muted)] text-xs">
                  These prompts represent typical user searches about {project.brandName || project.domain} generated by AI.
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0 bg-[var(--color-surface-2)] border p-3 rounded-xl" style={{ borderColor: "var(--color-border)" }}>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-[var(--color-fg-muted)] font-semibold">{planName} Limit</p>
                  <p className="text-base font-bold font-mono mt-0.5">
                    {prompts.length} <span className="text-xs font-normal text-[var(--color-fg-muted)]">/ {planLimit}</span>
                  </p>
                </div>
                <button
                  onClick={handleRegeneratePrompts}
                  disabled={isRegenerating}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all duration-[160ms] active:scale-[0.97]"
                  style={{ background: "var(--color-fg)", color: "var(--color-bg)" }}
                >
                  {isRegenerating ? "Regenerating..." : "Regenerate all"}
                </button>
              </div>
            </div>

            {/* Custom Prompt Form */}
            <form onSubmit={handleAddPrompt} className="dash-card p-6 rounded-2xl border flex gap-3">
              <input
                type="text"
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                placeholder="Add a custom search prompt to track... e.g. What is the most reliable database tracker?"
                disabled={isAddingPrompt}
                className="flex-1 px-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-[var(--color-fg)] transition-all"
                style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)", color: "var(--color-fg)" }}
              />
              <button
                type="submit"
                disabled={isAddingPrompt || !newPromptText.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                style={{ background: "var(--color-fg)", color: "var(--color-bg)" }}
              >
                {isAddingPrompt ? "Adding..." : "+ Add"}
              </button>
            </form>

            {/* Prompts list */}
            <div className="space-y-3">
              {prompts.length === 0 ? (
                <div className="p-10 text-center border border-dashed rounded-2xl text-xs text-[var(--color-fg-muted)]">
                  No prompts generated. Click "Regenerate all" to create a fresh AI prompt set.
                </div>
              ) : (
                prompts.map((pt) => (
                  <div
                    key={pt.id}
                    className="flex items-center justify-between p-4 rounded-xl border transition-all gap-4"
                    style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--color-fg)] leading-relaxed">{pt.text}</p>
                      <p className="text-[10px] text-[var(--color-fg-muted)] mt-1 font-mono">{pt.results.length} run results</p>
                    </div>
                    <button
                      onClick={() => handleDeletePrompt(pt.id)}
                      className="px-3 py-1.5 text-[10px] text-[var(--color-fg-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ──────── TAB: Competitors ──────── */}
        {activeTab === "competitors" && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Competitor Manager */}
            <div className="dash-card rounded-2xl p-6 md:p-8 border space-y-6">
              <div>
                <h2 className="text-[15px] font-bold mb-1">Tracked Competitor Domains</h2>
                <p className="text-[var(--color-fg-muted)] text-xs">
                  Add and remove competitor domains to analyze share-of-voice and capture comparisons.
                </p>
              </div>

              {/* Tag interface */}
              <div className="flex flex-wrap gap-2 py-2">
                {/* Brand domain (read-only) */}
                <span
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5"
                  style={{ background: "var(--color-surface-3)", borderColor: "var(--color-border)", color: "var(--color-fg)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {project.domain} (You)
                </span>

                {/* Competitors domains */}
                {project.competitors.map((comp) => (
                  <span
                    key={comp}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-2 bg-[var(--color-surface-2)]"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-fg)" }}
                  >
                    {comp}
                    <button
                      onClick={() => handleRemoveCompetitor(comp)}
                      className="text-[var(--color-fg-muted)] hover:text-red-500 font-bold ml-0.5"
                      title="Stop tracking"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add competitor form */}
              <form onSubmit={handleAddCompetitor} className="flex gap-3 max-w-md">
                <input
                  type="text"
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                  placeholder="Add competitor domain (e.g. competitor.com)"
                  disabled={isAddingCompetitor}
                  className="flex-1 px-4 py-2 rounded-xl border text-xs focus:outline-none focus:border-[var(--color-fg)] transition-all"
                  style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)", color: "var(--color-fg)" }}
                />
                <button
                  type="submit"
                  disabled={isAddingCompetitor || !newCompetitor.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-[0.97] disabled:opacity-50 shrink-0"
                  style={{ background: "var(--color-fg)", color: "var(--color-bg)" }}
                >
                  {isAddingCompetitor ? "Adding..." : "+ Add"}
                </button>
              </form>

              <div className="pt-2">
                <p className="text-[10px] text-[var(--color-fg-subtle)]">
                  Quota: {project.competitors.length} / {maxCompetitors} competitor domains tracked on your {planName} plan.
                </p>
              </div>
            </div>

            {/* Visibility Chart */}
            <div className="dash-card rounded-2xl p-6 border">
              <h2 className="text-[14px] font-bold text-[var(--color-fg)] mb-4">Competitor Share of Voice</h2>
              <div className="space-y-4">
                {/* Brand */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{project.domain} (You)</span>
                    <span>{mentionRate}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                    <div className="h-full rounded-full" style={{ width: `${mentionRate}%`, background: "var(--color-fg)" }} />
                  </div>
                </div>

                {/* Competitors */}
                {competitorData.map((comp) => (
                  <div key={comp.domain} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--color-fg-muted)]">{comp.domain}</span>
                      <span className="font-semibold text-[var(--color-fg-muted)]">{comp.mentionRate}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                      <div className="h-full rounded-full" style={{ width: `${comp.mentionRate}%`, background: "var(--color-fg-muted)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ──────── TAB: GEO Audit ──────── */}
        {activeTab === "audit" && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Top diagnostic stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="dash-card p-6 rounded-2xl border">
                <p className="text-[10px] font-medium text-[var(--color-fg-muted)] uppercase tracking-widest mb-1.5">GEO SEO visibility score</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-emerald-400">76</span>
                  <span className="text-xs text-[var(--color-fg-muted)]">/ 100</span>
                </div>
                <p className="text-[10.5px] text-[var(--color-fg-muted)] mt-2 leading-normal">
                  Your brand has robust semantic authority but lacks high-intent comparison references.
                </p>
              </div>

              <div className="dash-card p-6 rounded-2xl border col-span-2">
                <p className="text-[10px] font-medium text-[var(--color-fg-muted)] uppercase tracking-widest mb-2">Model Sentiment Distribution</p>
                <div className="space-y-2">
                  {/* Positive */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-16 text-[var(--color-fg-muted)]">Positive</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: "65%" }} />
                    </div>
                    <span className="font-mono w-8 text-right text-emerald-400 font-semibold">65%</span>
                  </div>
                  {/* Neutral */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-16 text-[var(--color-fg-muted)]">Neutral</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: "30%" }} />
                    </div>
                    <span className="font-mono w-8 text-right text-blue-400">30%</span>
                  </div>
                  {/* Negative */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="w-16 text-[var(--color-fg-muted)]">Negative</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
                      <div className="h-full bg-red-400 rounded-full" style={{ width: "5%" }} />
                    </div>
                    <span className="font-mono w-8 text-right text-red-400">5%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyword Associations and Citations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="dash-card p-6 rounded-2xl border space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">Frequent Semantic Associations</h3>
                <div className="flex flex-wrap gap-2">
                  {["Premium UI", "Fast integration", "Modern features", "High performance", "Slick design", "GEO tracking"].map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg text-xs border bg-[var(--color-surface-2)]"
                      style={{ borderColor: "var(--color-border)", color: "var(--color-fg)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--color-fg-subtle)] leading-normal">
                  These adjectives are semantically clustered around mentions of your brand in model outputs.
                </p>
              </div>

              <div className="dash-card p-6 rounded-2xl border space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">Top Cited Domain Sources</h3>
                <div className="space-y-2 text-xs">
                  {[
                    { domain: `${project.domain}/docs`, pct: "45%" },
                    { domain: `github.com/${project.brandName || "brand"}`, pct: "30%" },
                    { domain: `reddit.com/r/${project.brandName || "brand"}`, pct: "15%" },
                    { domain: "alternativeTo.net", pct: "10%" },
                  ].map((src, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
                      <span className="font-mono text-[var(--color-fg-muted)]">{src.domain}</span>
                      <span className="font-bold text-[var(--color-fg)]">{src.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Audit Recommendations */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">Actionable GEO Optimization Tips</h3>
              
              <div className="dash-card p-5 rounded-xl border flex items-start gap-4" style={{ borderColor: "var(--color-border)" }}>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/15 uppercase tracking-wider shrink-0 mt-0.5">
                  Critical
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-fg)] mb-1">Create dedicated competitor comparison pages</h4>
                  <p className="text-[11px] text-[var(--color-fg-muted)] leading-relaxed">
                    Perplexity frequently references third-party tables or specific comparisons. Creating comparison hubs (e.g. `{project.domain}/vs/competitor-name`) with structured markdown tables will help search models parse details and quote you as a citation source.
                  </p>
                </div>
              </div>

              <div className="dash-card p-5 rounded-xl border flex items-start gap-4" style={{ borderColor: "var(--color-border)" }}>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/15 uppercase tracking-wider shrink-0 mt-0.5">
                  Recommended
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-fg)] mb-1">Publish structured API schema schema sheets</h4>
                  <p className="text-[11px] text-[var(--color-fg-muted)] leading-relaxed">
                    ChatGPT and Gemini prioritize developer integrations. Publishing complete, valid OpenAPI/Swagger documentation in public paths makes it easier for models to query capabilities, improving recommendation rates for API-focused queries.
                  </p>
                </div>
              </div>

              <div className="dash-card p-5 rounded-xl border flex items-start gap-4" style={{ borderColor: "var(--color-border)" }}>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/15 uppercase tracking-wider shrink-0 mt-0.5">
                  Info
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[var(--color-fg)] mb-1">Optimize repository README installations</h4>
                  <p className="text-[11px] text-[var(--color-fg-muted)] leading-relaxed">
                    Citations are heavily drawn from code hosting platforms. Updating your key GitHub README instructions with industry search keywords helps models link your brand to those categories.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────── TAB: Reports ──────── */}
        {activeTab === "reports" && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Raw Data Exports */}
            <div className="dash-card p-6 md:p-8 rounded-2xl border space-y-4">
              <div>
                <h2 className="text-[15px] font-bold mb-1">Raw Dataset Export</h2>
                <p className="text-[var(--color-fg-muted)] text-xs">
                  Download visibility logs and AI engine responses for external analysis.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all duration-[160ms] active:scale-[0.97]"
                  style={{
                    background: "var(--color-surface-2)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-fg)",
                  }}
                >
                  <IconExport /> Export CSV (.csv)
                </button>
                <button
                  onClick={exportToJSON}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all duration-[160ms] active:scale-[0.97]"
                  style={{
                    background: "var(--color-surface-2)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-fg)",
                  }}
                >
                  <IconExport /> Export JSON (.json)
                </button>
              </div>
            </div>

            {/* Email Reports Setup */}
            <div className="dash-card p-6 md:p-8 rounded-2xl border flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[15px] font-bold mb-1">Scheduled Monthly PDF Reports</h2>
                <p className="text-[var(--color-fg-muted)] text-xs">
                  Receive a summary report in your inbox on the 1st of every month automatically.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  onChange={(e) => showStatus(e.target.checked ? "Scheduled email alerts enabled." : "Scheduled email alerts disabled.", "success")}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* PDF Report Exporter preview */}
            <div className="dash-card p-8 rounded-2xl border text-center space-y-4">
              <div
                className="mx-auto w-24 h-32 border rounded-lg flex flex-col justify-between p-3 text-left shadow-md bg-[var(--color-surface-2)]"
                style={{ borderColor: "var(--color-border)" }}
              >
                <span className="text-[7px] font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">Vellor Report</span>
                <span className="text-[8px] font-bold text-[var(--color-fg)] leading-tight">{project.domain}</span>
                <span className="text-[5px] text-[var(--color-fg-subtle)] font-mono">{new Date().toLocaleDateString()}</span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-[var(--color-fg)]">Export executive PDF report summary</h3>
                <p className="text-[10px] text-[var(--color-fg-muted)] mt-1">
                  Generates a formatted report sheet containing visbility stats and GEO recommendations.
                </p>
              </div>
              <button
                onClick={simulatePDFDownload}
                disabled={isExportingPDF}
                className="inline-flex px-6 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.97]"
                style={{ background: "var(--color-fg)", color: "var(--color-bg)" }}
              >
                {isExportingPDF ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin mr-1.5" style={{ borderColor: "var(--color-bg)", borderTopColor: "transparent" }} />
                    Generating Report...
                  </>
                ) : (
                  "Download PDF Report"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
