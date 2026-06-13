"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "./Logo";

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
  ),
};

type NavItem = { label: string; href: string; icon: React.ReactNode; requiresProjects?: boolean };

const NAV_ITEMS: NavItem[] = [
  { label: "Overview",    href: "/dashboard",             icon: icons.dashboard },
  { label: "Projects",    href: "/dashboard/projects",    icon: icons.projects },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: "Settings", href: "/dashboard/settings", icon: icons.settings },
];

interface SidebarProps {
  usageCount?: number;
  usageLimit?: number;
  planName?: string;
  projectCount?: number;
  isCollapsed?: boolean;
  toggleSidebar?: () => void;
  collapseSidebar?: () => void;
  expandSidebar?: () => void;
  userState?: string;
  trialEnd?: string | null;
}

export default function Sidebar({
  usageCount = 0,
  usageLimit = 500,
  planName = "Starter",
  projectCount = 0,
  isCollapsed = false,
  toggleSidebar,
  collapseSidebar,
  expandSidebar,
  userState = "demo",
  trialEnd = null,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userProfile, setUserProfile] = useState<{name: string, email: string} | null>(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const retractTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const asideRef = useRef<HTMLElement | null>(null);
  const isFirstRender = useRef(true);
  const dragOccurredRef = useRef(false);
  const lastDragTimeRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const aside = asideRef.current;
    if (!aside) return;

    const wrapper = aside.parentElement;
    if (!wrapper) return;

    const mainContent = document.querySelector(".dashboard-main-content") as HTMLElement;
    const startWidth = aside.offsetWidth;
    let newWidth = startWidth;

    dragOccurredRef.current = false;

    // Temporarily disable transitions for instant response during drag
    aside.style.transition = "none";
    if (mainContent) {
      mainContent.style.transition = "none";
    }

    // Disable text selection during drag
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      if (Math.abs(deltaX) >= 4) {
        dragOccurredRef.current = true;
      }
      newWidth = Math.max(72, Math.min(320, startWidth + deltaX));
      
      wrapper.style.setProperty("--sidebar-width", `${newWidth}px`);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      // Restore transitions and user select styles
      aside.style.transition = "";
      if (mainContent) {
        mainContent.style.transition = "";
      }

      // Force style reflow to guarantee transitions are registered in sync by the layout engine
      aside.offsetHeight;
      if (mainContent) {
        mainContent.offsetHeight;
      }

      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";

      const deltaX = upEvent.clientX - startX;
      const wasClick = Math.abs(deltaX) < 4;

      if (!wasClick) {
        lastDragTimeRef.current = Date.now();
        // State-aware snapping based on drag direction and relative movement (threshold: 30px)
        const dragThreshold = 30;
        let shouldCollapse = isCollapsed;

        if (isCollapsed) {
          // If currently collapsed, expand to 240px if dragged to the right by more than threshold
          if (deltaX > dragThreshold) {
            shouldCollapse = false;
          }
        } else {
          // If currently extended, collapse to 72px if dragged to the left by more than threshold
          if (deltaX < -dragThreshold) {
            shouldCollapse = true;
          }
        }

        const targetWidth = shouldCollapse ? 72 : 240;

        // Set elements to their target snaps so they transition smoothly
        wrapper.style.setProperty("--sidebar-width", `${targetWidth}px`);

        if (shouldCollapse) {
          if (collapseSidebar) collapseSidebar();
        } else {
          if (expandSidebar) expandSidebar();
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Auto-retract sidebar when navigating to a new route (ignore initial mount)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!isCollapsed && collapseSidebar) {
      collapseSidebar();
    }
  }, [pathname]);

  // Clean up retract timers on unmount
  useEffect(() => {
    return () => {
      if (retractTimeoutRef.current) {
        clearTimeout(retractTimeoutRef.current);
      }
    };
  }, []);

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

  useEffect(() => {
    if (trialEnd) {
      const remaining = Math.max(0, Math.ceil((new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      setDaysRemaining(remaining);
    }
  }, [trialEnd]);

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
    <aside
      ref={asideRef}
      onClick={(e) => {
        // Prevent toggling the sidebar when clicking navigation links or buttons
        const target = e.target as HTMLElement;
        if (target.closest("a") || target.closest("button")) {
          return;
        }
        if (Date.now() - lastDragTimeRef.current < 200) {
          dragOccurredRef.current = false;
          return;
        }
        if (dragOccurredRef.current) {
          dragOccurredRef.current = false;
          return;
        }
        if (isCollapsed && toggleSidebar) {
          toggleSidebar();
        }
      }}
      onMouseEnter={() => {
        if (isCollapsed) {
          setIsSidebarHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (isCollapsed) {
          setIsSidebarHovered(false);
        }
      }}
      className={`main-sidebar transition-[width] duration-300 ease-in-out ${
        isCollapsed ? "cursor-pointer" : ""
      }`}
      style={{
        position: "fixed",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        top: 0,
        bottom: 0,
        left: 0,
        height: "100vh",
        width: "var(--sidebar-width)",
        background: "#000000",
        borderRight: "none",
        borderRadius: 0,
        boxShadow: "none",
        // CSS custom property overrides for dark theme children inside the sidebar
        "--color-sidebar-bg": "#000000",
        "--color-sidebar-border": "rgba(255, 255, 255, 0.08)",
        "--color-sidebar-active-bg": "rgba(255, 255, 255, 0.10)",
        "--color-sidebar-active-border": "rgba(255, 255, 255, 0.16)",
        "--color-sidebar-active-text": "#ffffff",
        "--color-sidebar-text": "#94a3b8",
        "--color-sidebar-hover-bg": "rgba(255, 255, 255, 0.05)",
        "--color-fg": "#ffffff",
        "--color-fg-muted": "#94a3b8",
        "--color-fg-subtle": "#64748b",
        "--color-border": "rgba(255, 255, 255, 0.08)",
        "--color-border-hover": "rgba(255, 255, 255, 0.16)",
        "--color-input-bg": "rgba(255, 255, 255, 0.06)",
        "--color-input-border": "rgba(255, 255, 255, 0.1)",
        "--color-btn-primary-bg": "#ffffff",
        "--color-btn-primary-text": "#000000",
        "--color-avatar-bg": "rgba(255, 255, 255, 0.12)",
        "--color-avatar-border": "rgba(255, 255, 255, 0.15)",
        "--color-usage-fill": "rgba(255, 255, 255, 0.7)",
        "--color-usage-track": "rgba(255, 255, 255, 0.08)",
        "--logo-filter": "invert(1)",
        "--logo-blend": "screen",
      } as React.CSSProperties}
    >
      {/* Header: Logo + theme toggle + sidebar collapse */}
      <div className={`px-4 pt-5 pb-4 flex ${isCollapsed ? "flex-col items-center gap-2" : "items-center justify-between"}`}>
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <Logo className="w-10 h-10 transition-transform duration-[160ms] ease-out group-active:scale-[0.95]" />
          {!isCollapsed && (
            <span
              className="text-[15px] font-semibold tracking-tight whitespace-nowrap"
              style={{ color: "var(--color-fg)" }}
            >
              Vellor
            </span>
          )}
        </Link>

        {/* Controls: collapse chevron */}
        <div className="flex items-center shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar && toggleSidebar();
            }}
            className="p-1.5 rounded-lg border hover:bg-[var(--color-sidebar-hover-bg)] transition-all duration-300 active:scale-[0.93] shrink-0 animate-fade-in"
            style={{
              color: "var(--color-fg-muted)",
              borderColor: "var(--color-sidebar-border)",
            }}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className={`flex-1 ${isCollapsed ? "px-2" : "px-3"} py-2 space-y-1.5 overflow-y-auto`}>
        {visibleNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center rounded-xl text-[13px] font-medium transition-[background-color,color,transform] duration-[160ms] ease-out active:scale-[0.97] ${
                isCollapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5"
              }`}
              style={{
                background: active ? "var(--color-sidebar-active-bg)" : "transparent",
                border: `1px solid ${active ? "var(--color-sidebar-active-border)" : "transparent"}`,
                color: active ? "var(--color-sidebar-active-text)" : "var(--color-sidebar-text)",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-sidebar-hover-bg)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-fg)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-sidebar-text)";
                }
              }}
            >
              <span className="shrink-0 flex items-center justify-center">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className={`px-2 pb-2 space-y-1.5`}>
        {BOTTOM_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center rounded-xl text-[13px] font-medium transition-[background-color,color,transform] duration-[160ms] ease-out active:scale-[0.97] ${
                isCollapsed ? "justify-center w-10 h-10 mx-auto" : "gap-3 px-3 py-2.5"
              }`}
              style={{
                background: active ? "var(--color-sidebar-active-bg)" : "transparent",
                border: `1px solid ${active ? "var(--color-sidebar-active-border)" : "transparent"}`,
                color: active ? "var(--color-sidebar-active-text)" : "var(--color-sidebar-text)",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "var(--color-sidebar-hover-bg)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-fg)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-sidebar-text)";
                }
              }}
            >
              <span className="shrink-0 flex items-center justify-center">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Usage card */}
      {isCollapsed ? (
        <div
          className="mx-3 mb-3 p-2 rounded-xl flex flex-col items-center gap-2 group cursor-pointer relative"
          style={{
            background: "var(--color-input-bg)",
            border: "1px solid var(--color-border)",
          }}
          title={`${planName} plan: ${usageCount} / ${usageLimit} (${Math.round(usagePct)}%)${
            userState === "trialing" && daysRemaining !== null ? ` · Trial: ${daysRemaining}d left` : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            router.push("/dashboard/settings");
          }}
        >
          <span className="text-[9px] font-bold uppercase tracking-wider text-center" style={{ color: "var(--color-fg-muted)" }}>
            {planName[0]}
          </span>
          
          <div className="w-2.5 h-16 bg-[var(--color-sidebar-border)] rounded-full overflow-hidden relative">
            <div
              className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-300"
              style={{
                height: `${usagePct}%`,
                background: isWarning ? "#f59e0b" : "var(--color-usage-fill)",
              }}
            />
          </div>
          
          <span className="text-[10px] font-mono font-medium" style={{ color: isWarning ? "#f59e0b" : "var(--color-fg-muted)" }}>
            {Math.round(usagePct)}%
          </span>
        </div>
      ) : (
        <div
          className="mx-3 mb-3 px-3 py-3 rounded-xl"
          style={{
            background: "var(--color-input-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--color-fg-muted)" }}>
              {planName} plan
            </span>
            <span
              className="text-[11px] font-mono font-medium"
              style={{ color: isWarning ? "#f59e0b" : "var(--color-fg-muted)" }}
            >
              {usageCount} / {usageLimit}
            </span>
          </div>
          <div className="usage-track">
            <div
              className="usage-fill"
              style={{
                width: `${usagePct}%`,
                background: isWarning ? "#f59e0b" : "var(--color-usage-fill)",
              }}
            />
          </div>

          {userState === "trialing" && daysRemaining !== null ? (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium" style={{ color: "var(--color-fg-muted)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-pulse" />
              Trial: {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left
            </p>
          ) : (
            planName !== "Pro" && (
              <Link
                href="/dashboard/settings"
                className="mt-3.5 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[12px] font-semibold transition-all duration-[160ms] ease-out active:scale-[0.96]"
                style={{
                  background: "var(--color-btn-primary-bg)",
                  color: "var(--color-btn-primary-text)",
                }}
              >
                Upgrade
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </Link>
            )
          )}

          {isWarning && planName === "Pro" && (
            <p className="text-[10px] mt-1.5 text-center" style={{ color: "#f59e0b" }}>
              Approaching limit — check settings
            </p>
          )}
        </div>
      )}

      {/* User row */}
      <div
        className="px-3 pb-4 pt-3"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{
                background: "var(--color-avatar-bg)",
                border: "1px solid var(--color-avatar-border)",
                color: "var(--color-fg)",
              }}
              title={`${userProfile?.name || "Account"} (${userProfile?.email || ""})`}
            >
              {userProfile?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSignOut();
              }}
              className="p-1.5 rounded-lg transition-colors shrink-0 active:scale-[0.95] hover:bg-[var(--color-sidebar-hover-bg)]"
              style={{ color: "var(--color-fg-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-fg)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-fg-muted)")}
              title="Sign out"
            >
              {icons.logout}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{
                background: "var(--color-avatar-bg)",
                border: "1px solid var(--color-avatar-border)",
                color: "var(--color-fg)",
              }}
            >
              {userProfile?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: "var(--color-fg)" }}>
                {userProfile?.name || "Account"}
              </p>
              <p className="text-[11px] truncate" style={{ color: "var(--color-fg-muted)" }}>
                {userProfile?.email || ""}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSignOut();
              }}
              className="p-1.5 rounded-lg transition-colors shrink-0 active:scale-[0.95]"
              style={{ color: "var(--color-fg-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-fg)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-fg-muted)")}
              title="Sign out"
            >
              {icons.logout}
            </button>
          </div>
        )}
      </div>

      <div
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          e.stopPropagation();
          if (Date.now() - lastDragTimeRef.current < 200) {
            dragOccurredRef.current = false;
            return;
          }
          if (dragOccurredRef.current) {
            dragOccurredRef.current = false;
            return;
          }
          if (toggleSidebar) toggleSidebar();
        }}
        className="group"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: "-6px",
          width: "12px",
          cursor: "ew-resize",
          zIndex: 9999,
        }}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      />
    </aside>
  );
}
