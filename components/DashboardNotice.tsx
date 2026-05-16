"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* Emil skill: 160ms ease-out entrance, dismiss via transition not keyframe
 * Appears when ?notice=create-project-first is in URL */

const NOTICES: Record<string, string> = {
  "create-project-first": "Create a project first to access that feature.",
  "setup": "Your project is being set up. We're generating your tracking prompts now — check back in a minute.",
};

export default function DashboardNotice() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const noticeKey = searchParams.get("notice");
  const message = noticeKey ? NOTICES[noticeKey] : null;

  useEffect(() => {
    if (message) {
      setVisible(true);
      // Clean the URL param after showing
      const timer = setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("notice");
        router.replace(url.pathname, { scroll: false });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [message, router]);

  const dismiss = () => setVisible(false);

  if (!message || !visible) return null;

  return (
    <div
      className="mx-6 md:mx-8 mt-4 px-4 py-3 rounded-xl bg-indigo-500/8 border border-indigo-500/15 flex items-center justify-between animate-fade-in-up"
    >
      <p className="text-sm text-indigo-200">{message}</p>
      <button
        onClick={dismiss}
        className="ml-4 text-indigo-400/60 hover:text-indigo-300 transition-colors duration-[160ms] shrink-0 cursor-pointer"
        aria-label="Dismiss notice"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
