"use client";

import Link from "next/link";
import { UserButton, SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";

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
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
              V
            </div>
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
        <UserButton />
      </header>
    );
  }

  return (
    <LandingNav />
  );
}

// Client component to read auth state for landing nav
function LandingNav() {
  const { isSignedIn } = useAuth();

  return (
    <nav className="relative z-10 flex items-center justify-between px-4 md:px-8 py-4 md:py-6 max-w-7xl mx-auto">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">
          V
        </div>
        <span className="text-xl font-bold text-white">Vellor</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#engines" className="hover:text-white transition-colors">Engines</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
      </div>

      <div className="flex items-center gap-3">
        {isSignedIn ? (
          <>
            <Link
              href="/dashboard"
              className="px-3 md:px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-medium transition-all duration-200"
            >
              Dashboard →
            </Link>
            <UserButton />
          </>
        ) : (
          <>
            <SignInButton mode="modal">
              <button className="px-3 md:px-4 py-2 text-xs md:text-sm text-slate-300 hover:text-white transition-colors">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-3 md:px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-medium transition-all duration-200 glow-indigo">
                Get started <span className="hidden sm:inline">free →</span>
              </button>
            </SignUpButton>
          </>
        )}
      </div>
    </nav>
  );
}
