"use client";

import { useState } from "react";
import Link from "next/link";

interface PricingProps {
  isSignedIn: boolean;
}

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10a37f" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DashIcon = () => (
  <span style={{ color: "rgba(255, 255, 255, 0.15)", fontSize: 16, display: "block", textAlign: "center" }}>—</span>
);

export function Pricing({ isSignedIn }: PricingProps) {
  const [showTable, setShowTable] = useState(false);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
      <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, letterSpacing: "-0.04em", marginBottom: 16 }}>
        Simple, transparent pricing.
      </h2>
      <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.55, marginBottom: 80 }}>
        Start optimizing your brand's AI presence today. 7-day free trial. Cancel anytime.
      </p>

      {/* Grid of pricing cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, textAlign: "left", alignItems: "stretch" }}>
        
        {/* Starter */}
        <div className="pricing-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 32, padding: 40, display: "flex", flexDirection: "column", height: "100%" }}>
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
        <div className="pricing-card" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 32, padding: 40, display: "flex", flexDirection: "column", boxShadow: "0 0 0 1px rgba(0, 113, 227, 0.3), 0 32px 64px -16px rgba(0, 113, 227, 0.2)", position: "relative", height: "100%" }}>
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
        <div className="pricing-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 32, padding: 40, display: "flex", flexDirection: "column", height: "100%" }}>
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

      {/* Button to toggle comparison table */}
      <div style={{ marginTop: 40, textAlign: "center" }}>
        <button
          onClick={() => setShowTable(!showTable)}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255, 255, 255, 0.55)",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.55)";
          }}
        >
          Compare Plans
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transition: "transform 0.3s ease",
              transform: showTable ? "rotate(180deg)" : "rotate(0deg)",
              opacity: 0.8,
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Detailed Feature Comparison Table (collapsible container) */}
      <div
        style={{
          maxHeight: showTable ? "1200px" : "0px",
          opacity: showTable ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, margin-top 0.4s ease",
          marginTop: showTable ? 64 : 0,
          textAlign: "left",
        }}
      >
        <div style={{ overflowX: "auto", width: "100%", borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.01)", backdropFilter: "blur(16px)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, color: "#fff" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
                <th style={{ padding: "18px 24px", color: "rgba(255,255,255,0.5)", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>Features</th>
                <th style={{ padding: "18px 24px", color: "#fff", fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", width: "22%" }}>Starter</th>
                <th style={{ padding: "18px 24px", color: "#fff", fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", width: "22%" }}>Growth</th>
                <th style={{ padding: "18px 24px", color: "#fff", fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", width: "22%" }}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {/* Core Limits */}
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "16px 24px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Projects & prompts</td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>5 (20 per project)</td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>10 (50 per project)</td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>Unlimited (100/project)</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "16px 24px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Monthly tracking runs</td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>100</td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>500</td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>1,000</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "16px 24px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Competitors tracked</td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>1</td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>3</td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>Unlimited</td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "16px 24px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Data history retention</td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>30 days</td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>60 days</td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}>1 year</td>
              </tr>

              {/* Alerts & Exports */}
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "16px 24px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Slack & email alerts</td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}><DashIcon /></td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}><CheckIcon /></td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}><CheckIcon /></td>
              </tr>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "16px 24px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>CSV & PDF report exports</td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}><DashIcon /></td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}><DashIcon /></td>
                <td style={{ padding: "16px 24px", textAlign: "center" }}><CheckIcon /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
