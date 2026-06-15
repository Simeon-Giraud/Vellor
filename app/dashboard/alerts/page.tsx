import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Alerts — Vellor" };

export default async function AlertsPage() {
  const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
  if (!userId) redirect("/");

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-8 py-8 lg:py-12 pb-24">
      <header className="mb-10 animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-[var(--color-fg)]">Alerts</h1>
        <p className="text-[var(--color-fg-muted)]">Manage your notification preferences and active alerts.</p>
      </header>

      <div className="dash-card rounded-2xl p-8 md:p-12 border border-[var(--color-border)] bg-[var(--color-surface-2)] flex flex-col items-center justify-center text-center animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <div className="w-16 h-16 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-fg-muted)]">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-[var(--color-fg)] mb-2">No Active Alerts</h3>
        <p className="text-sm text-[var(--color-fg-muted)] max-w-sm">
          You're all caught up. Any notifications about your projects or account will appear here.
        </p>
      </div>
    </div>
  );
}
