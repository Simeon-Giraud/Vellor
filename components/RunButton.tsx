"use client";

import { useState } from "react";

interface RunButtonProps {
  projectId: string;
  onRunSuccess?: () => void;
  onRunError?: (msg: string) => void;
  disabled?: boolean;
}

export default function RunButton({ projectId, onRunSuccess, onRunError, disabled }: RunButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");

  const handleRun = async () => {
    if (state !== "idle" || disabled) return;
    setState("loading");

    try {
      const res = await fetch(`/api/projects/${projectId}/run`, {
        method: "POST",
      });
      if (res.ok) {
        setState("success");
        onRunSuccess?.();
        setTimeout(() => setState("idle"), 2500);
      } else {
        const text = await res.text().catch(() => "");
        let msg = "Failed to run prompts.";
        try {
          const errorData = JSON.parse(text);
          msg = errorData.message || errorData.error || msg;
        } catch {
          msg = `Server Error (${res.status}): ${text.slice(0, 100)}`;
        }
        onRunError?.(msg);
        setState("idle");
      }
    } catch (err: any) {
      onRunError?.(`Network Error: ${err.message || "Failed to run prompts."}`);
      setState("idle");
    }
  };

  const successStyle: React.CSSProperties = {
    background: "#059669",
    color: "#ffffff",
  };

  const idleStyle: React.CSSProperties = {
    background: "var(--color-btn-primary-bg)",
    color: "var(--color-btn-primary-text)",
  };

  return (
    <button
      onClick={handleRun}
      disabled={state === "loading" || disabled}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
        transition-[transform,background-color,opacity] duration-[160ms] ease-out
        active:scale-[0.97] cursor-pointer
        ${state === "loading" || disabled ? "opacity-80 cursor-not-allowed" : ""}
      `}
      style={state === "success" ? successStyle : idleStyle}
    >
      {(state === "loading" || (state === "idle" && disabled)) && (
        <span
          className="w-3.5 h-3.5 border-2 rounded-full animate-spin"
          style={{
            borderColor: "var(--color-btn-primary-text)",
            borderTopColor: "transparent",
          }}
        />
      )}
      {state === "idle" && !disabled && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
      {state === "success" && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
      {state === "idle" ? (disabled ? "Running..." : "Run prompts") : state === "loading" ? "Queuing..." : "Queued"}
    </button>
  );
}
