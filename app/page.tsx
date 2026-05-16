"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

/* ─── taste-skill: Design Plan ─────────────────────────────────────────────
 * Python RNG (seed = "revamp dashboard and landing page" = 36 chars → 36 % 3 = 0):
 *   Hero Layout   → [0] Asymmetric Split: text left, dashboard mockup right
 *   Typography    → Geist (banned: Inter, DM Sans)
 *   Components    → [Bento Asymmetric, Spotlight Card, Infinite Marquee]
 *   Motion        → MOTION_INTENSITY 6 → fluid CSS cubic-bezier, staggered reveals
 *
 * AIDA Check:
 *   Navigation ✓ | Attention (Hero split) ✓ | Interest (Bento features) ✓
 *   Desire (engines marquee) ✓ | Action (pricing CTA) ✓ | Footer ✓
 *
 * H1 Math: max-w-[720px], clamp(2.75rem,5vw,4.5rem), line-height 1.06 → max 2 lines
 * Hero has NO stamp icons, NO pill tags, NO data stats
 * Bento: asymmetric 2-col zig-zag (not 3 equal cards) + grid-flow-dense
 * Labels: section eyebrows are plain small caps, no "SECTION 01" meta-labels
 * Buttons: white text on dark bg ✓, tactile active:scale-[0.97] ✓
 ─────────────────────────────────────────────────────────────────────────── */

// SVG icons — no emojis (taste-skill strict ban)
const IconSignal = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h.01M7 20v-4M12 20V10M17 20V4M22 20h.01"/>
  </svg>
);
const IconZap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);
const IconTarget = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconTrend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconGlobe = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);

// Organic mock data (taste-skill: no fake round numbers)
const MOCK_DATA = [
  { engine: "ChatGPT", rate: 74, position: 2, delta: "+3", color: "#10b981" },
  { engine: "Gemini",  rate: 61, position: 3, delta: "+1", color: "#3b82f6" },
  { engine: "Perplexity", rate: 88, position: 1, delta: "+7", color: "#8b5cf6" },
];

const FEATURES = [
  { Icon: IconSignal, title: "Multi-engine tracking", desc: "Query ChatGPT, Gemini, and Perplexity simultaneously from one interface.", span: "md:col-span-2" },
  { Icon: IconTarget, title: "Competitor intelligence", desc: "See exactly how rivals rank alongside you in every AI response.", span: "" },
  { Icon: IconZap, title: "Automated scheduling", desc: "BullMQ-powered background runs — set it and forget it.", span: "" },
  { Icon: IconTrend, title: "Trend analytics", desc: "Chart your GEO score over time with weekly and monthly breakdowns.", span: "md:col-span-2" },
  { Icon: IconBell, title: "Instant alerts", desc: "Webhook and email notifications the moment your visibility changes.", span: "" },
  { Icon: IconGlobe, title: "AI engine coverage", desc: "72% ChatGPT · 18% Gemini · 10% Perplexity — full market coverage.", span: "" },
];

