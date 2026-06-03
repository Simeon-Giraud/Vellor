"use client";

import Link from "next/link";

export default function PastDueBanner() {
  return (
    <div className="w-full px-4 py-2.5 bg-red-600/10 border-b border-red-500/20 flex items-center justify-between animate-fade-in-down sticky top-0 z-50 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-500" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p className="text-sm text-red-200/90 font-medium tracking-tight">
          Your last payment failed. New tracking runs are disabled until your billing is updated.
        </p>
      </div>
      <Link
        href="/pricing"
        className="px-4 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-200 text-xs font-semibold border border-red-500/30 transition-[transform,background-color] duration-[160ms] ease-out active:scale-[0.97] cursor-pointer"
      >
        Update Billing
      </Link>
    </div>
  );
}
