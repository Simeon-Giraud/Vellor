import { SignInButton, SignUpButton, UserButton, Show } from "@clerk/nextjs";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vellor — AI Brand Visibility Monitoring",
  description:
    "Track how your brand appears across ChatGPT, Gemini, and Perplexity. Optimize your Generative Engine Optimization (GEO) performance.",
};

const FEATURES = [
  {
    icon: "🤖",
    title: "Multi-Engine Tracking",
    description:
      "Monitor your brand mentions across ChatGPT, Gemini, and Perplexity simultaneously with a single prompt run.",
  },
  {
    icon: "📊",
    title: "Position Analytics",
    description:
      "Know exactly where your brand ranks in AI-generated responses. Track your mention position over time.",
  },
  {
    icon: "⚡",
    title: "Automated Monitoring",
    description:
      "Schedule automated prompt runs with our BullMQ job queue. Get alerts when your brand visibility changes.",
  },
  {
    icon: "🎯",
    title: "Competitor Intelligence",
    description:
      "Track your competitors alongside your brand. Understand the full competitive landscape in AI responses.",
  },
  {
    icon: "📈",
    title: "Trend Reports",
    description:
      "Visualize your GEO performance over time. Identify trends and measure the impact of your optimization efforts.",
  },
  {
    icon: "🔔",
    title: "Smart Alerts",
    description:
      "Get notified instantly when your brand appears, disappears, or changes position in AI responses.",
  },
];

const ENGINES = [
  { name: "ChatGPT", icon: "💬", color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30" },
  { name: "Gemini", icon: "✨", color: "from-blue-500/20 to-indigo-500/20", border: "border-blue-500/30" },
  { name: "Perplexity", icon: "🔍", color: "from-purple-500/20 to-violet-500/20", border: "border-purple-500/30" },
];

const PRICING = [
  {
    name: "Free",
    price: 0,
    features: ["1 project", "5 prompts per project", "10 runs/month", "3 AI engines"],
    cta: "Start for free",
    highlight: false,
  },
  {
    name: "Pro",
    price: 49,
    features: ["10 projects", "50 prompts per project", "500 runs/month", "3 AI engines", "Priority support", "Export reports"],
    cta: "Start Pro trial",
    highlight: true,
  },
  {
    name: "Agency",
    price: 149,
    features: ["100 projects", "500 prompts per project", "5,000 runs/month", "3 AI engines", "Dedicated support", "White-label reports", "API access"],
    cta: "Contact sales",
    highlight: false,
  },
];

export default async function HomePage() {

  return (
    <main className="min-h-screen animated-gradient noise-overlay relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full bg-pink-600/8 blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">
            G
          </div>
          <span className="text-xl font-bold text-white">Vellor</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#engines" className="hover:text-white transition-colors">Engines</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-200"
            >
              Dashboard →
            </Link>
            <UserButton />
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-200 glow-indigo">
                Get started free →
              </button>
            </SignUpButton>
          </Show>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-32 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-indigo-300 mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-indigo-400 pulse-dot"></span>
          Monitoring 3 AI engines in real-time
        </div>

        <h1 className="text-6xl md:text-7xl font-black text-white leading-tight mb-6 animate-fade-in-up animate-fade-in-up-delay-1">
          Is your brand{" "}
          <span className="gradient-text">visible</span>
          <br />
          in AI responses?
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animate-fade-in-up-delay-2">
          Vellor tracks when and where your brand appears in ChatGPT, Gemini, and Perplexity
          responses. Optimize your{" "}
          <span className="text-indigo-300 font-medium">Generative Engine Optimization</span> with
          data-driven insights.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animate-fade-in-up-delay-3">
          <SignUpButton mode="modal">
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-base font-semibold transition-all duration-300 glow-indigo transform hover:scale-105">
              Start monitoring free →
            </button>
          </SignUpButton>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass glass-hover text-white text-base font-medium transition-all duration-200"
          >
            See how it works
          </a>
        </div>

        {/* Mock dashboard preview */}
        <div className="mt-20 relative animate-fade-in-up animate-fade-in-up-delay-4">
          <div className="glass rounded-2xl p-1 gradient-border glow-indigo">
            <div className="bg-[#111118] rounded-xl p-6 text-left">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="text-xs text-slate-500 ml-2">vellor.app/dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {ENGINES.map((engine) => (
                  <div
                    key={engine.name}
                    className={`rounded-xl p-4 bg-gradient-to-br ${engine.color} border ${engine.border}`}
                  >
                    <div className="text-2xl mb-2">{engine.icon}</div>
                    <div className="text-sm font-semibold text-white">{engine.name}</div>
                    <div className="text-xs text-slate-400 mt-1">Brand mentioned</div>
                    <div className="text-lg font-bold text-green-400 mt-1">✓ Position #2</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <div className="text-xs text-slate-400 mb-1">Latest prompt run</div>
                <div className="text-sm text-white">"What are the best AI monitoring tools for brands?"</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">3/3 engines</span>
                  <span className="text-xs text-slate-500">2 minutes ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything you need for <span className="gradient-text">GEO monitoring</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A complete platform to track, analyze, and optimize your brand's presence in
            AI-generated content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="glass glass-hover rounded-2xl p-6 transition-all duration-300 hover:transform hover:scale-[1.02]"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Engines */}
      <section id="engines" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Track across every <span className="gradient-text">major AI engine</span>
          </h2>
          <p className="text-slate-400 text-lg">
            One dashboard. Three AI engines. Complete visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "ChatGPT", icon: "💬", desc: "OpenAI's GPT-4 and GPT-4o responses", color: "emerald", stats: "72% of AI search traffic" },
            { name: "Google Gemini", icon: "✨", desc: "Google's Gemini Pro and Ultra models", color: "blue", stats: "18% of AI search traffic" },
            { name: "Perplexity", icon: "🔍", desc: "Real-time web-grounded AI responses", color: "purple", stats: "10% of AI search traffic" },
          ].map((engine) => (
            <div key={engine.name} className="glass rounded-2xl p-8 text-center hover:transform hover:scale-[1.02] transition-all duration-300 gradient-border">
              <div className="text-5xl mb-4">{engine.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{engine.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{engine.desc}</p>
              <div className="text-xs px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 inline-block">
                {engine.stats}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Simple, <span className="gradient-text">transparent pricing</span>
          </h2>
          <p className="text-slate-400 text-lg">Start free. Scale as you grow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col ${
                plan.highlight
                  ? "bg-gradient-to-b from-indigo-600/30 to-purple-600/20 border border-indigo-500/40 glow-indigo"
                  : "glass"
              }`}
            >
              {plan.highlight && (
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-4">
                  ⭐ Most popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-black text-white">${plan.price}</span>
                <span className="text-slate-400 text-sm">/month</span>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                    <span className="text-indigo-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <SignUpButton mode="modal">
                <button
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.highlight
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                      : "glass glass-hover text-white"
                  }`}
                >
                  {plan.cta}
                </button>
              </SignUpButton>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
              G
            </div>
            <span className="text-white font-semibold">Vellor</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2025 Vellor. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