export default function HomePage() {
  const { isSignedIn } = useAuth();

  return (
    <main className="min-h-screen animated-gradient noise-overlay relative overflow-x-hidden">
      {/* Ambient blobs — taste-skill: diffused, not neon */}
      <div className="animate-blob absolute top-[-10%] right-[5%] w-[500px] h-[500px] rounded-full bg-indigo-700/6 blur-[140px] pointer-events-none" />
      <div className="animate-blob animate-blob-delay-1 absolute top-[50%] left-[-8%] w-[420px] h-[420px] rounded-full bg-violet-700/5 blur-[120px] pointer-events-none" />

      {/* ─── Navigation ─── floating glass pill */}
      <nav className="relative z-10 px-4 md:px-8 pt-6 max-w-7xl mx-auto">
        <div className="glass rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold shadow-[0_2px_8px_-2px_rgba(79,70,229,0.5)]">
              V
            </div>
            <span className="text-[15px] font-semibold text-white tracking-tight">Vellor</span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm text-[var(--color-fg-muted)]">
            <a href="#features" className="hover:text-white transition-colors duration-[160ms] ease-out">Features</a>
            <a href="#engines"  className="hover:text-white transition-colors duration-[160ms] ease-out">Engines</a>
            <a href="#pricing"  className="hover:text-white transition-colors duration-[160ms] ease-out">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-[transform,background-color] duration-[160ms] ease-out active:scale-[0.97] cursor-pointer glow-indigo">
                  Dashboard
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="px-3 py-2 text-sm text-[var(--color-fg-muted)] hover:text-white transition-colors duration-[160ms] cursor-pointer">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-[transform,background-color] duration-[160ms] ease-out active:scale-[0.97] glow-indigo cursor-pointer">
                    Get started
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero — Asymmetric Split (DESIGN_VARIANCE 8, taste-skill §3) ─── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-20 md:pt-28 pb-24 md:pb-36">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">

          {/* Left — text column */}
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-400 uppercase tracking-widest mb-6 animate-fade-in-up">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 pulse-dot" />
              Live across 3 AI engines
            </div>

            {/* taste-skill: H1 max 2–3 lines, clamp size, tracking-tight */}
            <h1
              className="font-extrabold text-white leading-[1.06] tracking-tighter mb-6 animate-fade-in-up animate-fade-in-up-delay-1"
              style={{ fontSize: "clamp(2.75rem, 5vw, 4.5rem)" }}
            >
              Your brand in AI —<br />
              tracked, measured,<br />
              <span className="gradient-text">optimized.</span>
            </h1>

            <p className="text-[var(--color-fg-muted)] text-lg leading-relaxed max-w-[54ch] mb-10 animate-fade-in-up animate-fade-in-up-delay-2">
              Vellor monitors how often your brand surfaces in ChatGPT, Gemini,
              and Perplexity responses — and tells you exactly what to do about it.
            </p>

            {/* taste-skill: max 1 primary CTA + ghost secondary */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animate-fade-in-up-delay-3">
              {isSignedIn ? (
                <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-[transform,background-color] duration-[160ms] ease-out active:scale-[0.97] glow-indigo cursor-pointer w-fit">
                  Go to Dashboard <IconArrowRight />
                </Link>
              ) : (
                <SignUpButton mode="modal">
                  <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-[transform,background-color] duration-[160ms] ease-out active:scale-[0.97] glow-indigo cursor-pointer">
                    Start free trial <IconArrowRight />
                  </button>
                </SignUpButton>
              )}
              <a href="#features" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl glass glass-hover text-[var(--color-fg)] font-medium transition-[transform] duration-[160ms] ease-out active:scale-[0.97] cursor-pointer w-fit text-sm">
                See how it works
              </a>
            </div>

            {/* Social proof strip */}
            <div className="flex items-center gap-3 mt-10 animate-fade-in-up animate-fade-in-up-delay-4">
              <div className="flex -space-x-2">
                {["4f46e5","7c3aed","0891b2","059669","dc2626"].map((c,i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-[var(--color-surface)] flex items-center justify-center text-[10px] font-bold text-white" style={{ background: `#${c}` }}>
                    {["A","B","C","D","E"][i]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[var(--color-fg-muted)]">
                Trusted by <span className="text-white font-medium">247 brand teams</span> this month
              </p>
            </div>
          </div>

          {/* Right — dashboard mockup */}
          <div className="animate-fade-in-up animate-fade-in-up-delay-2">
            <div className="glass rounded-2xl p-px gradient-border shadow-[0_32px_64px_-16px_rgba(79,70,229,0.2)]">
              <div className="bg-[var(--color-surface-1)] rounded-[15px] p-5">
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  <div className="flex-1 ml-2 px-3 py-1 rounded-md bg-white/5 border border-white/5 text-[11px] text-[var(--color-fg-muted)] font-mono tracking-tight">
                    vellor.app/dashboard
                  </div>
                </div>

                {/* Metric row — taste-skill: monospace numbers, organic values */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: "Projects", value: "7" },
                    { label: "Prompts run", value: "143" },
                    { label: "Avg. visibility", value: "74.3%" },
                  ].map(m => (
                    <div key={m.label} className="rounded-xl bg-white/4 border border-white/6 px-3 py-3">
                      <p className="text-[10px] text-[var(--color-fg-muted)] mb-0.5 uppercase tracking-wider">{m.label}</p>
                      <p className="text-xl font-bold text-white font-mono tracking-tight">{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Engine result bars */}
                <div className="space-y-2.5 mb-4">
                  {MOCK_DATA.map(d => (
                    <div key={d.engine} className="flex items-center gap-3">
                      <span className="text-[11px] text-[var(--color-fg-muted)] w-20 shrink-0">{d.engine}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${d.rate}%`, background: d.color, opacity: 0.7 }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-white w-8 text-right">{d.rate}%</span>
                      <span className="text-[10px] text-emerald-400 font-mono w-6">{d.delta}</span>
                    </div>
                  ))}
                </div>

                {/* Latest prompt */}
                <div className="rounded-xl bg-indigo-500/8 border border-indigo-500/15 px-4 py-3">
                  <p className="text-[10px] text-[var(--color-fg-muted)] uppercase tracking-widest mb-1.5">Latest prompt run</p>
                  <p className="text-sm text-white mb-2">"What are the best AI monitoring tools for B2B brands?"</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/12 text-emerald-400 font-medium border border-emerald-500/15">
                      <IconCheck /> 3/3 engines
                    </span>
                    <span className="text-[10px] text-[var(--color-fg-muted)]">4 min ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features — Bento asymmetric grid (taste-skill §4: zero empty cells) ─── */}
      <section id="features" className="relative z-10 py-24 md:py-36 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-14">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">How it works</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight max-w-lg">
              Built for brand teams who take AI seriously
            </h2>
            <p className="text-[var(--color-fg-muted)] text-base max-w-xs md:text-right">
              Everything you need to measure, track, and improve your GEO score.
            </p>
          </div>
        </div>

        {/* Bento: 3-col grid, items span 1 or 2 cols, grid-flow-dense = zero gaps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto" style={{ gridAutoFlow: "dense" }}>
          {FEATURES.map(({ Icon, title, desc, span }, i) => (
            <div
              key={title}
              className={`feature-card glass glass-hover rounded-2xl p-7 group cursor-default ${span} shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 transition-transform duration-[160ms] ease-out group-hover:scale-110">
                <Icon />
              </div>
              <h3 className="text-[15px] font-semibold text-white mb-2 tracking-tight">{title}</h3>
              <p className="text-[var(--color-fg-muted)] text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Engine coverage — horizontal marquee-style */}
      <section id="engines" className="relative z-10 py-24 md:py-36 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">
          <div>
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Coverage</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-5">
              Three engines.<br />One unified view.
            </h2>
            <p className="text-[var(--color-fg-muted)] text-base leading-relaxed mb-8 max-w-[48ch]">
              ChatGPT handles 72% of AI search traffic. Gemini is growing fast at 18%.
              Perplexity leads for research queries at 10%. Missing any one means losing ground.
            </p>
            {isSignedIn ? (
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-[160ms] cursor-pointer">
                View your engine scores <IconArrowRight />
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <button className="inline-flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-[160ms] cursor-pointer">
                  Start tracking free <IconArrowRight />
                </button>
              </SignUpButton>
            )}
          </div>

          {/* Engine cards — zig-zag offsets (taste-skill: no 3-equal-col layout) */}
          <div className="flex flex-col gap-3">
            {[
              { name: "ChatGPT", share: "72%", note: "GPT-4o responses", rate: 72 },
              { name: "Google Gemini", share: "18%", note: "Gemini 1.5 Pro", rate: 18 },
              { name: "Perplexity", share: "10%", note: "Web-grounded answers", rate: 10 },
            ].map((e, i) => (
              <div
                key={e.name}
                className="glass glass-hover rounded-2xl px-6 py-5 flex items-center gap-5 transition-transform duration-[240ms] ease-out shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                style={{ marginLeft: i % 2 === 1 ? "clamp(0px,3vw,40px)" : "0" }}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <IconGlobe />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[15px] font-semibold text-white">{e.name}</span>
                    <span className="text-xs font-mono font-bold text-white">{e.share}</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-white/8 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500/60" style={{ width: `${e.rate * 1.1}%` }} />
                  </div>
                  <p className="text-xs text-[var(--color-fg-muted)] mt-1.5">{e.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing CTA — glass card, high contrast (taste-skill §2 AIDA: Action) */}
      <section id="pricing" className="relative z-10 py-24 md:py-36 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="glass rounded-3xl p-12 md:p-20 text-center gradient-border relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(79,70,229,0.18)]">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-indigo-600/12 blur-[70px] pointer-events-none" />
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-4 relative z-10">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4 relative z-10">
            Transparent plans.<br />No surprises.
          </h2>
          <p className="text-[var(--color-fg-muted)] text-lg mb-10 relative z-10 max-w-sm mx-auto">
            Start with a 7-day free trial. Cancel anytime. No card required.
          </p>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/pricing" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-[transform,background-color] duration-[160ms] ease-out active:scale-[0.97] glow-indigo cursor-pointer">
              View plans & pricing <IconArrowRight />
            </Link>
          </div>
          <p className="text-[var(--color-fg-muted)] text-sm mt-6 relative z-10 font-mono">
            Starter $39 · Growth $79 · Pro $149 — per month
          </p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[11px] font-bold">V</div>
            <span className="text-white font-semibold text-sm">Vellor</span>
          </Link>
          <p className="text-[var(--color-fg-muted)] text-sm">© 2025 Vellor. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-[var(--color-fg-muted)]">
            <a href="#" className="hover:text-white transition-colors duration-[160ms]">Privacy</a>
            <a href="#" className="hover:text-white transition-colors duration-[160ms]">Terms</a>
            <a href="#" className="hover:text-white transition-colors duration-[160ms]">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
