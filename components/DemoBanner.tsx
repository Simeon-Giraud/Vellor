"use client";

import Link from "next/link";

export default function DemoBanner() {
  return (
    <div className="mx-6 md:mx-8 mt-6 p-4 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-between animate-fade-in-down">
      <div className="flex items-center gap-2.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-purple-600 shrink-0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p className="text-sm text-purple-950 font-medium tracking-tight">
          You are currently in demo mode. Start your 7-day free trial to run real AI visibility checks.
        </p>
      </div>
      <Link
        href="/pricing?trial=true"
        className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-[transform,background-color] duration-[160ms] ease-out active:scale-[0.97] cursor-pointer shadow-sm shadow-purple-600/10"
      >
        Start Free Trial
      </Link>
    </div>
  );
}
