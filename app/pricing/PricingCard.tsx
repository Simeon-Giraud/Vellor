"use client";

import { useState } from "react";

export function PricingCard({ plan }: { plan: any }) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Something went wrong");
      }
    } catch (err) {
      alert("Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 ${
        plan.highlight
          ? "bg-gradient-to-b from-indigo-600/25 to-purple-600/15 border border-indigo-500/50 glow-indigo"
          : "glass border border-white/10 hover:border-white/20"
      }`}
    >
      {plan.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white uppercase tracking-wider">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">{plan.name}</h2>
        <p className="text-slate-400 text-sm">{plan.description}</p>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black text-white">${plan.price}</span>
          <span className="text-slate-400 text-sm">/month</span>
        </div>
      </div>

      <ul className="space-y-3 flex-1 mb-8">
        {plan.features.map((feature: string) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <span className="text-indigo-400 mt-0.5 shrink-0">✓</span>
            <span className="text-slate-300">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        id={`subscribe-${plan.id}`}
        onClick={handleSubscribe}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-[transform,filter,color,background-color,border-color] duration-[160ms] ease-out active:scale-[0.97] flex items-center justify-center gap-2 ${
          plan.highlight
            ? "bg-indigo-600 hover:bg-indigo-500 text-white"
            : "glass glass-hover text-white border border-white/10 hover:border-white/20"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Redirecting...
          </>
        ) : (
          plan.cta
        )}
      </button>
    </div>
  );
}
