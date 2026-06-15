import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "What's New — Vellor" };

export default async function WhatsNewPage() {
  const dbUser = await getCurrentDbUser();
  const userId = dbUser?.supabaseId;
  if (!userId) redirect("/");

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-8 py-8 lg:py-12 pb-24">
      <header className="mb-10 animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-[var(--color-fg)]">What&apos;s New</h1>
        <p className="text-[var(--color-fg-muted)]">Latest product updates, improvements, and fixes.</p>
      </header>

      <div className="dash-card rounded-2xl p-8 md:p-12 border border-[var(--color-border)] bg-[var(--color-surface-2)] flex flex-col items-center justify-center text-center animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <div className="w-16 h-16 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--color-fg-muted)]">
             <path d="M12 3v1M12 20v1M4.22 4.22l.7.7M18.36 18.36l.71.71M3 12h1M20 12h1M4.22 19.78l.7-.7M18.36 5.64l.71-.71M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
          </svg>
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-[var(--color-fg)] mb-2">Check Back Soon</h3>
        <p className="text-sm text-[var(--color-fg-muted)] max-w-sm">
          We&apos;re constantly working on new features. Updates will be posted here as they are released.
        </p>
      </div>
    </div>
  );
}
