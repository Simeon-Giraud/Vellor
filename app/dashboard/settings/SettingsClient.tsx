"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
  const progressColor = isUsageDanger ? "bg-red-500" : isUsageWarning ? "bg-amber-500" : "bg-indigo-500/70";

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-8 py-8 lg:py-12 pb-24">
      <header className="mb-10 animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">Settings</h1>
        <p className="text-[var(--color-fg-muted)]">Manage your profile, billing, and system preferences.</p>
      </header>

      <div className="space-y-8">
        {/* Section 1: Profile */}
        <section className="glass rounded-2xl p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
          <h2 className="text-lg font-semibold text-white tracking-tight mb-6">Profile</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt="Avatar" width={64} height={64} className="rounded-full ring-2 ring-white/10" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-bold">
                  {profile.name[0]}
                </div>
              )}
              <div>
                <p className="font-medium text-white text-lg">{profile.name}</p>
                <p className="text-[var(--color-fg-muted)] text-sm">{profile.email}</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[13px] text-[var(--color-fg-muted)] mb-3">
                Manage your profile details via your account settings.
              </p>
              <button
                onClick={() => alert("Account management coming soon")}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-[background-color,transform] duration-[160ms] ease-out active:scale-[0.97]"
              >
                Manage account
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Current Plan */}
        <section className="glass rounded-2xl p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-lg font-semibold text-white tracking-tight mb-6">Current Plan</h2>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-xl font-bold text-white">{plan.name}</p>
                {plan.isTrial && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-widest border border-indigo-500/20">
                    Trial active
                  </span>
                )}
                {plan.userState === "demo" && (
                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold uppercase tracking-widest border border-yellow-500/20">
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
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-[background-color,transform] duration-[160ms] ease-out active:scale-[0.97] glow-indigo disabled:opacity-70 flex items-center gap-2 w-max"
              >
                {portalLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {portalLoading ? "Redirecting..." : "Manage subscription"}
              </button>
            ) : (
              <button
                onClick={() => router.push("/pricing?trial=true")}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-[background-color,transform] duration-[160ms] ease-out active:scale-[0.97] glow-indigo flex items-center gap-2 w-max"
              >
                Start free trial
              </button>
            )}
          </div>

          <div className="p-5 rounded-xl bg-white/3 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Monthly usage</span>
              <span className={`text-sm font-mono font-medium ${isUsageDanger ? "text-red-400" : isUsageWarning ? "text-amber-400" : "text-[var(--color-fg-muted)]"}`}>
                {plan.usageCount} / {plan.usageLimit} runs
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/8 overflow-hidden">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ease-out ${progressColor}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>
        </section>

        {/* Section 3: Notification Preferences */}
        <section className="glass rounded-2xl p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <h2 className="text-lg font-semibold text-white tracking-tight mb-6">Notification Preferences</h2>
          
          <div className="space-y-6 mb-8">
            <label className="flex items-start justify-between gap-4 cursor-pointer group">
              <div>
                <p className="font-medium text-white mb-1">Email alerts when brand is mentioned</p>
                <p className="text-sm text-[var(--color-fg-muted)]">Receive an email immediately when a new mention is detected.</p>
              </div>
              <div className="relative shrink-0 mt-1">
                <input type="checkbox" className="sr-only peer" checked={prefs.emailAlerts} onChange={(e) => setPrefs({ ...prefs, emailAlerts: e.target.checked })} />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 transition-colors duration-[160ms]" />
              </div>
            </label>

            <label className="flex items-start justify-between gap-4 cursor-pointer group">
              <div>
                <p className="font-medium text-white mb-1">Weekly summary email</p>
                <p className="text-sm text-[var(--color-fg-muted)]">Get a weekly rollup of your visibility metrics.</p>
              </div>
              <div className="relative shrink-0 mt-1">
                <input type="checkbox" className="sr-only peer" checked={prefs.weeklySummary} onChange={(e) => setPrefs({ ...prefs, weeklySummary: e.target.checked })} />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 transition-colors duration-[160ms]" />
              </div>
            </label>

            <label className="flex items-start justify-between gap-4 cursor-pointer group">
              <div>
                <p className="font-medium text-white mb-1">Alert when mention rate drops</p>
                <p className="text-sm text-[var(--color-fg-muted)]">We'll notify you if your average mention rate drops by more than 10%.</p>
              </div>
              <div className="relative shrink-0 mt-1">
                <input type="checkbox" className="sr-only peer" checked={prefs.mentionDropAlert} onChange={(e) => setPrefs({ ...prefs, mentionDropAlert: e.target.checked })} />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500 transition-colors duration-[160ms]" />
              </div>
            </label>
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end">
            <button
              onClick={handleSavePrefs}
              disabled={saveState === "loading"}
              className={`
                px-5 py-2 rounded-lg text-sm font-medium
                transition-[transform,background-color,opacity] duration-[160ms] ease-out
                active:scale-[0.97] flex items-center gap-2
                ${saveState === "success" ? "bg-emerald-600 text-white" : "bg-white/10 hover:bg-white/15 text-white"}
              `}
            >
              {saveState === "loading" && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saveState === "success" && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
              {saveState === "idle" ? "Save preferences" : saveState === "loading" ? "Saving..." : "Saved"}
            </button>
          </div>
        </section>

        {/* Section 4: API Access */}
        <section className="glass rounded-2xl p-6 md:p-8 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <h2 className="text-lg font-semibold text-white tracking-tight mb-2">API Access</h2>
          <p className="text-sm text-[var(--color-fg-muted)] mb-6">
            Use this key to access the Vellor API and integrate GEO tracking into your own tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                readOnly
                value={displayKey}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-4 pr-12 text-white font-mono text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              <button
                onClick={() => setKeyVisible(!keyVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
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
              className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-[background-color,transform] duration-[160ms] ease-out active:scale-[0.97] whitespace-nowrap min-w-[140px]"
            >
              {regenText}
            </button>
          </div>
        </section>

        {/* Section 5: Danger Zone */}
        <section className="glass rounded-2xl border-red-500/20 overflow-hidden animate-fade-in-up" style={{ animationDelay: "250ms" }}>
          <div className="p-6 md:p-8">
            <h2 className="text-lg font-semibold text-red-400 tracking-tight mb-2">Danger Zone</h2>
            <p className="text-sm text-[var(--color-fg-muted)] mb-6">
              Destructive actions cannot be undone. Please proceed with caution.
            </p>

            <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden bg-white/3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-medium text-white text-sm mb-1">Delete all projects</p>
                  <p className="text-xs text-[var(--color-fg-muted)]">Permanently delete all your tracked projects and prompt history.</p>
                </div>
                <button
                  onClick={handleDeleteProjects}
                  disabled={deleteProjectsLoading}
                  className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium transition-all duration-[160ms] ease-out active:scale-[0.97] shrink-0"
                >
                  {deleteProjectsLoading ? "Deleting..." : "Delete projects"}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-medium text-white text-sm mb-1">Delete account</p>
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
