"use client";

import Link from "next/link";

export default function PastDueBanner() {
  return (
    <div className="mx-6 md:mx-8 mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in-down">
      <div className="flex items-center gap-2.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-600 shrink-0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p className="text-sm text-red-950 font-medium tracking-tight">
          Your last payment failed. New tracking runs are disabled until your billing is updated.
        </p>
      </div>
      <Link
        href="/pricing"
        className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-[transform,background-color] duration-[160ms] ease-out active:scale-[0.97] cursor-pointer shadow-sm shadow-red-600/10"
      >
        Update Billing
      </Link>
    </div>
  );
}
