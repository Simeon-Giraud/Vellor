import Link from "next/link";
import { getCurrentDbUser } from "@/lib/auth";
import { Logo } from "@/components/Logo";

const MOCK_DATA = [
  { engine: "ChatGPT",    score: 74, delta: "+3" },
  { engine: "Gemini",     score: 61, delta: "+1" },
  { engine: "Perplexity", score: 88, delta: "+7" },
];

const ENGINE_COLORS: Record<string, string> = {
  ChatGPT: "#10a37f",
  Gemini: "#0071e3",
  "Google Gemini": "#0071e3",
  Perplexity: "#ff6b00",
};

const FEATURES = [
  {
    title: "Track every AI engine",
    desc: "Monitor how your brand surfaces in ChatGPT, Gemini, and Perplexity simultaneously — from one clean dashboard.",
    tag: "Multi-engine",
    wide: true,
  },
  {
    title: "See competitors in context",
    desc: "Vellor shows you exactly where rivals rank alongside you in every AI-generated response.",
    tag: "Intelligence",
  },
  {
    title: "Automate your monitoring",
    desc: "Schedule prompts on a cadence. Get notified the moment your visibility shifts.",
    tag: "Automation",
  },
  {
    title: "Trend analytics over time",
    desc: "Chart your GEO score week over week. Understand what's moving the needle.",
    tag: "Analytics",
    wide: true,
  },
];

