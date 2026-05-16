"use client";

import Link from "next/link";

interface TrialBannerProps {
  trialEnd: string | null;
}

export default function TrialBanner({ trialEnd }: TrialBannerProps) {
  const daysRemaining = trialEnd
    ? Math.max(0, Math.ceil((new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 7;

  return (
    <div className="w-full px-6 py-2.5 bg-indigo-600/10 border-b border-indigo-500/15 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl animate-fade-in-down">
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
        <p className="text-sm text-indigo-100/90 font-medium tracking-tight">
          Your free trial ends in <span className="font-bold text-white text-[15px] font-mono">{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</span>. Upgrade to keep full access.
        </p>
      </div>
      <Link
        href="/pricing"
        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold tracking-wide transition-all duration-[160ms] ease-out active:scale-[0.97] cursor-pointer shadow-[0_0_15px_rgba(79,70,229,0.25)]"
      >
        Upgrade Now
      </Link>
    </div>
  );
}
