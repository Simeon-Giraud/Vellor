import Link from "next/link";
import { getCurrentDbUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { ScrollReveal } from "@/components/ScrollReveal";

const ENGINE_COLORS: Record<string, string> = {
  ChatGPT: "#10a37f",
  Gemini: "#0071e3",
  Perplexity: "#ff6b00",
};

export default async function HomePage() {
  const dbUser = await getCurrentDbUser();
  const isSignedIn = !!dbUser;

  return (
    <main style={{ background: "var(--color-surface)", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <ScrollReveal />
      {/* Premium Ambient Glow — drifts slowly */}
      <div
        className="orb-drift"
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          width: "120vw",
          height: "800px",
          background: "radial-gradient(ellipse at top, rgba(0, 113, 227, 0.05) 0%, rgba(16, 163, 127, 0.025) 40%, rgba(255, 255, 255, 0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Nav ── */}
      <div style={{ position: "fixed", top: 16, left: 0, right: 0, zIndex: 50, padding: "0 16px" }}>
        <nav
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(255, 255, 255, 0.75)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            padding: "10px 20px",
            boxShadow: "0 4px 24px -8px rgba(0,0,0,0.04)",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Logo className="w-6 h-6" />
            <span style={{ fontWeight: 600, fontSize: 15, color: "var(--color-fg)", letterSpacing: "-0.01em" }}>Vellor</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div className="hidden md:flex" style={{ gap: 24, alignItems: "center" }}>
              {[
                { label: "Platform", href: "#platform" },
                { label: "Why GEO", href: "#why-geo" },
                { label: "Pricing", href: "#pricing" },
              ].map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  className="nav-link"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {isSignedIn ? (
                <Link href="/dashboard" className="btn-black" style={{ fontSize: 13, padding: "8px 16px", borderRadius: 999 }}>
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/sign-in" style={{ fontSize: 13, fontWeight: 500, color: "var(--color-fg-muted)", textDecoration: "none" }}>Log in</Link>
                  <Link href="/sign-up" className="btn-black" style={{ fontSize: 13, padding: "8px 16px", borderRadius: 999 }}>
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* ── Premium Hero ── */}
      <section
        style={{
          position: "relative",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "160px 24px 80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <div
          className="hero-badge"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            background: "rgba(0, 0, 0, 0.03)",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 500,
            color: "var(--color-fg-muted)",
            marginBottom: 32,
          }}
        >
          <span className="pulse-dot-green" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10a37f", display: "inline-block" }} />
          Introducing Generative Engine Optimization (GEO)
        </div>

        <h1
          className="hero-h1"
          style={{
            fontSize: "clamp(3rem, 7vw, 5.5rem)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: "var(--color-fg)",
            marginBottom: 24,
            maxWidth: 900,
          }}
        >
          Own the <span style={{ color: "transparent", WebkitTextStroke: "1px var(--color-fg)", backgroundImage: "linear-gradient(90deg, #10a37f, #0071e3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Answer</span>.
        </h1>

        <p
          className="hero-sub"
          style={{
            fontSize: "clamp(1.1rem, 2vw, 1.3rem)",
            color: "var(--color-fg-muted)",
            lineHeight: 1.5,
            maxWidth: 640,
            marginBottom: 48,
            fontWeight: 400,
          }}
        >
          Search is evolving. Monitor and optimize your brand's presence across ChatGPT, Gemini, and Perplexity in real-time.
        </p>

        <div className="hero-cta" style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center" }}>
          {isSignedIn ? (
            <Link href="/dashboard" className="btn-black" style={{ padding: "14px 28px", fontSize: 15, borderRadius: 999 }}>
              Open Dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-up" className="btn-black" style={{ padding: "14px 28px", fontSize: 15, borderRadius: 999, display: "flex", alignItems: "center", gap: 8 }}>
                Start your free trial
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </>
          )}
        </div>

        {/* Abstract Floating UI Elements */}
        <div className="hero-cards" style={{ position: "relative", width: "100%", height: 400, marginTop: 80, perspective: "1000px" }}>
          {/* ChatGPT Card */}
          <div className="hero-card-a" style={{
            position: "absolute",
            left: "calc(50% - 300px)",
            top: 40,
            width: 260,
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.4)",
            boxShadow: "0 24px 48px -12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
            borderRadius: 24,
            padding: 24,
            zIndex: 2,
            textAlign: "left"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: ENGINE_COLORS.ChatGPT }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg)" }}>ChatGPT</span>
              </div>
              <span style={{ fontSize: 12, color: "#10a37f", fontWeight: 600, background: "rgba(16, 163, 127, 0.1)", padding: "2px 8px", borderRadius: 999 }}>+4%</span>
            </div>
            <div style={{ height: 60, display: "flex", alignItems: "flex-end", gap: 4 }}>
              {[30, 45, 40, 55, 60, 58, 74].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 6 ? ENGINE_COLORS.ChatGPT : "rgba(0,0,0,0.06)", borderRadius: 3 }} />
              ))}
            </div>
          </div>

          {/* Perplexity Card */}
          <div className="hero-card-b" style={{
            position: "absolute",
            left: "calc(50% + 40px)",
            top: 20,
            width: 260,
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.4)",
            boxShadow: "0 32px 64px -16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)",
            borderRadius: 24,
            padding: 24,
            zIndex: 3,
            textAlign: "left"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: ENGINE_COLORS.Perplexity }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg)" }}>Perplexity</span>
              </div>
              <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--color-fg)" }}>88%</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--color-fg-muted)", lineHeight: 1.4 }}>
              Your brand appeared in <strong>42 of 48</strong> relevant queries this week.
            </p>
          </div>

          {/* Gemini Card */}
          <div className="hero-card-c" style={{
            position: "absolute",
            left: "calc(50% - 100px)",
            top: 140,
            width: 320,
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 40px 80px -20px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)",
            borderRadius: 24,
            padding: 24,
            zIndex: 4,
            textAlign: "left"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0, 113, 227, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: ENGINE_COLORS.Gemini }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </span>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--color-fg)" }}>Visibility Alert</h4>
                <p style={{ fontSize: 12, color: "var(--color-fg-subtle)" }}>Gemini · Just now</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--color-fg-muted)", lineHeight: 1.5 }}>
              Competitor <strong>RivalCorp</strong> overtook your ranking for "Best B2B CRM tools". <span style={{ color: "#0071e3", cursor: "pointer" }}>View insights →</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Why GEO Section (Typography Led) ── */}
      <section id="why-geo" style={{ padding: "120px 24px", background: "var(--color-fg)", color: "var(--color-bg)", textAlign: "center" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <p className="geo-reveal" style={{ fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>
            The Paradigm Shift
          </p>
          <h2 className="geo-reveal" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 32, transitionDelay: "80ms" }}>
            If AI doesn't recommend you,<br />
            <span style={{ fontStyle: "italic", color: "rgba(255,255,255,0.7)" }}>do you even exist?</span>
          </h2>
          <p className="geo-reveal" style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, maxWidth: 600, margin: "0 auto", transitionDelay: "160ms" }}>
            70% of high-intent buyers now ask AI instead of scrolling search results. Traditional SEO isn't enough. You need Generative Engine Optimization (GEO).
          </p>
        </div>
      </section>

      {/* ── Bento Grid Platform Features ── */}
      <section id="platform" style={{ padding: "120px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, letterSpacing: "-0.04em", color: "var(--color-fg)", marginBottom: 16 }}>
            The complete GEO platform.
          </h2>
          <p style={{ fontSize: 18, color: "var(--color-fg-muted)", maxWidth: 500, margin: "0 auto" }}>
            Everything you need to monitor, measure, and optimize your brand's AI presence.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 24 }}>
          {/* Card 1: Multi-Engine (Span 8) */}
          <div className="md:col-span-8 col-span-12 bento-card">
            <div style={{ height: "100%", background: "#fff", borderRadius: 32, padding: 48, boxShadow: "0 8px 32px -12px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{ display: "inline-flex", padding: "6px 12px", background: "rgba(0,0,0,0.04)", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "var(--color-fg-muted)", marginBottom: 16 }}>Coverage</div>
                <h3 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-fg)", marginBottom: 12 }}>Omnipresent tracking.</h3>
                <p style={{ fontSize: 16, color: "var(--color-fg-muted)", maxWidth: 360, lineHeight: 1.5 }}>
                  Simultaneously monitor ChatGPT, Gemini, and Perplexity. Don't leave any engine blindspots.
                </p>
              </div>
              
              {/* Visual */}
              <div style={{ marginTop: 40, display: "flex", gap: 16, alignItems: "flex-end" }}>
                {[
                  { name: "ChatGPT", score: 74, color: ENGINE_COLORS.ChatGPT },
                  { name: "Gemini", score: 61, color: ENGINE_COLORS.Gemini },
                  { name: "Perplexity", score: 88, color: ENGINE_COLORS.Perplexity },
                ].map(engine => (
                  <div key={engine.name} style={{ flex: 1, background: "var(--color-surface-2)", borderRadius: 16, padding: "20px", border: "1px solid rgba(0,0,0,0.03)" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg-subtle)", marginBottom: 12 }}>{engine.name}</div>
                    <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--color-fg)", marginBottom: 12 }}>{engine.score}%</div>
                    <div style={{ height: 4, background: "rgba(0,0,0,0.05)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${engine.score}%`, background: engine.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Competitors (Span 4) */}
          <div className="md:col-span-4 col-span-12 bento-card">
            <div style={{ height: "100%", background: "#fff", borderRadius: 32, padding: 48, boxShadow: "0 8px 32px -12px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "inline-flex", padding: "6px 12px", background: "rgba(0,0,0,0.04)", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "var(--color-fg-muted)", alignSelf: "flex-start", marginBottom: 16 }}>Intelligence</div>
              <h3 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-fg)", marginBottom: 12 }}>Beat rivals.</h3>
              <p style={{ fontSize: 16, color: "var(--color-fg-muted)", lineHeight: 1.5, marginBottom: 32 }}>
                See exactly where competitors rank alongside you in every generated response.
              </p>
              
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                {["Acme Corp", "Rival A", "Rival B"].map((name, i) => (
                  <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: i === 0 ? "rgba(16, 163, 127, 0.05)" : "var(--color-surface-2)", border: i === 0 ? "1px solid rgba(16, 163, 127, 0.2)" : "1px solid transparent", borderRadius: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: i === 0 ? 600 : 500, color: i === 0 ? "#10a37f" : "var(--color-fg)" }}>{name}</span>
                    <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "var(--color-fg-subtle)" }}>#{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Automation (Span 5) */}
          <div className="md:col-span-5 col-span-12 bento-card">
            <div style={{ height: "100%", background: "#fff", borderRadius: 32, padding: 48, boxShadow: "0 8px 32px -12px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={{ display: "inline-flex", padding: "6px 12px", background: "rgba(0,0,0,0.04)", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "var(--color-fg-muted)", marginBottom: 16 }}>Automation</div>
              <h3 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-fg)", marginBottom: 12 }}>Set and forget.</h3>
              <p style={{ fontSize: 15, color: "var(--color-fg-muted)", lineHeight: 1.5, marginBottom: 32 }}>
                Schedule prompts to run daily or weekly. Receive alerts the moment your brand drops in visibility.
              </p>
              
              <div style={{ marginTop: "auto", width: "100%", padding: 24, background: "var(--color-surface-2)", borderRadius: 16, border: "1px dashed rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-fg)" }}>Weekly Sync</span>
                  <span style={{ display: "inline-block", width: 40, height: 24, background: "#34c759", borderRadius: 999, position: "relative" }}>
                    <span style={{ position: "absolute", top: 2, right: 2, width: 20, height: 20, background: "#fff", borderRadius: "50%", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Analytics (Span 7) */}
          <div className="md:col-span-7 col-span-12 bento-card">
            <div style={{ height: "100%", background: "#fff", borderRadius: 32, padding: 48, boxShadow: "0 8px 32px -12px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "inline-flex", padding: "6px 12px", background: "rgba(0,0,0,0.04)", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "var(--color-fg-muted)", alignSelf: "flex-start", marginBottom: 16 }}>Analytics</div>
              <h3 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-fg)", marginBottom: 12 }}>Trend analysis.</h3>
              <p style={{ fontSize: 16, color: "var(--color-fg-muted)", lineHeight: 1.5, maxWidth: 400 }}>
                Chart your GEO score over time. Understand exactly which PR moves or content updates move the needle.
              </p>
              
              {/* Fake Chart */}
              <div style={{ marginTop: "auto", height: 120, display: "flex", alignItems: "flex-end", gap: 8, paddingTop: 32 }}>
                {[30, 35, 32, 45, 48, 55, 62, 58, 65, 75, 72, 88].map((h, i) => (
                  <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 11 ? "#0071e3" : "var(--color-surface-2)", borderRadius: "6px 6px 0 0", position: "relative" }}>
                    {i === 11 && (
                      <div style={{ position: "absolute", top: -32, left: "50%", transform: "translateX(-50%)", background: "var(--color-fg)", color: "var(--color-bg)", fontSize: 12, fontWeight: 600, padding: "4px 8px", borderRadius: 6 }}>
                        88%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section
        id="pricing"
        style={{ padding: "120px 24px", background: "var(--color-fg)", color: "var(--color-bg)", textAlign: "center", position: "relative", overflow: "hidden" }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 600,
            background: "radial-gradient(circle, rgba(0, 113, 227, 0.15) 0%, rgba(0,0,0,0) 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, letterSpacing: "-0.04em", marginBottom: 16 }}>
            Simple, transparent pricing.
          </h2>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.55, marginBottom: 80 }}>
            Start optimizing your brand's AI presence today. 7-day free trial. Cancel anytime.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, textAlign: "left", alignItems: "center" }}>
            
            {/* Starter */}
            <div className="pricing-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 32, padding: 40, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Starter</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24, height: 40 }}>Perfect for solo founders and small brands</p>
              <div style={{ marginBottom: 32 }}>
                <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.04em", color: "#fff" }}>$39</span>
                <span style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>/mo</span>
              </div>
              <Link href={isSignedIn ? "/dashboard" : "/sign-up"} style={{ display: "block", textAlign: "center", padding: "14px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: 999, fontSize: 15, fontWeight: 500, marginBottom: 40, textDecoration: "none" }}>
                Get Starter
              </Link>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {["5 projects", "20 prompts per project", "100 runs/month", "ChatGPT, Gemini & Perplexity", "1 competitor tracked", "30-day data history", "Email alerts"].map(feature => (
                  <div key={feature} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth */}
            <div className="pricing-card" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 32, padding: "48px 40px", display: "flex", flexDirection: "column", boxShadow: "0 0 0 1px rgba(0, 113, 227, 0.3), 0 32px 64px -16px rgba(0, 113, 227, 0.2)", position: "relative" }}>
              <div className="badge-glow" style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg, #0071e3, #00d2ff)", color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999, letterSpacing: "0.05em", textTransform: "uppercase" }}>Most Popular</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Growth</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24, height: 40 }}>For growing teams monitoring multiple brands</p>
              <div style={{ marginBottom: 32 }}>
                <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.04em", color: "#fff" }}>$79</span>
                <span style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>/mo</span>
              </div>
              <Link href={isSignedIn ? "/dashboard" : "/sign-up"} style={{ display: "block", textAlign: "center", padding: "14px 24px", background: "#fff", color: "#000", borderRadius: 999, fontSize: 15, fontWeight: 600, marginBottom: 40, textDecoration: "none", boxShadow: "0 4px 12px rgba(255,255,255,0.2)" }}>
                Get Growth
              </Link>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {["10 projects", "50 prompts per project", "500 runs/month", "ChatGPT, Gemini & Perplexity", "3 competitors tracked", "60-day data history", "Slack & email alerts"].map(feature => (
                  <div key={feature} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontSize: 14, color: "#fff" }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro */}
            <div className="pricing-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 32, padding: 40, display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Pro</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24, height: 40 }}>For established brands and agencies</p>
              <div style={{ marginBottom: 32 }}>
                <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.04em", color: "#fff" }}>$149</span>
                <span style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>/mo</span>
              </div>
              <Link href={isSignedIn ? "/dashboard" : "/sign-up"} style={{ display: "block", textAlign: "center", padding: "14px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", borderRadius: 999, fontSize: 15, fontWeight: 500, marginBottom: 40, textDecoration: "none" }}>
                Get Pro
              </Link>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {["Unlimited projects", "100 prompts per project", "1,000 runs/month", "ChatGPT, Gemini & Perplexity", "Unlimited competitors tracked", "1-year data history", "Export reports (CSV/PDF)", "Priority support"].map(feature => (
                  <div key={feature} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: "48px 24px", borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Logo className="w-5 h-5" />
            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--color-fg)", letterSpacing: "-0.01em" }}>Vellor</span>
          </Link>
          <p style={{ fontSize: 13, color: "var(--color-fg-subtle)" }}>© {new Date().getFullYear()} Vellor. All rights reserved.</p>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Contact"].map(l => (
              <a key={l} href="#" style={{ fontSize: 13, color: "var(--color-fg-muted)", textDecoration: "none" }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </main>
  );
}
