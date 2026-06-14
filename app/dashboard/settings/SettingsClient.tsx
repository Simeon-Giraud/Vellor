"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

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

type TabId = "profile" | "billing" | "preferences" | "danger";

export default function SettingsClient({ profile, plan, preferences: initialPrefs }: SettingsClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<TabId>("profile");

  // Profile Customization
  const [fullName, setFullName] = useState(profile.name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [profileSaveState, setProfileSaveState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const AVATAR_PRESETS = [
    { name: "Sunset Glow", value: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)" },
    { name: "Ocean Breeze", value: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)" },
    { name: "Purple Dream", value: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)" },
    { name: "Cyber Neon", value: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)" },
    { name: "Golden Hour", value: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)" },
    { name: "Midnight Obsidian", value: "linear-gradient(135deg, #232526 0%, #414345 100%)" },
  ];

  const handleSaveProfile = async () => {
    if (profileSaveState === "loading") return;
    setProfileSaveState("loading");
    try {
      // 1. Update Supabase Auth metadata so client-side Sidebar syncs instantly
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: avatarUrl,
        }
      });
      if (authError) throw authError;

      // 2. Update Database via API
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, avatarUrl }),
      });
      
      if (res.ok) {
        setProfileSaveState("success");
        setTimeout(() => setProfileSaveState("idle"), 2500);
        router.refresh();
      } else {
        setProfileSaveState("error");
        setTimeout(() => setProfileSaveState("idle"), 2500);
      }
    } catch (err) {
      console.error(err);
      setProfileSaveState("error");
      setTimeout(() => setProfileSaveState("idle"), 2500);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  // Subscriptions & Portal
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

  // Modals visibility state
  const [showManageAccountModal, setShowManageAccountModal] = useState(false);
  const [showDeleteProjectsModal, setShowDeleteProjectsModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  // Modal Inputs for confirmation validation
  const [deleteProjectsConfirmText, setDeleteProjectsConfirmText] = useState("");
  const [deleteAccountConfirmEmail, setDeleteAccountConfirmEmail] = useState("");

  const [deleteProjectsLoading, setDeleteProjectsLoading] = useState(false);
  const handleDeleteProjects = async () => {
    if (deleteProjectsConfirmText !== "DELETE ALL") return;
    setDeleteProjectsLoading(true);
    try {
      const res = await fetch("/api/settings/projects", { method: "DELETE" });
      if (res.ok) {
        setDeleteProjectsConfirmText("");
        setShowDeleteProjectsModal(false);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteProjectsLoading(false);
    }
  };

  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const handleDeleteAccount = async () => {
    if (deleteAccountConfirmEmail.trim().toLowerCase() !== profile.email.trim().toLowerCase()) return;
    setDeleteAccountLoading(true);
    try {
      // Clear data and sign user out
      await supabase.auth.signOut();
      router.push("/");
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteAccountLoading(false);
      setShowDeleteAccountModal(false);
    }
  };

  const usagePct = Math.min((plan.usageCount / plan.usageLimit) * 100, 100);
  const isUsageWarning = usagePct > 80;
  const isUsageDanger = usagePct > 95;
  const progressColor = isUsageDanger ? "bg-red-500" : isUsageWarning ? "bg-amber-500" : "bg-[var(--color-fg)]";

  // Tab definitions
  const tabs = [
    {
      id: "profile" as TabId,
      label: "Profile",
      desc: "Manage avatar name and contact information",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      id: "billing" as TabId,
      label: "Billing & Plan",
      desc: "View subscriptions metrics and Stripe invoices",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      id: "preferences" as TabId,
      label: "Preferences",
      desc: "Customize dashboard appearance and mail summaries",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      id: "danger" as TabId,
      label: "Danger Zone",
      desc: "Remove project data and terminate account",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-8 py-8 lg:py-12 pb-24">
      {/* Header */}
      <header className="mb-10 animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-[var(--color-fg)]">Settings</h1>
        <p className="text-[var(--color-fg-muted)]">Configure account preferences, subscription options, and developer key access.</p>
      </header>

      {/* Two-column layout container */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Vertical tab list on desktop, Horizontal row on mobile */}
        <aside className="w-full lg:w-64 shrink-0 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex flex-col space-y-1 bg-[var(--color-sidebar-bg)] border border-[var(--color-sidebar-border)] backdrop-blur-md p-2 rounded-2xl shadow-sm">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-[13px] font-medium transition-all duration-[160ms] ease-out text-left w-full active:scale-[0.98] ${
                    isActive
                      ? "bg-[var(--color-sidebar-active-bg)] border border-[var(--color-sidebar-active-border)] text-[var(--color-sidebar-active-text)]"
                      : "text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover-bg)] border border-transparent"
                  }`}
                >
                  <span className="shrink-0">{tab.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs leading-normal">{tab.label}</p>
                    <p className="text-[10px] opacity-75 truncate font-normal leading-normal">{tab.desc}</p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Mobile/Tablet Swipeable Tabs Navigation */}
          <div className="lg:hidden flex overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 border transition-all duration-[160ms] active:scale-[0.96] ${
                    isActive
                      ? "bg-[var(--color-fg)] border-[var(--color-fg)] text-[var(--color-bg)]"
                      : "bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Column: Tab Content Panel */}
        <main className="flex-1 w-full animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          
          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="dash-card rounded-2xl p-6 md:p-8">
                <h3 className="text-lg font-semibold tracking-tight mb-2 text-[var(--color-fg)]">Profile Details</h3>
                <p className="text-sm text-[var(--color-fg-muted)] mb-6">Customize your display name and choose a unique avatar.</p>

                {/* Avatar Preview & Selection */}
                <div className="flex flex-col md:flex-row gap-8 items-start p-6 rounded-xl border bg-[var(--color-surface-2)] border-[var(--color-border)] mb-8">
                  {/* Left: Preview */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">Preview</span>
                    {avatarUrl && avatarUrl.startsWith("linear-gradient") ? (
                      <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg border border-[var(--color-border)]"
                        style={{ background: avatarUrl }}
                      >
                        {fullName.charAt(0).toUpperCase() || "A"}
                      </div>
                    ) : avatarUrl && (avatarUrl.startsWith("http") || avatarUrl.startsWith("/")) ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar Preview"
                        className="w-20 h-20 rounded-full object-cover shadow-lg border border-[var(--color-border)]"
                        onError={(e) => {
                          // Fallback on broken image link
                          e.currentTarget.style.display = "none";
                          const container = e.currentTarget.parentElement?.querySelector(".fallback-avatar") as HTMLElement;
                          if (container) container.style.display = "flex";
                        }}
                      />
                    ) : null}
                    {/* Fallback initials element */}
                    <div
                      className="fallback-avatar w-20 h-20 rounded-full items-center justify-center text-2xl font-bold border shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] bg-[var(--color-surface-3)] text-[var(--color-fg)] border-[var(--color-border)]"
                      style={{ display: (!avatarUrl || (!avatarUrl.startsWith("linear-gradient") && !avatarUrl.startsWith("http") && !avatarUrl.startsWith("/"))) ? "flex" : "none" }}
                    >
                      {fullName.charAt(0).toUpperCase() || "A"}
                    </div>
                  </div>

                  {/* Right: Select options */}
                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-fg-muted)] mb-2">
                        Select a Preset Gradient
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {AVATAR_PRESETS.map((preset) => {
                          const isSelected = avatarUrl === preset.value;
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => setAvatarUrl(preset.value)}
                              className={`w-10 h-10 rounded-full transition-transform duration-[160ms] hover:scale-[1.08] active:scale-[0.95] flex items-center justify-center relative ${
                                isSelected ? "ring-2 ring-[var(--color-fg)] ring-offset-2 ring-offset-[var(--color-surface-2)] scale-[1.05]" : ""
                              }`}
                              style={{ background: preset.value }}
                              title={preset.name}
                            >
                              {isSelected && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-fg-muted)] mb-2">
                        Or Custom Image URL
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={avatarUrl.startsWith("linear-gradient") ? "" : avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="https://example.com/avatar.jpg"
                          className="flex-1 rounded-lg px-3 py-2 text-sm border bg-[var(--color-surface-3)] border-[var(--color-border)] text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-fg)] transition-colors"
                        />
                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl("")}
                            className="px-3 py-2 rounded-lg text-xs font-semibold border border-[var(--color-border)] hover:bg-[var(--color-sidebar-hover-bg)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Details */}
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-xs font-semibold tracking-wide uppercase text-[var(--color-fg-muted)] mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg px-4 py-2.5 text-sm border bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-fg)] focus:outline-none focus:border-[var(--color-fg)] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wide uppercase text-[var(--color-fg-muted)] mb-1.5">Email Address</label>
                    <input
                      type="text"
                      readOnly
                      value={profile.email}
                      className="w-full rounded-lg px-4 py-2.5 text-sm border bg-[var(--color-surface-2)]/60 border-[var(--color-border)] text-[var(--color-fg-muted)] focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-6">
                  <button
                    onClick={handleSaveProfile}
                    disabled={profileSaveState === "loading"}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-[160ms] ease-out bg-[var(--color-fg)] text-[var(--color-bg)] hover:opacity-90 active:scale-[0.97] disabled:opacity-50 flex items-center gap-2"
                  >
                    {profileSaveState === "loading" && <span className="w-4 h-4 border-2 rounded-full animate-spin border-transparent border-t-current" />}
                    {profileSaveState === "loading" ? "Saving..." : profileSaveState === "success" ? "Saved!" : profileSaveState === "error" ? "Error Saving!" : "Save Profile"}
                  </button>

                  <button
                    onClick={() => setShowManageAccountModal(true)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-[background-color,transform] duration-[160ms] ease-out active:scale-[0.97] border bg-[var(--color-surface-3)] border-[var(--color-border)] hover:bg-[var(--color-sidebar-hover-bg)] text-[var(--color-fg)]"
                  >
                    Manage Account
                  </button>
                </div>
              </div>

              {/* Sign Out Card */}
              <div className="dash-card rounded-2xl p-6 md:p-8 border border-red-500/10 bg-red-500/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-red-500 mb-1">Sign Out of Vellor</h3>
                    <p className="text-sm text-[var(--color-fg-muted)]">Disconnect this device from your account.</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-red-500/20 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all duration-[160ms] ease-out active:scale-[0.97]"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BILLING */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="dash-card rounded-2xl p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-[var(--color-fg)]">Plan Overview</h3>
                    <p className="text-sm text-[var(--color-fg-muted)]">Check current usage statistics and billing cycle.</p>
                  </div>
                  {plan.hasStripeCustomer ? (
                    <button
                      onClick={handleManagePlan}
                      disabled={portalLoading}
                      className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-[background-color,transform,opacity] duration-[160ms] ease-out active:scale-[0.97] disabled:opacity-70 flex items-center gap-2 hover:opacity-90 bg-[var(--color-fg)] text-[var(--color-bg)]"
                    >
                      {portalLoading && <span className="w-4 h-4 border-2 rounded-full animate-spin border-transparent border-t-current" />}
                      {portalLoading ? "Redirecting..." : "Manage Subscription"}
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push("/pricing?trial=true")}
                      className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-[background-color,transform,opacity] duration-[160ms] ease-out active:scale-[0.97] flex items-center gap-2 hover:opacity-90 bg-[var(--color-fg)] text-[var(--color-bg)]"
                    >
                      Start Free Trial
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="p-5 rounded-xl border bg-[var(--color-surface-2)] border-[var(--color-border)]">
                    <p className="text-xs font-semibold tracking-wide uppercase text-[var(--color-fg-muted)] mb-1">Active Plan</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold text-[var(--color-fg)]">{plan.name}</p>
                      {plan.isTrial && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-[var(--color-surface-3)] text-[var(--color-fg)] border-[var(--color-border)]">
                          Trial
                        </span>
                      )}
                      {plan.userState === "demo" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                          Demo
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 rounded-xl border bg-[var(--color-surface-2)] border-[var(--color-border)]">
                    <p className="text-xs font-semibold tracking-wide uppercase text-[var(--color-fg-muted)] mb-1">Stripe Status</p>
                    <p className="text-xl font-bold capitalize text-[var(--color-fg)]">
                      {plan.subscriptionStatus || "No Subscription"}
                    </p>
                  </div>
                </div>

                {/* Progress bar info */}
                <div className="p-6 rounded-xl border bg-[var(--color-surface-2)] border-[var(--color-border)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-[var(--color-fg)]">Monthly usage runs</span>
                    <span className={`text-sm font-mono font-bold ${isUsageDanger ? "text-red-500" : isUsageWarning ? "text-amber-500" : "text-[var(--color-fg-muted)]"}`}>
                      {plan.usageCount} / {plan.usageLimit} runs
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ease-out ${progressColor}`}
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                  <p className="text-xs text-[var(--color-fg-muted)] mt-3">
                    Usage resets at the start of your billing cycle. Reaching 100% of your usage limits will pause tracking queries until next cycle.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              {/* Notification Toggles */}
              <div className="dash-card rounded-2xl p-6 md:p-8">
                <h3 className="text-lg font-semibold tracking-tight mb-2 text-[var(--color-fg)]">Notification Preferences</h3>
                <p className="text-sm text-[var(--color-fg-muted)] mb-6">Select which updates and metrics rollups you want sent to your mailbox.</p>
                
                <div className="space-y-6 mb-8">
                  <label className="flex items-start justify-between gap-4 cursor-pointer group">
                    <div>
                      <p className="font-semibold text-sm mb-1 text-[var(--color-fg)]">Email alerts on brand mentions</p>
                      <p className="text-xs text-[var(--color-fg-muted)]">Receive an email immediately when a new mention is detected.</p>
                    </div>
                    <div className="relative shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={prefs.emailAlerts}
                        onChange={(e) => setPrefs({ ...prefs, emailAlerts: e.target.checked })}
                      />
                      <div className="w-10 h-5 bg-[var(--color-surface-3)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-fg)] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-fg)] peer-checked:after:bg-[var(--color-bg)] transition-colors duration-[160ms]" />
                    </div>
                  </label>

                  <label className="flex items-start justify-between gap-4 cursor-pointer group">
                    <div>
                      <p className="font-semibold text-sm mb-1 text-[var(--color-fg)]">Weekly summary email</p>
                      <p className="text-xs text-[var(--color-fg-muted)]">Get a weekly rollup of your visibility metrics.</p>
                    </div>
                    <div className="relative shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={prefs.weeklySummary}
                        onChange={(e) => setPrefs({ ...prefs, weeklySummary: e.target.checked })}
                      />
                      <div className="w-10 h-5 bg-[var(--color-surface-3)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-fg)] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-fg)] peer-checked:after:bg-[var(--color-bg)] transition-colors duration-[160ms]" />
                    </div>
                  </label>

                  <label className="flex items-start justify-between gap-4 cursor-pointer group">
                    <div>
                      <p className="font-semibold text-sm mb-1 text-[var(--color-fg)]">Alert when mention rate drops</p>
                      <p className="text-xs text-[var(--color-fg-muted)]">Notify you if your average mention rate drops by more than 10%.</p>
                    </div>
                    <div className="relative shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={prefs.mentionDropAlert}
                        onChange={(e) => setPrefs({ ...prefs, mentionDropAlert: e.target.checked })}
                      />
                      <div className="w-10 h-5 bg-[var(--color-surface-3)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--color-fg)] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-fg)] peer-checked:after:bg-[var(--color-bg)] transition-colors duration-[160ms]" />
                    </div>
                  </label>
                </div>

                <div className="pt-5 border-t flex justify-end border-[var(--color-border)]">
                  <button
                    onClick={handleSavePrefs}
                    disabled={saveState === "loading"}
                    className={`
                      px-5 py-2 rounded-lg text-xs font-semibold border
                      transition-[transform,background-color,opacity] duration-[160ms] ease-out
                      active:scale-[0.97] flex items-center gap-2
                      ${saveState === "success" 
                        ? "bg-emerald-600 text-white border-emerald-700" 
                        : "bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] text-[var(--color-fg)] border-[var(--color-border)]"
                      }
                    `}
                  >
                    {saveState === "loading" && <span className="w-4 h-4 border-2 rounded-full animate-spin border-transparent border-t-current" />}
                    {saveState === "success" && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    )}
                    {saveState === "idle" ? "Save Preferences" : saveState === "loading" ? "Saving..." : "Saved"}
                  </button>
                </div>
              </div>
            </div>
          )}



          {/* TAB 5: DANGER ZONE */}
          {activeTab === "danger" && (
            <div className="space-y-6">
              <div className="dash-card rounded-2xl border-red-500/25 p-6 md:p-8">
                <h3 className="text-lg font-semibold text-red-500 tracking-tight mb-2">Danger Zone</h3>
                <p className="text-sm text-[var(--color-fg-muted)] mb-6">These actions are permanent and cannot be rolled back. Use extreme care.</p>
                
                <div className="border rounded-xl overflow-hidden border-[var(--color-border)] bg-[var(--color-surface-2)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-[var(--color-border)]">
                    <div>
                      <p className="font-semibold text-sm mb-1 text-[var(--color-fg)]">Delete all projects</p>
                      <p className="text-xs text-[var(--color-fg-muted)]">Permanently erase all tracked brands, competitors, and run metrics history.</p>
                    </div>
                    <button
                      onClick={() => {
                        setDeleteProjectsConfirmText("");
                        setShowDeleteProjectsModal(true);
                      }}
                      className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/25 text-xs font-semibold transition-all duration-[160ms] ease-out active:scale-[0.97] shrink-0"
                    >
                      Delete projects
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                    <div>
                      <p className="font-semibold text-sm mb-1 text-[var(--color-fg)]">Delete account</p>
                      <p className="text-xs text-[var(--color-fg-muted)]">Permanently delete your profile workspace, custom filters, and credentials data.</p>
                    </div>
                    <button
                      onClick={() => {
                        setDeleteAccountConfirmEmail("");
                        setShowDeleteAccountModal(true);
                      }}
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all duration-[160ms] ease-out active:scale-[0.97] shrink-0"
                    >
                      Delete account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* CUSTOM MODAL 1: MANAGE ACCOUNT DETAILS */}
      {showManageAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="dash-card max-w-md w-full p-6 mx-4 rounded-2xl shadow-2xl animate-fade-in-up border border-[var(--color-border)] bg-[var(--color-sidebar-bg)] backdrop-blur-lg">
            <h4 className="text-lg font-bold text-[var(--color-fg)] mb-3 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Manage Account Details
            </h4>
            <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed mb-5">
              Secure account modifications (such as password changes, identity details, or multi-factor authentication setup) are handled via our Supabase authentication portal.
            </p>
            <div className="p-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl mb-6">
              <span className="text-[11px] font-bold text-[var(--color-fg-muted)] uppercase tracking-wide block mb-1">Your registered email</span>
              <span className="text-xs font-semibold text-[var(--color-fg)] font-mono">{profile.email}</span>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowManageAccountModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-[160ms] ease-out bg-[var(--color-fg)] text-[var(--color-bg)] hover:opacity-90 active:scale-[0.97]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}



      {/* CUSTOM MODAL 3: DELETE ALL PROJECTS CONFIRMATION */}
      {showDeleteProjectsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="dash-card max-w-md w-full p-6 mx-4 rounded-2xl shadow-2xl animate-fade-in-up border border-red-500/20 bg-[var(--color-sidebar-bg)] backdrop-blur-lg">
            <h4 className="text-lg font-bold text-red-500 mb-3 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete All Projects?
            </h4>
            <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed mb-4">
              This action is destructive and will permanently delete all tracked brand configurations, keyword queries, historical SEO scores, and reports. There is no rollback available.
            </p>
            <div className="mb-5">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-2">
                Type <span className="text-[var(--color-fg)] font-bold font-mono">DELETE ALL</span> to confirm
              </label>
              <input
                type="text"
                value={deleteProjectsConfirmText}
                onChange={(e) => setDeleteProjectsConfirmText(e.target.value)}
                placeholder="DELETE ALL"
                className="w-full rounded-lg px-3.5 py-2 text-sm border bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-fg)] focus:outline-none focus:border-red-500/50"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteProjectsConfirmText("");
                  setShowDeleteProjectsModal(false);
                }}
                disabled={deleteProjectsLoading}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-[160ms] ease-out border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[var(--color-fg)] active:scale-[0.97] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProjects}
                disabled={deleteProjectsConfirmText !== "DELETE ALL" || deleteProjectsLoading}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-[160ms] ease-out bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] flex items-center gap-2"
              >
                {deleteProjectsLoading && <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin border-transparent border-t-current" />}
                {deleteProjectsLoading ? "Deleting..." : "Erase All Projects"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM MODAL 4: DELETE ACCOUNT CONFIRMATION */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="dash-card max-w-md w-full p-6 mx-4 rounded-2xl shadow-2xl animate-fade-in-up border border-red-500/25 bg-[var(--color-sidebar-bg)] backdrop-blur-lg">
            <h4 className="text-lg font-bold text-red-500 mb-3 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                <line x1="12" y1="2" x2="12" y2="12" />
              </svg>
              Delete Account Permanently?
            </h4>
            <p className="text-xs text-[var(--color-fg-muted)] leading-relaxed mb-4">
              This will terminate your workspace account and wipe all projects, billing associations, search filters, and dashboard data. This process cannot be reversed.
            </p>
            <div className="mb-5">
              <label className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-fg-muted)] mb-2">
                Type your email <span className="text-[var(--color-fg)] font-bold font-mono">{profile.email}</span> to confirm
              </label>
              <input
                type="text"
                value={deleteAccountConfirmEmail}
                onChange={(e) => setDeleteAccountConfirmEmail(e.target.value)}
                placeholder={profile.email}
                className="w-full rounded-lg px-3.5 py-2 text-sm border bg-[var(--color-surface-2)] border-[var(--color-border)] text-[var(--color-fg)] focus:outline-none focus:border-red-500/50"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteAccountConfirmEmail("");
                  setShowDeleteAccountModal(false);
                }}
                disabled={deleteAccountLoading}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-[160ms] ease-out border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[var(--color-fg)] active:scale-[0.97] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteAccountConfirmEmail.trim().toLowerCase() !== profile.email.trim().toLowerCase() || deleteAccountLoading}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-[160ms] ease-out bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] flex items-center gap-2"
              >
                {deleteAccountLoading && <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin border-transparent border-t-current" />}
                {deleteAccountLoading ? "Terminating..." : "Terminate Account"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
