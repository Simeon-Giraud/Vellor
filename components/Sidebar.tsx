"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "./Logo";

/* ─── Emil-style: snappy 160ms ease-out transitions, active:scale feedback
 *     taste-skill: no emojis, no neon glows, single indigo accent
 *     ui-ux-pro-max: semantic color tokens, divide-y list separation ─── */

// SVG icons — clean, consistent strokeWidth 1.6
const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  projects: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7-6H4a2 2 0 0 0-2 2v16z" />
      <path d="M14 2v6h6" />
    </svg>
  ),
  prompts: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  competitors: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  audit: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  reports: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h.01M7 20v-4M12 20V10M17 20V4" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
};

type NavItem = { label: string; href: string; icon: React.ReactNode; requiresProjects?: boolean };

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",   href: "/dashboard",              icon: icons.dashboard },
  { label: "Projects",    href: "/dashboard/projects",     icon: icons.projects },
  { label: "Prompts",     href: "/dashboard/prompts",      icon: icons.prompts,      requiresProjects: true },
  { label: "Competitors", href: "/dashboard/competitors",  icon: icons.competitors,  requiresProjects: true },
  { label: "Audit",       href: "/dashboard/audit",        icon: icons.audit,        requiresProjects: true },
  { label: "Reports",     href: "/dashboard/reports",      icon: icons.reports,      requiresProjects: true },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: "Settings", href: "/dashboard/settings", icon: icons.settings },
];

interface SidebarProps {
  usageCount?: number;
  usageLimit?: number;
  planName?: string;
  projectCount?: number;
}

export default function Sidebar({
  usageCount = 0,
  usageLimit = 500,
  planName = "Starter",
  projectCount = 0,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userProfile, setUserProfile] = useState<{name: string, email: string} | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserProfile({
          name: user.user_metadata?.full_name || "Account",
          email: user.email || ""
        });
      }
    }
    loadUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  const usagePct = Math.min((usageCount / usageLimit) * 100, 100);
  const isWarning = usagePct > 80;

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.requiresProjects || projectCount > 0
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-[240px] flex flex-col border-r border-white/5 bg-[rgba(10,10,15,0.95)] backdrop-blur-xl">
      <div className="px-5 pt-5 pb-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Logo className="w-10 h-10 transition-transform duration-[160ms] ease-out group-active:scale-[0.95]" />
          <span className="text-[15px] font-semibold text-white tracking-tight">Vellor</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                transition-[background-color,color,transform] duration-[160ms] ease-out
                active:scale-[0.97]
                ${active
                  ? "bg-indigo-500/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  : "text-[var(--color-fg-muted)] hover:text-white hover:bg-white/5"
                }
              `}
            >
              <span className={`shrink-0 ${active ? "text-indigo-400" : ""}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-2 space-y-0.5">
        {BOTTOM_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                transition-[background-color,color,transform] duration-[160ms] ease-out
                active:scale-[0.97]
                ${active
                  ? "bg-indigo-500/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  : "text-[var(--color-fg-muted)] hover:text-white hover:bg-white/5"
                }
              `}
            >
              <span className={`shrink-0 ${active ? "text-indigo-400" : ""}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mx-3 mb-3 px-3 py-3 rounded-xl bg-white/3 border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wider">
            {planName} plan
          </span>
          <span className={`text-[11px] font-mono font-medium ${isWarning ? "text-amber-400" : "text-[var(--color-fg-muted)]"}`}>
            {usageCount} / {usageLimit}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/8 overflow-hidden">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ease-out ${
              isWarning ? "bg-amber-500" : "bg-indigo-500/70"
            }`}
            style={{ width: `${usagePct}%` }}
          />
        </div>
        
        {planName !== "Pro" && (
          <Link
            href="/dashboard/settings"
            className="mt-3.5 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold transition-all duration-[160ms] ease-out active:scale-[0.96] glow-indigo shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
          >
            Upgrade
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </Link>
        )}

        {isWarning && planName === "Pro" && (
          <p className="text-[10px] text-amber-400/80 mt-1.5 text-center">
            Approaching limit — check settings
          </p>
        )}
      </div>

      <div className="px-3 pb-4 border-t border-white/5 pt-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
            {userProfile?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-white truncate">
              {userProfile?.name || "Account"}
            </p>
            <p className="text-[11px] text-[var(--color-fg-muted)] truncate">
              {userProfile?.email || ""}
            </p>
          </div>
          <button onClick={handleSignOut} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Sign out">
            {icons.logout}
          </button>
        </div>
      </div>
    </aside>
  );
}
