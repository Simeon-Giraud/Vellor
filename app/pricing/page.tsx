import Link from "next/link";
import { PricingCard } from "./PricingCard";
import { Logo } from "@/components/Logo";

export default function PricingPage() {
  const PLANS = [
    {
      id: "starter",
      name: "Starter",
      price: 39,
      priceId: process.env.STRIPE_STARTER_PRICE_ID,
      description: "Perfect for solo founders and small brands",
      features: [
        "5 projects",
        "20 prompts per project",
        "100 runs/month",
        "ChatGPT, Gemini & Perplexity",
        "1 competitor tracked",
        "30-day data history",
        "Email alerts",
      ],
      highlight: false,
      cta: "Get Starter",
    },
    {
      id: "growth",
      name: "Growth",
      price: 79,
      priceId: process.env.STRIPE_GROWTH_PRICE_ID,
      description: "For growing teams monitoring multiple brands",
      features: [
        "10 projects",
        "50 prompts per project",
        "500 runs/month",
        "ChatGPT, Gemini & Perplexity",
        "3 competitors tracked",
        "60-day data history",
        "Slack & email alerts",
        "Competitor tracking",
      ],
      highlight: true,
      cta: "Get Growth",
    },
    {
      id: "pro",
      name: "Pro",
      price: 149,
      priceId: process.env.STRIPE_PRO_PRICE_ID,
      description: "For established brands and agencies",
      features: [
        "Unlimited projects",
        "100 prompts per project",
        "1,000 runs/month",
        "ChatGPT, Gemini & Perplexity",
        "Unlimited competitors tracked",
        "1-year data history",
        "Slack & email alerts",
        "Export reports (CSV/PDF)",
        "Priority support",
      ],
      highlight: false,
      cta: "Get Pro",
    },
  ];

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "#f5f5f7" }}
    >
      {/* Ambient soft glow */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          right: "-10%",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0, 113, 227, 0.04) 0%, rgba(0, 113, 227, 0) 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header className="border-b border-black/[0.06] px-4 md:px-8 py-4 flex items-center justify-between" style={{ background: "#ffffff", position: "relative", zIndex: 10 }}>
        <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
          <Logo className="w-7 h-7" />
          <span style={{ fontWeight: 600, fontSize: 15, color: "#1d1d1f", letterSpacing: "-0.01em" }}>Vellor</span>
        </Link>
        <Link href="/dashboard" className="text-zinc-500 hover:text-zinc-900 transition-colors text-sm" style={{ textDecoration: "none" }}>
          ← Dashboard
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-zinc-600 bg-zinc-200/50 mb-6 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
            Test mode — no real charges
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1d1d1f] mb-4 tracking-tight">
            Simple, <span style={{
              background: "linear-gradient(90deg, #0071e3, #00d2ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>transparent pricing</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto">
            Start monitoring your brand in AI responses today. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto items-stretch">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        <p className="text-center text-xs text-zinc-400 mt-12 font-mono">
          Prices exclude VAT where applicable. All plans include a 7-day free trial.
        </p>
      </div>
    </div>
  );
}
