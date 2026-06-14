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
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

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
  const [userProfile, setUserProfile] = useState<{name: string, email: string, avatarUrl: string} | null>(null);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 bg-[#000000] flex items-center justify-between px-4 z-[100] md:hidden"
      style={{
        "--logo-filter": "invert(1)",
        "--logo-blend": "screen",
      } as React.CSSProperties}
    >
      <Link href="/" className="flex items-center gap-2 group shrink-0">
        <Logo className="w-8 h-8" />
        <span className="text-[14px] font-semibold tracking-tight text-white">
          Vellor
        </span>
      </Link>

      <div className="flex items-center gap-3">
        {/* Overview link */}
        <Link
          href="/dashboard"
          title="Overview"
          className="p-2 rounded-lg transition-colors duration-[160ms] active:scale-[0.93] flex items-center justify-center"
          style={{
            color: isActive("/dashboard") ? "#ffffff" : "#94a3b8",
            background: isActive("/dashboard") ? "rgba(255, 255, 255, 0.08)" : "transparent",
          }}
        >
          {icons.dashboard}
        </Link>

        {/* Projects link */}
        <Link
          href="/dashboard/projects"
          title="Projects"
          className="p-2 rounded-lg transition-colors duration-[160ms] active:scale-[0.93] flex items-center justify-center"
          style={{
            color: isActive("/dashboard/projects") ? "#ffffff" : "#94a3b8",
            background: isActive("/dashboard/projects") ? "rgba(255, 255, 255, 0.08)" : "transparent",
          }}
        >
          {icons.projects}
        </Link>

        {/* Settings link */}
        <Link
          href="/dashboard/settings"
          title="Settings"
          className="p-2 rounded-lg transition-colors duration-[160ms] active:scale-[0.93] flex items-center justify-center"
          style={{
            color: isActive("/dashboard/settings") ? "#ffffff" : "#94a3b8",
            background: isActive("/dashboard/settings") ? "rgba(255, 255, 255, 0.08)" : "transparent",
          }}
        >
          {icons.settings}
        </Link>

        {/* Divider line */}
        <div className="w-px h-5 bg-white/[0.12]" />

        {/* Sign Out link */}
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="p-2 rounded-lg transition-colors duration-[160ms] active:scale-[0.93] flex items-center justify-center text-slate-400 hover:text-white"
        >
          {icons.logout}
        </button>
      </div>
    </header>
  );
}
