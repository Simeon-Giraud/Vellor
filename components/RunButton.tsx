"use client";

import { useState } from "react";

/* Emil skill: button press feedback via scale(0.97).
 * Three states: idle → loading → success, with blur mask on state transition. */

interface RunButtonProps {
  projectId: string;
}

export default function RunButton({ projectId }: RunButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");

  const handleRun = async () => {
    if (state !== "idle") return;
    setState("loading");

    try {
      const res = await fetch(`/api/projects/${projectId}/run`, {
        method: "POST",
      });
      if (res.ok) {
        setState("success");
        setTimeout(() => setState("idle"), 2500);
      } else {
        setState("idle");
      }
    } catch {
      setState("idle");
    }
  };

  return (
    <button
      onClick={handleRun}
      disabled={state === "loading"}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        transition-[transform,background-color,opacity] duration-[160ms] ease-out
        active:scale-[0.97] cursor-pointer
        ${state === "success"
          ? "bg-emerald-600 text-white"
          : "bg-indigo-600 hover:bg-indigo-500 text-white glow-indigo"
        }
        ${state === "loading" ? "opacity-80" : ""}
      `}
    >
      {state === "loading" && (
        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {state === "idle" && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
      {state === "success" && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
      {state === "idle" ? "Run prompts" : state === "loading" ? "Queuing..." : "Queued"}
    </button>
  );
}
