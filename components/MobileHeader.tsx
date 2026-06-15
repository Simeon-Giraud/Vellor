"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "./Logo";

// SVG Icons matching Sidebar
const icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  projects: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7-6H4a2 2 0 0 0-2 2v16z" />
      <path d="M14 2v6h6" />
    </svg>
  ),
  audit: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  alerts: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  whats_new: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v1M12 20v1M4.22 4.22l.7.7M18.36 18.36l.71.71M3 12h1M20 12h1M4.22 19.78l.7-.7M18.36 5.64l.71-.71M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  menu: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  ),
  close: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

type NavItem = { label: string; href: string; icon: React.ReactNode; requiresProjects?: boolean; hasIndicator?: boolean };

const MAIN_ITEMS: NavItem[] = [
  { label: "Overview",    href: "/dashboard",             icon: icons.dashboard },
  { label: "Projects",    href: "/dashboard/projects",    icon: icons.projects },
];

const TOOLS_ITEMS: NavItem[] = [
  { label: "Page Audit",   href: "/dashboard/audit",       icon: icons.audit, requiresProjects: true },
  { label: "Alerts",      href: "/dashboard/alerts",      icon: icons.alerts, requiresProjects: true },
];

const ACCOUNT_ITEMS: NavItem[] = [
  { label: "Settings",    href: "/dashboard/settings",    icon: icons.settings },
  { label: "What's New",  href: "/dashboard/whats-new",   icon: icons.whats_new, hasIndicator: true },
];

interface MobileHeaderProps {
  usageCount: number;
  usageLimit: number;
  planName: string;
  projectCount: number;
  userState: string;
  trialEnd: string | null;
}

export default function MobileHeader({
  usageCount,
  usageLimit,
  planName,
  projectCount,
  userState,
  trialEnd,
}: MobileHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

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
        className="flex items-center rounded-2xl text-[15px] font-medium transition-colors duration-[160ms] active:scale-[0.98] h-12 px-4 relative"
        style={{
          background: active ? "rgba(255, 255, 255, 0.12)" : "transparent",
          color: active ? "#ffffff" : "#94a3b8",
        }}
      >
        <span className="shrink-0 flex items-center justify-center w-6 relative mr-3">
          {item.icon}
          {item.hasIndicator && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[#111118] shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          )}
        </span>
        <span className="flex items-center justify-between w-full tracking-wide">
          {item.label}
          {item.hasIndicator && (
            <span className="shrink-0 w-2 h-2 bg-blue-500 rounded-full ml-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          )}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Background Dim Overlay */}
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-md z-[90] transition-opacity duration-300 md:hidden ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Floating Container */}
      <div className="fixed top-3 left-3 right-3 z-[100] md:hidden">
        
        {/* Top Pill Bar */}
        <header
          className="bg-black border border-white/15 h-14 rounded-full shadow-lg flex items-center justify-between px-5 relative z-[101]"
        >
          <Link href="/" className="flex items-center gap-2.5 group shrink-0" onClick={() => setIsMenuOpen(false)}>
            <Logo className="w-6 h-6 invert" />
            <span className="text-[15px] font-semibold tracking-tight text-white mt-0.5">
              Vellor
            </span>
          </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300 active:scale-95"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <div className={`transition-transform duration-300 ${isMenuOpen ? "rotate-90 scale-110" : "rotate-0 scale-100"}`}>
              {isMenuOpen ? icons.close : icons.menu}
            </div>
          </button>
        </header>

        {/* Dropdown Menu Card */}
        <div 
          className={`absolute top-[64px] left-0 right-0 bg-[#0a0a0f] border border-white/10 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 transform origin-top ${
            isMenuOpen 
              ? "opacity-100 scale-y-100 translate-y-0" 
              : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
          }`}
        >
          <div className="flex flex-col max-h-[75vh] overflow-y-auto hide-scrollbar">
            <nav className="px-3 pt-5 pb-4 flex flex-col gap-6">
              {/* Main Section */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-2 px-4">Main</div>
                {MAIN_ITEMS.map(renderNavItem)}
              </div>

              {/* Tools Section */}
              {projectCount > 0 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-2 px-4">Tools</div>
                  {TOOLS_ITEMS.map(renderNavItem)}
                </div>
              )}

              {/* Account Section */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] mb-2 px-4">Account</div>
                {ACCOUNT_ITEMS.map(renderNavItem)}
              </div>
            </nav>

            {/* Bottom Actions */}
            <div className="px-3 pt-3 pb-3 mt-auto border-t border-white/10 bg-[#111118]/50">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full rounded-2xl text-[15px] font-medium transition-colors duration-[160ms] active:scale-[0.98] h-12 px-4 text-slate-400 hover:text-white hover:bg-white/10"
              >
                <span className="shrink-0 flex items-center justify-center w-6 mr-3">
                  {icons.logout}
                </span>
                <span className="tracking-wide">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
