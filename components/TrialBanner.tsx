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
    <div className="w-full px-4 py-2.5 bg-indigo-600/12 border-b border-indigo-500/15 flex items-center justify-between">
      <p className="text-sm text-indigo-200">
        Your free trial ends in <span className="font-semibold text-white">{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</span>. Upgrade to keep access.
      </p>
      <Link
        href="/pricing"
        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-[transform,background-color] duration-[160ms] ease-out active:scale-[0.97] cursor-pointer"
      >
        Upgrade
      </Link>
    </div>
  );
}
