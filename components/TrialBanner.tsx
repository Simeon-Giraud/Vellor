"use client";

import Link from "next/link";

interface TrialBannerProps {
  trialEnd: string | null;
}

export default function TrialBanner({ trialEnd }: TrialBannerProps) {
  const daysRemaining = trialEnd
    ? Math.max(0, Math.ceil((new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 7;
  
  const isUrgent = daysRemaining <= 2;

  return (
    <div className={`mx-6 md:mx-8 mt-6 p-4 flex items-center justify-between animate-fade-in-down rounded-2xl border ${isUrgent ? 'bg-red-500/5 border-red-500/15' : 'bg-amber-500/5 border-amber-500/15'}`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-2 h-2 rounded-full animate-pulse ${isUrgent ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
        <p className={`text-sm font-medium tracking-tight ${isUrgent ? 'text-red-800 dark:text-red-200/90' : 'text-amber-800 dark:text-amber-200/90'}`}>
          Your free trial ends in <span className={`font-bold text-[15px] font-mono ${isUrgent ? 'text-red-950 dark:text-white' : 'text-amber-950 dark:text-white'}`}>{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</span>. Upgrade to keep full access.
        </p>
      </div>
      <Link
        href="/pricing"
        className={`px-4 py-1.5 rounded-lg text-white text-xs font-bold tracking-wide transition-all duration-[160ms] ease-out active:scale-[0.97] cursor-pointer ${isUrgent ? 'bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]' : 'bg-amber-600 hover:bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]'}`}
      >
        Upgrade Now
      </Link>
    </div>
  );
}
