"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

/* taste-skill + ui-ux-pro-max:
 * - Semantic glass cards
 * - Monospace numbers
 * - Minimalist, no neon glows
 * Emil Kowalski:
 * - Staggered fade-in-up animations
 * - 160ms transitions on interactive elements
 * - Tactile active:scale on buttons
 */

interface SettingsClientProps {
  profile: { name: string; email: string; avatarUrl: string };
  plan: {
    name: string;
    usageCount: number;
    usageLimit: number;
    subscriptionStatus: string | null;
    hasStripeCustomer: boolean;
    isTrial: boolean;
    userState: string;
  };
  preferences: {
    emailAlerts: boolean;
    weeklySummary: boolean;
    mentionDropAlert: boolean;
  };
}

export default function SettingsClient({ profile, plan, preferences: initialPrefs }: SettingsClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  // Subscriptions
  const [portalLoading, setPortalLoading] = useState(false);
  const handleManagePlan = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
      else setPortalLoading(false);
    } catch {
      setPortalLoading(false);
    }
  };

  // Preferences
  const [prefs, setPrefs] = useState(initialPrefs);
  const [saveState, setSaveState] = useState<"idle" | "loading" | "success">("idle");
  const handleSavePrefs = async () => {
    if (saveState !== "idle") return;
    setSaveState("loading");
    try {
      const res = await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (res.ok) {
        setSaveState("success");
        setTimeout(() => setSaveState("idle"), 2500);
      } else {
        setSaveState("idle");
      }
    } catch {
      setSaveState("idle");
    }
  };

  // API Key
  const [keyVisible, setKeyVisible] = useState(false);
  const apiKey = "vellor_live_a1b2c3d4e5f6g7h8i9j0";
  const displayKey = keyVisible ? apiKey : "vellor_live_••••••••••••••••";

  const [regenText, setRegenText] = useState("Regenerate key");
  const handleRegen = () => {
    setRegenText("Coming soon");
    setTimeout(() => setRegenText("Regenerate key"), 2000);
  };

  // Danger Zone
  const [deleteProjectsLoading, setDeleteProjectsLoading] = useState(false);
  const handleDeleteProjects = async () => {
    if (!window.confirm("Are you sure? This will delete all your projects and data permanently.")) return;
    setDeleteProjectsLoading(true);
    try {
      await fetch("/api/settings/projects", { method: "DELETE" });
      router.refresh();
      setDeleteProjectsLoading(false);
    } catch {
      setDeleteProjectsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("This will permanently delete your account and all data. This cannot be undone. Continue?")) return;
    await supabase.auth.signOut();
    router.push("/");
  };

  const usagePct = Math.min((plan.usageCount / plan.usageLimit) * 100, 100);
  const isUsageWarning = usagePct > 80;
  const isUsageDanger = usagePct > 95;
  const progressColor = isUsageDanger ? "bg-red-500" : isUsageWarning ? "bg-amber-500" : "bg-[var(--color-fg)]";

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-8 py-8 lg:py-12 pb-24">
      <header className="mb-10 animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-[var(--color-fg)]">Settings</h1>
        <p className="text-[var(--color-fg-muted)]">Manage your profile, billing, and system preferences.</p>
      </header>

      <div className="space-y-8">
        {/* Section 1: Profile */}
        <section className="dash-card rounded-2xl p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
          <h2 className="text-lg font-semibold tracking-tight mb-6 text-[var(--color-fg)]">Profile</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt="Avatar" width={64} height={64} className="rounded-full ring-2 ring-[var(--color-border)]" />
              ) : (
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" style={{ background: "var(--color-surface-2)", color: "var(--color-fg)", borderColor: "var(--color-border)" }}>
                  {profile.name[0]}
                </div>
              )}
              <div>
                <p className="font-medium text-lg text-[var(--color-fg)]">{profile.name}</p>
                <p className="text-[var(--color-fg-muted)] text-sm">{profile.email}</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[13px] text-[var(--color-fg-muted)] mb-3">
                Manage your profile details via your account settings.
              </p>
              <button
                onClick={() => alert("Account management coming soon")}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-[background-color,transform] duration-[160ms] ease-out active:scale-[0.97] border"
                style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)", color: "var(--color-fg)" }}
              >
                Manage account
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Current Plan */}
        <section className="dash-card rounded-2xl p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-lg font-semibold tracking-tight mb-6 text-[var(--color-fg)]">Current Plan</h2>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-xl font-bold text-[var(--color-fg)]">{plan.name}</p>
                {plan.isTrial && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-widest border" style={{ background: "var(--color-surface-3)", color: "var(--color-fg)", borderColor: "var(--color-border)" }}>
                    Trial active
                  </span>
                )}
                {plan.userState === "demo" && (
                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-semibold uppercase tracking-widest border border-yellow-500/20">
                    Demo Mode
                  </span>
                )}
              </div>
              {plan.userState === "demo" ? (
                <p className="text-[var(--color-fg-muted)] text-sm mt-1 max-w-sm">
                  You are exploring Vellor with sample data. Upgrade to start running real AI visibility tracking.
                </p>
              ) : (
                <p className="text-[var(--color-fg-muted)] text-sm mt-1">
                  You are currently on the {plan.name} plan.
                </p>
              )}
            </div>
            {plan.hasStripeCustomer ? (
              <button
                onClick={handleManagePlan}
                disabled={portalLoading}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-[background-color,transform,opacity] duration-[160ms] ease-out active:scale-[0.97] disabled:opacity-70 flex items-center gap-2 w-max hover:opacity-90 text-[var(--color-bg)]"
                style={{ background: "var(--color-fg)" }}
              >
                {portalLoading ? <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "var(--color-bg)", borderTopColor: "transparent" }} /> : null}
                {portalLoading ? "Redirecting..." : "Manage subscription"}
              </button>
            ) : (
              <button
                onClick={() => router.push("/pricing?trial=true")}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-[background-color,transform,opacity] duration-[160ms] ease-out active:scale-[0.97] flex items-center gap-2 w-max hover:opacity-90 text-[var(--color-bg)]"
                style={{ background: "var(--color-fg)" }}
              >
                Start free trial
              </button>
            )}
          </div>

          <div className="p-5 rounded-xl border bg-[var(--color-surface-2)] border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--color-fg)]">Monthly usage</span>
              <span className={`text-sm font-mono font-medium ${isUsageDanger ? "text-red-500" : isUsageWarning ? "text-amber-500" : "text-[var(--color-fg-muted)]"}`}>
                {plan.usageCount} / {plan.usageLimit} runs
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ease-out ${progressColor}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>
        </section>

        {/* Section 3: Appearance */}
        <section className="dash-card rounded-2xl p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <h2 className="text-lg font-semibold tracking-tight mb-1" style={{ color: "var(--color-fg)" }}>Appearance</h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-fg-muted)" }}>Choose how the dashboard looks.</p>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Light */}
            <button
              onClick={() => setTheme("light")}
              className="flex-1 flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-[160ms] active:scale-[0.98]"
              style={{
                background: theme === "light" ? "rgba(0,0,0,0.04)" : "var(--color-input-bg)",
                borderColor: theme === "light" ? "var(--color-fg)" : "var(--color-border)",
              }}
            >
              {/* Light mode preview swatch */}
              <div className="w-10 h-10 rounded-lg border border-black/10 flex flex-col gap-1 p-1.5 overflow-hidden shrink-0"
                style={{ background: "#f5f5f7" }}>
                <div style={{ background: "#ffffff", height: "4px", borderRadius: "2px" }} />
                <div style={{ background: "#e5e5e7", height: "4px", borderRadius: "2px", width: "70%" }} />
                <div style={{ background: "#e5e5e7", height: "4px", borderRadius: "2px", width: "50%" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Light</p>
                <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Clean, like the homepage</p>
              </div>
              {theme === "light" && (
                <svg className="ml-auto shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-fg)" }}>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>

            {/* Dark */}
            <button
              onClick={() => setTheme("dark")}
              className="flex-1 flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-[160ms] active:scale-[0.98]"
              style={{
                background: theme === "dark" ? "rgba(255,255,255,0.06)" : "var(--color-input-bg)",
                borderColor: theme === "dark" ? "var(--color-fg)" : "var(--color-border)",
              }}
            >
              {/* Dark mode preview swatch */}
              <div className="w-10 h-10 rounded-lg border border-white/10 flex flex-col gap-1 p-1.5 overflow-hidden shrink-0"
                style={{ background: "#111118" }}>
                <div style={{ background: "#1a1a24", height: "4px", borderRadius: "2px" }} />
                <div style={{ background: "#22222e", height: "4px", borderRadius: "2px", width: "70%" }} />
                <div style={{ background: "#22222e", height: "4px", borderRadius: "2px", width: "50%" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-fg)" }}>Dark</p>
                <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Easier on the eyes at night</p>
              </div>
              {theme === "dark" && (
                <svg className="ml-auto shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-fg)" }}>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </button>
          </div>
        </section>

        {/* Section 4: Notification Preferences */}
        <section className="dash-card rounded-2xl p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <h2 className="text-lg font-semibold tracking-tight mb-6 text-[var(--color-fg)]">Notification Preferences</h2>
          
          <div className="space-y-6 mb-8">
            <label className="flex items-start justify-between gap-4 cursor-pointer group">
              <div>
                <p className="font-medium mb-1 text-[var(--color-fg)]">Email alerts when brand is mentioned</p>
                <p className="text-sm text-[var(--color-fg-muted)]">Receive an email immediately when a new mention is detected.</p>
              </div>
              <div className="relative shrink-0 mt-1">
                <input type="checkbox" className="sr-only peer" checked={prefs.emailAlerts} onChange={(e) => setPrefs({ ...prefs, emailAlerts: e.target.checked })} />
                <div className="w-11 h-6 bg-[var(--color-surface-3)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-fg)] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-fg)] peer-checked:after:bg-[var(--color-bg)] transition-colors duration-[160ms]" />
              </div>
            </label>

            <label className="flex items-start justify-between gap-4 cursor-pointer group">
              <div>
                <p className="font-medium mb-1 text-[var(--color-fg)]">Weekly summary email</p>
                <p className="text-sm text-[var(--color-fg-muted)]">Get a weekly rollup of your visibility metrics.</p>
              </div>
              <div className="relative shrink-0 mt-1">
                <input type="checkbox" className="sr-only peer" checked={prefs.weeklySummary} onChange={(e) => setPrefs({ ...prefs, weeklySummary: e.target.checked })} />
                <div className="w-11 h-6 bg-[var(--color-surface-3)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-fg)] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-fg)] peer-checked:after:bg-[var(--color-bg)] transition-colors duration-[160ms]" />
              </div>
            </label>

            <label className="flex items-start justify-between gap-4 cursor-pointer group">
              <div>
                <p className="font-medium mb-1 text-[var(--color-fg)]">Alert when mention rate drops</p>
                <p className="text-sm text-[var(--color-fg-muted)]">We'll notify you if your average mention rate drops by more than 10%.</p>
              </div>
              <div className="relative shrink-0 mt-1">
                <input type="checkbox" className="sr-only peer" checked={prefs.mentionDropAlert} onChange={(e) => setPrefs({ ...prefs, mentionDropAlert: e.target.checked })} />
                <div className="w-11 h-6 bg-[var(--color-surface-3)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-fg)] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-fg)] peer-checked:after:bg-[var(--color-bg)] transition-colors duration-[160ms]" />
              </div>
            </label>
          </div>

          <div className="pt-6 border-t flex justify-end" style={{ borderColor: "var(--color-border)" }}>
            <button
              onClick={handleSavePrefs}
              disabled={saveState === "loading"}
              className={`
                px-5 py-2 rounded-lg text-sm font-medium border
                transition-[transform,background-color,opacity] duration-[160ms] ease-out
                active:scale-[0.97] flex items-center gap-2
                ${saveState === "success" 
                  ? "bg-emerald-600 text-white border-emerald-700" 
                  : "bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-fg)] border-[var(--color-border)]"
                }
              `}
            >
              {saveState === "loading" && <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "var(--color-fg)", borderTopColor: "transparent" }} />}
              {saveState === "success" && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
              {saveState === "idle" ? "Save preferences" : saveState === "loading" ? "Saving..." : "Saved"}
            </button>
          </div>
        </section>

        {/* Section 5: API Access */}
        <section className="dash-card rounded-2xl p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <h2 className="text-lg font-semibold tracking-tight mb-2 text-[var(--color-fg)]">API Access</h2>
          <p className="text-sm text-[var(--color-fg-muted)] mb-6">
            Use this key to access the Vellor API and integrate GEO tracking into your own tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                readOnly
                value={displayKey}
                className="w-full rounded-lg py-2.5 pl-4 pr-12 font-mono text-sm focus:outline-none border"
                style={{
                  background: "var(--color-surface-2)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-fg)",
                }}
              />
              <button
                onClick={() => setKeyVisible(!keyVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] transition-colors"
                aria-label="Toggle visibility"
              >
                {keyVisible ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            <button
              onClick={handleRegen}
              className="px-4 py-2.5 rounded-lg border text-sm font-medium transition-[background-color,transform] duration-[160ms] ease-out active:scale-[0.97] whitespace-nowrap min-w-[140px]"
              style={{
                background: "var(--color-surface-2)",
                borderColor: "var(--color-border)",
                color: "var(--color-fg)",
              }}
            >
              {regenText}
            </button>
          </div>
        </section>

        {/* Section 6: Danger Zone */}
        <section className="dash-card rounded-2xl border-red-500/20 overflow-hidden animate-fade-in-up border" style={{ animationDelay: "250ms" }}>
          <div className="p-6 md:p-8">
            <h2 className="text-lg font-semibold text-red-500 tracking-tight mb-2">Danger Zone</h2>
            <p className="text-sm text-[var(--color-fg-muted)] mb-6">
              Destructive actions cannot be undone. Please proceed with caution.
            </p>

            <div className="border rounded-xl overflow-hidden" style={{ borderColor: "var(--color-border)", background: "var(--color-surface-2)" }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b" style={{ borderColor: "var(--color-border)" }}>
                <div>
                  <p className="font-medium text-sm mb-1 text-[var(--color-fg)]">Delete all projects</p>
                  <p className="text-xs text-[var(--color-fg-muted)]">Permanently delete all your tracked projects and prompt history.</p>
                </div>
                <button
                  onClick={handleDeleteProjects}
                  disabled={deleteProjectsLoading}
                  className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-sm font-medium transition-all duration-[160ms] ease-out active:scale-[0.97] shrink-0"
                >
                  {deleteProjectsLoading ? "Deleting..." : "Delete projects"}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-medium text-sm mb-1 text-[var(--color-fg)]">Delete account</p>
                  <p className="text-xs text-[var(--color-fg-muted)]">Permanently delete your account and all associated data.</p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all duration-[160ms] ease-out active:scale-[0.97] shrink-0"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
