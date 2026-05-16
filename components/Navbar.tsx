"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "./Logo";

interface NavbarProps {
  variant?: "landing" | "dashboard";
}

export function Navbar({ variant = "landing" }: NavbarProps) {
  if (variant === "dashboard") {
    return (
      <header className="border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50"
        style={{ background: "rgba(10,10,15,0.8)", backdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-9 h-9" />
            <span className="text-white font-bold hidden sm:inline">Vellor</span>
          </Link>
        </div>
        <nav className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
          <Link href="/dashboard" className="px-2 md:px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-[transform,color,background-color] duration-[160ms] ease-out active:scale-[0.97]">
            Overview
          </Link>
          <Link href="/dashboard/projects/new" className="px-2 md:px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-[transform,color,background-color] duration-[160ms] ease-out active:scale-[0.97]">
            New Project
          </Link>
        </nav>
        {/* Placeholder for User Profile / Settings link */}
        <Link href="/dashboard/settings" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white text-xs">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </Link>
      </header>
    );
  }

  return <LandingNav />;
}

function LandingNav() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsSignedIn(!!session);
      setLoading(false);
    };
    checkUser();
  }, []);

  return (
    <nav className="relative z-10 flex items-center justify-between px-4 md:px-8 py-4 md:py-6 max-w-7xl mx-auto">
      <Link href="/" className="flex items-center gap-2">
        <Logo className="w-10 h-10" />
        <span className="text-xl font-bold text-white">Vellor</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#engines" className="hover:text-white transition-colors">Engines</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
      </div>

      <div className="flex items-center gap-3">
        {!loading && isSignedIn ? (
          <>
            <Link
              href="/dashboard"
              className="px-3 md:px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-medium transition-all duration-200"
            >
              Dashboard →
            </Link>
            <Link href="/dashboard/settings" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white text-xs">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </Link>
          </>
        ) : !loading ? (
          <>
            <Link href="/sign-in" className="px-3 md:px-4 py-2 text-xs md:text-sm text-slate-300 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/sign-up" className="px-3 md:px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-medium transition-all duration-200 glow-indigo">
              Get started <span className="hidden sm:inline">free →</span>
            </Link>
          </>
        ) : null}
      </div>
    </nav>
  );
}