export default async function HomePage() {
  const dbUser = await getCurrentDbUser();
  const isSignedIn = !!dbUser;

  return (
    <main style={{ background: "#f5f5f7", minHeight: "100vh", position: "relative" }}>
      {/* Ambient Radial Glow */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          right: "-10%",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 113, 227, 0.05) 0%, rgba(0, 113, 227, 0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Nav ── */}
      <div style={{ position: "fixed", top: 16, left: 0, right: 0, zIndex: 50, padding: "0 16px" }}>
        <nav
          className="nav-pill"
          style={{
            maxWidth: 960,
            margin: "0 auto",
            borderRadius: 980,
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Logo className="w-7 h-7" />
            <span style={{ fontWeight: 600, fontSize: 15, color: "#1d1d1f", letterSpacing: "-0.01em" }}>Vellor</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div className="hidden md:flex" style={{ gap: 24, alignItems: "center" }}>
              {[
                { label: "Features", href: "#features" },
                { label: "How it works", href: "#how-it-works" },
                { label: "Engines", href: "#engines" },
                { label: "Pricing", href: "#pricing" },
              ].map(item => (
                <a
                  key={item.label}
                  href={item.href}
                  className="nav-link"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {isSignedIn ? (
                <Link href="/dashboard" className="btn-black" style={{ fontSize: 14, padding: "8px 18px" }}>
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/sign-in" style={{ fontSize: 14, color: "#6e6e73", textDecoration: "none", padding: "8px 12px" }}>Sign in</Link>
                  <Link href="/sign-up" className="btn-black" style={{ fontSize: 14, padding: "8px 18px" }}>
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* ── Hero ── */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "120px 24px 48px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          alignItems: "center",
        }}
        className="hero-grid"
      >
        <div>
          <div
            className="chip"
            style={{ marginBottom: 20 }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34c759", display: "inline-block" }} />
            Live across 3 AI engines
          </div>

          <h1
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              color: "#1d1d1f",
              marginBottom: 20,
            }}
          >
            Your brand in AI—<br />
            tracked, measured,<br />
            <em
              style={{
                fontStyle: "normal",
                background: "linear-gradient(90deg, #0071e3, #00d2ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              optimized.
            </em>
          </h1>

          <p
            style={{ fontSize: 18, color: "#6e6e73", lineHeight: 1.55, maxWidth: 440, marginBottom: 32 }}
          >
            Vellor monitors how your brand surfaces in ChatGPT, Gemini, and Perplexity responses — and tells you exactly what to do about it.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {isSignedIn ? (
              <Link href="/dashboard" className="btn-black">
                Go to Dashboard
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            ) : (
              <>
                <Link href="/sign-up" className="btn-black">
                  Start free trial
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <a href="#features" className="btn-ghost">See how it works</a>
              </>
            )}
          </div>

          <p style={{ fontSize: 12, color: "#aeaeb2", marginTop: 16 }}>
            7-day free trial · No card required
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="card-white" style={{ padding: 20, borderRadius: 24, overflow: "hidden" }}>
          {/* Browser bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
            <div style={{
              flex: 1,
              marginLeft: 8,
              background: "#f5f5f7",
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 11,
              color: "#aeaeb2",
              fontFamily: "var(--font-mono)",
            }}>
              vellor.app/dashboard
            </div>
          </div>

          {/* Metrics row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Projects", value: "7" },
              { label: "Prompts run", value: "143" },
              { label: "Avg. visibility", value: "74.3%" },
            ].map(m => (
              <div key={m.label} style={{ background: "#f5f5f7", borderRadius: 14, padding: "12px 14px" }}>
                <p style={{ fontSize: 10, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{m.label}</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f", fontFamily: "var(--font-mono)", letterSpacing: "-0.03em" }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Engine bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {MOCK_DATA.map(d => (
              <div key={d.engine} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "#6e6e73", width: 74, flexShrink: 0 }}>{d.engine}</span>
                <div className="stat-bar-track" style={{ flex: 1 }}>
                  <div className="stat-bar-fill" style={{ width: `${d.score}%`, background: ENGINE_COLORS[d.engine] }} />
                </div>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "#1d1d1f", width: 32, textAlign: "right" }}>{d.score}%</span>
                <span style={{ fontSize: 11, color: "#34c759", fontFamily: "var(--font-mono)", width: 24 }}>{d.delta}</span>
              </div>
            ))}
          </div>

          {/* Latest prompt */}
          <div style={{ background: "#f5f5f7", borderRadius: 14, padding: "12px 14px" }}>
            <p style={{ fontSize: 10, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Latest run</p>
            <p style={{ fontSize: 13, color: "#1d1d1f", marginBottom: 8, lineHeight: 1.4 }}>
              "What are the best AI monitoring tools for B2B brands?"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#34c759", background: "#f0faf3", borderRadius: 999, padding: "2px 8px", fontWeight: 500 }}>✓ 3/3 engines</span>
              <span style={{ fontSize: 11, color: "#aeaeb2" }}>4 min ago</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof bar ── */}
      <div style={{ overflow: "hidden", padding: "0 0 64px" }}>
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 0 }}>
              {[
                "ChatGPT visibility",
                "Gemini tracking",
                "Perplexity ranking",
                "GEO optimization",
                "Brand monitoring",
                "AI search analytics",
                "Competitor intelligence",
                "Automated scheduling",
              ].map(label => (
                <span
                  key={label}
                  style={{
                    padding: "8px 20px",
                    fontSize: 13,
                    color: "#aeaeb2",
                    whiteSpace: "nowrap",
                    borderRight: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="section-divider" />

      {/* ── Features ── */}
      <section id="features" style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            How it works
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.025em", color: "#1d1d1f", lineHeight: 1.1 }}>
            Built for brand teams<br />who take AI seriously.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16 }}>
          {/* Wide card */}
          <div className="card-white" style={{ gridColumn: "span 8", padding: 36 }}>
            <span className="chip" style={{ marginBottom: 16 }}>Multi-engine</span>
            <h3 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: "#1d1d1f", marginBottom: 8 }}>
              Track every AI engine
            </h3>
            <p style={{ fontSize: 15, color: "#6e6e73", lineHeight: 1.55, maxWidth: 440 }}>
              Monitor how your brand surfaces in ChatGPT, Gemini, and Perplexity simultaneously — from one clean dashboard.
            </p>
            {/* Mini engine chart */}
            <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
              {MOCK_DATA.map(d => (
                <div key={d.engine} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "#6e6e73", width: 70, flexShrink: 0 }}>{d.engine}</span>
                  <div className="stat-bar-track" style={{ flex: 1 }}>
                    <div className="stat-bar-fill" style={{ width: `${d.score}%`, background: ENGINE_COLORS[d.engine] }} />
                  </div>
                  <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "#1d1d1f", width: 30, textAlign: "right" }}>{d.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tall card */}
          <div className="card-white" style={{ gridColumn: "span 4", padding: 36 }}>
            <span className="chip" style={{ marginBottom: 16 }}>Intelligence</span>
            <h3 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: "#1d1d1f", marginBottom: 8 }}>
              See competitors in context
            </h3>
            <p style={{ fontSize: 15, color: "#6e6e73", lineHeight: 1.55 }}>
              Vellor shows where rivals rank alongside you in every AI-generated response.
            </p>
          </div>

          {/* Small card */}
          <div className="card-white" style={{ gridColumn: "span 4", padding: 36 }}>
            <span className="chip" style={{ marginBottom: 16 }}>Automation</span>
            <h3 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: "#1d1d1f", marginBottom: 8 }}>
              Automate your monitoring
            </h3>
            <p style={{ fontSize: 15, color: "#6e6e73", lineHeight: 1.55 }}>
              Schedule prompts on a cadence. Get notified the moment your visibility shifts.
            </p>
          </div>

          {/* Wide card 2 */}
          <div className="card-white" style={{ gridColumn: "span 8", padding: 36 }}>
            <span className="chip" style={{ marginBottom: 16 }}>Analytics</span>
            <h3 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: "#1d1d1f", marginBottom: 8 }}>
              Trend analytics over time
            </h3>
            <p style={{ fontSize: 15, color: "#6e6e73", lineHeight: 1.55, maxWidth: 440 }}>
              Chart your GEO score week over week. Understand what's moving the needle — and act fast.
            </p>
            {/* Fake sparkline */}
            <div style={{ marginTop: 28, height: 56, display: "flex", alignItems: "flex-end", gap: 5 }}>
              {[32, 44, 38, 51, 58, 55, 61, 74, 71, 80, 78, 88].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    background: i === 11 ? "#0071e3" : "#e5e5e7",
                    borderRadius: "4px 4px 0 0",
                    transition: "background 200ms ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
            How it works
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.025em", color: "#1d1d1f", lineHeight: 1.1, marginBottom: 16 }}>
            From setup to insights<br />in minutes.
          </h2>
          <p style={{ fontSize: 17, color: "#6e6e73", lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>
            Vellor automates the hard part of AI brand monitoring — so you always know how visible you are, without lifting a finger.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Step 1 */}
          <div className="card-white" style={{ padding: 40, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: "#1d1d1f", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18,
                flexShrink: 0,
              }}>1</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
                  <span className="chip">Setup</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: "#1d1d1f", marginBottom: 10 }}>
                  Create your brand project
                </h3>
                <p style={{ fontSize: 15, color: "#6e6e73", lineHeight: 1.6 }}>
                  Tell Vellor about your brand — your name, category, and who your competitors are. Takes 2 minutes. No code needed.
                </p>
              </div>
            </div>
            <div style={{ background: "#f5f5f7", borderRadius: 14, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              <p style={{ fontSize: 12, color: "#aeaeb2", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>Project setup</p>
              {["Brand name: Acme Corp", "Category: B2B SaaS", "Competitors: Rival A, Rival B"].map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34c759", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#1d1d1f", fontFamily: "var(--font-mono)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2 */}
          <div className="card-white" style={{ padding: 40, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: "#0071e3", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18,
                flexShrink: 0,
              }}>2</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <span className="chip">Prompts</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: "#1d1d1f", marginBottom: 10 }}>
                  Run prompts across AI engines
                </h3>
                <p style={{ fontSize: 15, color: "#6e6e73", lineHeight: 1.6 }}>
                  Vellor fires your prompts at ChatGPT, Gemini, and Perplexity — simultaneously — and captures how your brand appears in every response.
                </p>
              </div>
            </div>
            <div style={{ background: "#f5f5f7", borderRadius: 14, padding: "16px 20px" }}>
              <p style={{ fontSize: 12, color: "#aeaeb2", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>Example prompt</p>
              <p style={{ fontSize: 13, color: "#1d1d1f", lineHeight: 1.5, fontStyle: "italic", marginBottom: 10 }}>
                "What are the best B2B SaaS tools for team collaboration?"
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[{ label: "ChatGPT", color: "#10a37f" }, { label: "Gemini", color: "#0071e3" }, { label: "Perplexity", color: "#ff6b00" }].map(e => (
                  <span key={e.label} style={{ fontSize: 11, fontWeight: 500, color: e.color, background: `${e.color}18`, borderRadius: 999, padding: "3px 10px" }}>
                    ✓ {e.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="card-white" style={{ padding: 40, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: "#34c759", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18,
                flexShrink: 0,
              }}>3</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  <span className="chip">Visibility</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: "#1d1d1f", marginBottom: 10 }}>
                  See your visibility score
                </h3>
                <p style={{ fontSize: 15, color: "#6e6e73", lineHeight: 1.6 }}>
                  Get a clear GEO (Generative Engine Optimization) score per engine. Track it over time and compare against your competitors.
                </p>
              </div>
            </div>
            <div style={{ background: "#f5f5f7", borderRadius: 14, padding: "16px 20px" }}>
              <p style={{ fontSize: 12, color: "#aeaeb2", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 12 }}>Your scores</p>
              {[{ engine: "ChatGPT", score: 74, color: "#10a37f" }, { engine: "Gemini", score: 61, color: "#0071e3" }, { engine: "Perplexity", score: 88, color: "#ff6b00" }].map(d => (
                <div key={d.engine} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#6e6e73", width: 74, flexShrink: 0 }}>{d.engine}</span>
                  <div className="stat-bar-track" style={{ flex: 1 }}>
                    <div className="stat-bar-fill" style={{ width: `${d.score}%`, background: d.color }} />
                  </div>
                  <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "#1d1d1f", width: 32, textAlign: "right" }}>{d.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 4 */}
          <div className="card-white" style={{ padding: 40, display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: "#ff6b00", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18,
                flexShrink: 0,
              }}>4</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  <span className="chip">Optimize</span>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: "#1d1d1f", marginBottom: 10 }}>
                  Act on AI-powered insights
                </h3>
                <p style={{ fontSize: 15, color: "#6e6e73", lineHeight: 1.6 }}>
                  Vellor surfaces exactly why your score changed — and tells you what content, keywords, or mentions to create to improve it.
                </p>
              </div>
            </div>
            <div style={{ background: "#f5f5f7", borderRadius: 14, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: 12, color: "#aeaeb2", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>Insights for you</p>
              {[
                { icon: "↑", text: "Add a case study mentioning \"team scalability\"", tag: "+8 pts" },
                { icon: "→", text: "Your competitor ranked in 4 more responses this week", tag: "Watch" },
                { icon: "✓", text: "Gemini picked up your new blog post", tag: "+3 pts" },
              ].map((insight, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{insight.icon}</span>
                  <span style={{ fontSize: 13, color: "#1d1d1f", flex: 1, lineHeight: 1.4 }}>{insight.text}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: insight.tag.startsWith("+") ? "#34c759" : "#aeaeb2", background: insight.tag.startsWith("+") ? "#f0faf3" : "#e5e5e7", borderRadius: 999, padding: "2px 8px", flexShrink: 0 }}>{insight.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA at bottom of section */}
        <div style={{ textAlign: "center", marginTop: 56 }}>
          <p style={{ fontSize: 15, color: "#6e6e73", marginBottom: 20 }}>
            That's it. Runs automatically every week — or on demand.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {isSignedIn ? (
              <Link href="/dashboard" className="btn-black">
                Open Dashboard
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            ) : (
              <>
                <Link href="/sign-up" className="btn-black">
                  Start free trial
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link href="/pricing" className="btn-ghost">See pricing</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── Engines coverage ── */}
      <section id="engines" style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              Coverage
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.025em", color: "#1d1d1f", lineHeight: 1.1, marginBottom: 20 }}>
              Three engines.<br />One unified view.
            </h2>
            <p style={{ fontSize: 17, color: "#6e6e73", lineHeight: 1.6, marginBottom: 32, maxWidth: 400 }}>
              ChatGPT handles 72% of AI search traffic. Gemini is growing fast. Perplexity leads for research queries. Missing any one means losing ground to competitors.
            </p>
            {isSignedIn ? (
              <Link href="/dashboard" className="btn-black">
                View your engine scores
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            ) : (
              <Link href="/sign-up" className="btn-black">
                Start tracking free
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { name: "ChatGPT", share: "72%", note: "GPT-4o · largest reach", bar: 72 },
              { name: "Google Gemini", share: "18%", note: "Gemini 1.5 Pro · fast growing", bar: 18, offset: true },
              { name: "Perplexity", share: "10%", note: "Research queries · high intent", bar: 10 },
            ].map((e) => (
              <div
                key={e.name}
                className="card-white"
                style={{
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginLeft: e.offset ? 32 : 0,
                  cursor: "default",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#1d1d1f" }}>{e.name}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#1d1d1f" }}>{e.share}</span>
                  </div>
                  <div className="stat-bar-track">
                    <div className="stat-bar-fill" style={{ width: `${e.bar * 1.2}%`, background: ENGINE_COLORS[e.name] }} />
                  </div>
                  <p style={{ fontSize: 12, color: "#aeaeb2", marginTop: 6 }}>{e.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing CTA — dark section ── */}
      <section
        id="pricing"
        style={{ background: "#1d1d1f", padding: "100px 24px", marginTop: 0 }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
            Pricing
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", fontWeight: 700, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.08, marginBottom: 16 }}>
            Transparent plans.<br />No surprises.
          </h2>
          <p style={{ fontSize: 18, color: "#8e8e93", lineHeight: 1.55, marginBottom: 40 }}>
            Start with a 7-day free trial. No credit card required. Cancel anytime.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <Link href="/pricing" className="btn-white">
              View all plans
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            {!isSignedIn && (
              <Link href="/sign-up" className="btn-ghost" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}>
                Start free trial
              </Link>
            )}
          </div>

          <p style={{ fontSize: 13, color: "#6e6e73", fontFamily: "var(--font-mono)" }}>
            Starter $39 · Growth $79 · Pro $149 / mo
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#1d1d1f", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Logo className="w-6 h-6" />
            <span style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>Vellor</span>
          </Link>
          <p style={{ fontSize: 13, color: "#6e6e73" }}>© 2025 Vellor. All rights reserved.</p>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Contact"].map(l => (
              <a
                key={l}
                href="#"
                className="footer-link"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </main>
  );
}
