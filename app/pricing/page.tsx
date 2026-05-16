import Link from "next/link";
import { PricingCard } from "./PricingCard";

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
      style={{ background: "var(--color-surface)" }}
    >
      {/* Background orbs */}
      <div className="absolute top-[-10%] left-[5%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
            V
          </div>
          <span className="text-white font-bold">Vellor</span>
        </Link>
        <Link href="/dashboard" className="text-slate-400 text-sm hover:text-white transition-colors">
          ← Dashboard
        </Link>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-indigo-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-400 pulse-dot"></span>
            Test mode — no real charges
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Simple, <span className="gradient-text">transparent pricing</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Start monitoring your brand in AI responses today. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto">
          {PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Prices exclude VAT where applicable. All plans include a 7-day free trial.
        </p>
      </div>
    </div>
  );
}
