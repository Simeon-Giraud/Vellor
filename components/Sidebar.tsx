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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  alerts: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  whats_new: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v1M12 20v1M4.22 4.22l.7.7M18.36 18.36l.71.71M3 12h1M20 12h1M4.22 19.78l.7-.7M18.36 5.64l.71-.71M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
    </svg>
  ),
};

type NavItem = { label: string; href: string; icon: React.ReactNode; requiresProjects?: boolean; hasIndicator?: boolean };

const MAIN_ITEMS: NavItem[] = [
  { label: "Overview",    href: "/dashboard",             icon: icons.dashboard },
  { label: "Projects",    href: "/dashboard/projects",    icon: icons.projects },
];

const TOOLS_ITEMS: NavItem[] = [
  { label: "GEO Audit",   href: "/dashboard/audit",       icon: icons.audit, requiresProjects: true },
  { label: "Alerts",      href: "/dashboard/alerts",      icon: icons.alerts, requiresProjects: true },
];

const ACCOUNT_ITEMS: NavItem[] = [
  { label: "Settings",    href: "/dashboard/settings",    icon: icons.settings },
  { label: "What's New",  href: "/dashboard/whats-new",   icon: icons.whats_new, hasIndicator: true },
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
  const [userProfile, setUserProfile] = useState<{name: string, email: string, avatarUrl: string} | null>(null);
  const renderAvatar = (url: string | undefined, name: string, className: string = "w-8 h-8 text-sm") => {
    const initials = name.charAt(0).toUpperCase() || "A";
    if (url && url.startsWith("linear-gradient")) {
      return (
        <div
          className={`${className} rounded-full flex items-center justify-center font-bold text-white shadow-md`}
          style={{ background: url }}
        >
          {initials}
        </div>
      );
    }
    if (url && (url.startsWith("http") || url.startsWith("/"))) {
      return (
        <img
          src={url}
          alt="Avatar"
          className={`${className} rounded-full object-cover`}
        />
      );
    }
    return (
      <div
        className={`${className} rounded-full flex items-center justify-center font-bold`}
        style={{
          background: "var(--color-avatar-bg)",
          border: "1px solid var(--color-avatar-border)",
          color: "var(--color-fg)",
        }}
      >
        {initials}
      </div>
    );
  };
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

    // Add dragging class to disable transitions for 1:1 cursor tracking
    aside.classList.add("is-dragging");
    wrapper.classList.add("is-dragging");
    if (mainContent) {
      mainContent.classList.add("is-dragging");
    }

    // Temporarily disable transitions for instant response during drag
    aside.style.transition = "none";
    wrapper.style.transition = "none";
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

      // Real-time JS calculation during dragging for standard-compliant values
      const textOpacity = Math.max(0, Math.min(1, (newWidth - 130) / 50));
      const textMaxWidth = textOpacity * 160;
      const expandedOpacity = Math.max(0, Math.min(1, (newWidth - 140) / 40));
      const collapsedOpacity = Math.max(0, Math.min(1, (130 - newWidth) / 40));
      const linkPx = 12 + Math.max(0, Math.min(3, (130 - newWidth) * 0.0517));
      const cardPadding = 12 - Math.max(0, Math.min(4, (120 - newWidth) * 0.0833));

      aside.style.setProperty("--sidebar-text-opacity", String(textOpacity));
      aside.style.setProperty("--sidebar-text-max-width", `${textMaxWidth}px`);
      aside.style.setProperty("--sidebar-expanded-opacity", String(expandedOpacity));
      aside.style.setProperty("--sidebar-collapsed-opacity", String(collapsedOpacity));
      aside.style.setProperty("--sidebar-link-px", `${linkPx}px`);
      aside.style.setProperty("--sidebar-card-padding", `${cardPadding}px`);

      // Dynamically center header logo during drag
      const header = aside.querySelector(".sidebar-header") as HTMLElement;
      if (header) {
        header.style.justifyContent = newWidth < 130 ? "center" : "space-between";
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      // Clean up drag overrides so state transitions take over
      aside.style.removeProperty("--sidebar-text-opacity");
      aside.style.removeProperty("--sidebar-text-max-width");
      aside.style.removeProperty("--sidebar-expanded-opacity");
      aside.style.removeProperty("--sidebar-collapsed-opacity");
      aside.style.removeProperty("--sidebar-link-px");
      aside.style.removeProperty("--sidebar-card-padding");

      const header = aside.querySelector(".sidebar-header") as HTMLElement;
      if (header) {
        header.style.removeProperty("justify-content");
      }

      // Remove dragging class to restore smooth transitions
      aside.classList.remove("is-dragging");
      wrapper.classList.remove("is-dragging");
      if (mainContent) {
        mainContent.classList.remove("is-dragging");
      }

      // Restore transitions and user select styles
      aside.style.transition = "";
      wrapper.style.transition = "";
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
          email: user.email || "",
          avatarUrl: user.user_metadata?.avatar_url || ""
        });
      }
    }
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserProfile({
          name: session.user.user_metadata?.full_name || "Account",
          email: session.user.email || "",
          avatarUrl: session.user.user_metadata?.avatar_url || ""
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        title={isCollapsed ? item.label : undefined}
        className="flex items-center rounded-xl text-[13px] font-medium transition-all duration-[320ms] ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] h-10 relative group"
        style={{
          background: active ? "var(--color-sidebar-active-bg)" : "transparent",
          border: `1px solid ${active ? "var(--color-sidebar-active-border)" : "transparent"}`,
          color: active ? "var(--color-sidebar-active-text)" : "var(--color-sidebar-text)",
          justifyContent: "flex-start",
          paddingLeft: "var(--sidebar-link-px)",
          paddingRight: "var(--sidebar-link-px)",
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
        <span className="shrink-0 flex items-center justify-center w-[18px] relative">
          {item.icon}
          {item.hasIndicator && (
            <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[var(--color-sidebar-bg)] shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          )}
        </span>
        <span
          style={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            maxWidth: "var(--sidebar-text-max-width)",
            opacity: "var(--sidebar-text-opacity)",
            marginLeft: "calc(var(--sidebar-text-opacity) * 12px)",
            transition: "max-width 320ms cubic-bezier(0.32,0.72,0,1), opacity 320ms ease, margin-left 320ms cubic-bezier(0.32,0.72,0,1)",
            pointerEvents: "none",
          }}
          className="flex items-center justify-between w-full"
        >
          {item.label}
          {item.hasIndicator && (
            <span className="shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full ml-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          )}
        </span>
      </Link>
    );
  };

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
      className={`main-sidebar hidden md:flex transition-[width] duration-[320ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isCollapsed ? "cursor-pointer" : ""
      }`}
      style={{
        position: "fixed",
        zIndex: 100,
        display: undefined,
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
        // CSS custom properties driven by React state when not dragging
        "--sidebar-text-opacity": isCollapsed ? 0 : 1,
        "--sidebar-text-max-width": isCollapsed ? "0px" : "160px",
        "--sidebar-expanded-opacity": isCollapsed ? 0 : 1,
        "--sidebar-collapsed-opacity": isCollapsed ? 1 : 0,
        "--sidebar-link-mx": isCollapsed ? "4px" : "0px",
        "--sidebar-link-px": isCollapsed ? "15px" : "12px",
        "--sidebar-card-padding": isCollapsed ? "8px" : "12px",
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
      {/* Header: Logo + collapse button */}
      <div 
        className="px-4 pt-5 pb-4 flex items-center sidebar-header"
        style={{
          justifyContent: isCollapsed ? "center" : "space-between",
        }}
      >
        <Link 
          href="/" 
          className="flex items-center group shrink-0 min-w-0"
          style={{
            gap: "calc(var(--sidebar-text-opacity) * 10px)",
          }}
        >
          <Logo className="w-10 h-10 shrink-0 transition-transform duration-[160ms] ease-out group-active:scale-[0.95]" />
          <div 
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              overflow: "hidden",
              maxWidth: "var(--sidebar-text-max-width)",
              opacity: "var(--sidebar-text-opacity)",
              transition: "max-width 320ms cubic-bezier(0.32,0.72,0,1), opacity 320ms ease",
              pointerEvents: isCollapsed ? "none" : "auto",
              flexShrink: 0,
            }}
          >
            <span
              className="text-[15px] font-semibold tracking-tight whitespace-nowrap"
              style={{ color: "var(--color-fg)" }}
            >
              Vellor
            </span>
            {userState === "demo" && (
              <span className="text-[9px] font-bold bg-white/10 text-white px-1.5 py-0.5 rounded-md border border-white/15 uppercase tracking-wider whitespace-nowrap shrink-0">
                Demo
              </span>
            )}
          </div>
        </Link>

        {/* Collapse chevron */}
        <div className="flex items-center shrink-0 sidebar-header-controls">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSidebar && toggleSidebar();
            }}
            className="p-1.5 rounded-lg border hover:bg-[var(--color-sidebar-hover-bg)] transition-all duration-300 active:scale-[0.93] shrink-0"
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
              style={{
                transition: "transform 300ms cubic-bezier(0.32,0.72,0,1)",
                transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Main Section */}
        <div className="space-y-1">
          {MAIN_ITEMS.map(renderNavItem)}
        </div>

        {/* Tools Section */}
        {projectCount > 0 && (
          <div className="space-y-1 relative">
            <div 
              className="flex items-center px-3 mb-1"
              style={{
                opacity: "var(--sidebar-expanded-opacity)",
                height: "calc(var(--sidebar-expanded-opacity) * 16px)",
                overflow: "hidden",
                transition: "height 320ms ease, opacity 320ms ease"
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-fg-subtle)]">Tools</span>
            </div>
            {/* Divider when collapsed */}
            <div 
              className="mx-4 my-2 border-t"
              style={{
                borderColor: "var(--color-sidebar-border)",
                opacity: "var(--sidebar-collapsed-opacity)",
                display: isCollapsed ? "block" : "none",
              }}
            />
            {TOOLS_ITEMS.map(renderNavItem)}
          </div>
        )}

        {/* Account Section */}
        <div className="space-y-1 relative">
           <div 
              className="flex items-center px-3 mb-1"
              style={{
                opacity: "var(--sidebar-expanded-opacity)",
                height: "calc(var(--sidebar-expanded-opacity) * 16px)",
                overflow: "hidden",
                transition: "height 320ms ease, opacity 320ms ease"
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-fg-subtle)]">Account</span>
            </div>
            {/* Divider when collapsed */}
            <div 
              className="mx-4 my-2 border-t"
              style={{
                borderColor: "var(--color-sidebar-border)",
                opacity: "var(--sidebar-collapsed-opacity)",
                display: isCollapsed ? "block" : "none",
              }}
            />
          {ACCOUNT_ITEMS.map(renderNavItem)}
        </div>
      </nav>

      {/* Usage card */}
      <div 
        onClick={(e) => {
          if (isCollapsed) {
            e.stopPropagation();
            router.push(userState === "demo" ? "/pricing?trial=true" : "/dashboard/settings");
          }
        }}
        className={`mx-3 mb-3 rounded-xl border transition-all duration-[320ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isCollapsed ? "cursor-pointer hover:bg-white/[0.04] active:scale-[0.98]" : ""
        }`}
        style={{
          background: userState === "demo" ? "rgba(255, 255, 255, 0.02)" : "var(--color-input-bg)",
          borderColor: userState === "demo" ? "rgba(255, 255, 255, 0.06)" : "var(--color-border)",
          padding: "var(--sidebar-card-padding)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {userState === "demo" ? (
          <div className="relative">
            {/* Collapsed Demo View */}
            <div
              style={{
                opacity: "var(--sidebar-collapsed-opacity)",
                maxHeight: "calc(var(--sidebar-collapsed-opacity) * 45px)",
                overflow: "hidden",
                transition: "max-height 320ms cubic-bezier(0.32,0.72,0,1), opacity 320ms ease",
                pointerEvents: isCollapsed ? "auto" : "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 pulse-dot-yellow" />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>

            {/* Expanded Demo View */}
            <div
              style={{
                opacity: "var(--sidebar-expanded-opacity)",
                maxHeight: "calc(var(--sidebar-expanded-opacity) * 150px)",
                overflow: "hidden",
                transition: "max-height 320ms cubic-bezier(0.32,0.72,0,1), opacity 320ms ease",
                pointerEvents: isCollapsed ? "none" : "auto",
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 pulse-dot-yellow" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                  Demo Mode
                </span>
              </div>
              <p className="text-[11px] leading-relaxed mb-3 text-slate-400">
                Start your free trial to run real AI visibility checks.
              </p>
              <Link
                href="/pricing?trial=true"
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[12px] font-semibold bg-white hover:bg-zinc-200 text-black transition-all duration-[160ms] ease-out active:scale-[0.96] shadow-sm"
              >
                Start Free Trial
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Collapsed Paid View */}
            <div
              style={{
                opacity: "var(--sidebar-collapsed-opacity)",
                maxHeight: "calc(var(--sidebar-collapsed-opacity) * 110px)",
                overflow: "hidden",
                transition: "max-height 320ms cubic-bezier(0.32,0.72,0,1), opacity 320ms ease",
                pointerEvents: isCollapsed ? "auto" : "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-center" style={{ color: "var(--color-fg-muted)" }}>
                {planName[0]}
              </span>
              <div className="w-2.5 h-14 bg-[var(--color-sidebar-border)] rounded-full overflow-hidden relative">
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

            {/* Expanded Paid View */}
            <div
              style={{
                opacity: "var(--sidebar-expanded-opacity)",
                maxHeight: "calc(var(--sidebar-expanded-opacity) * 140px)",
                overflow: "hidden",
                transition: "max-height 320ms cubic-bezier(0.32,0.72,0,1), opacity 320ms ease",
                pointerEvents: isCollapsed ? "none" : "auto",
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
          </div>
        )}
      </div>

      {/* User row */}
      <div className="px-3 pb-4">
        <div 
          className="rounded-xl border transition-all duration-[320ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            borderColor: "rgba(255, 255, 255, 0.06)",
            padding: "calc(var(--sidebar-card-padding) * 0.83) var(--sidebar-card-padding)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="relative">
            {/* Collapsed User View */}
            <div
              style={{
                opacity: "var(--sidebar-collapsed-opacity)",
                maxHeight: "calc(var(--sidebar-collapsed-opacity) * 85px)",
                overflow: "hidden",
                transition: "max-height 320ms cubic-bezier(0.32,0.72,0,1), opacity 320ms ease",
                pointerEvents: isCollapsed ? "auto" : "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Link
                href="/dashboard/settings"
                className="transition-all active:scale-[0.95] hover:opacity-80 shrink-0"
                title={`${userProfile?.name || "Account"} (${userProfile?.email || ""})`}
              >
                {renderAvatar(userProfile?.avatarUrl, userProfile?.name || "A", "w-8 h-8 text-xs")}
              </Link>
              <div className="w-full h-px bg-white/[0.08]" />
              <button
                onClick={(e) => { e.stopPropagation(); handleSignOut(); }}
                className="p-1.5 rounded-lg transition-colors active:scale-[0.95] text-slate-400 hover:text-white hover:bg-white/[0.06] shrink-0"
                title="Sign out"
              >
                {icons.logout}
              </button>
            </div>

            {/* Expanded User View */}
            <div
              style={{
                opacity: "var(--sidebar-expanded-opacity)",
                maxHeight: "calc(var(--sidebar-expanded-opacity) * 45px)",
                overflow: "hidden",
                transition: "max-height 320ms cubic-bezier(0.32,0.72,0,1), opacity 320ms ease",
                pointerEvents: isCollapsed ? "none" : "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
              >
                {renderAvatar(userProfile?.avatarUrl, userProfile?.name || "Account", "w-8 h-8 text-sm")}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: "var(--color-fg)" }}>
                    {userProfile?.name || "Account"}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: "var(--color-fg-muted)" }}>
                    {userProfile?.email || ""}
                  </p>
                </div>
              </Link>
              <button
                onClick={(e) => { e.stopPropagation(); handleSignOut(); }}
                className="p-1.5 rounded-lg transition-colors shrink-0 active:scale-[0.95] text-slate-400 hover:text-white hover:bg-white/[0.06]"
                title="Sign out"
              >
                {icons.logout}
              </button>
            </div>
          </div>
        </div>
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
