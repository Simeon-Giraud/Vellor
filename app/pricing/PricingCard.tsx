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
        body: JSON.stringify({ 
          priceId: plan.priceId,
          isTrial: window.location.search.includes("trial=true")
        }),
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

  const isDark = plan.highlight;

  return (
    <div
      style={{
        background: isDark ? "#1d1d1f" : "#ffffff",
        color: isDark ? "#ffffff" : "#1d1d1f",
        border: isDark ? "1px solid transparent" : "1px solid rgba(0, 0, 0, 0.06)",
        boxShadow: isDark ? "0 20px 40px rgba(0,0,0,0.12)" : "0 4px 12px rgba(0,0,0,0.03)",
      }}
      className="relative rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {plan.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span
            style={{ background: "#0071e3", color: "#ffffff" }}
            className="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
          >
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h2
          style={{ color: isDark ? "#ffffff" : "#1d1d1f" }}
          className="text-2xl font-bold mb-1 tracking-tight"
        >
          {plan.name}
        </h2>
        <p style={{ color: isDark ? "#8e8e93" : "#6e6e73" }} className="text-sm">
          {plan.description}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span
            style={{ color: isDark ? "#ffffff" : "#1d1d1f" }}
            className="text-5xl font-extrabold tracking-tight"
          >
            ${plan.price}
          </span>
          <span style={{ color: isDark ? "#8e8e93" : "#6e6e73" }} className="text-sm">
            /month
          </span>
        </div>
      </div>

      <ul className="space-y-3.5 flex-1 mb-8">
        {plan.features.map((feature: string) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <span style={{ color: "#0071e3" }} className="mt-0.5 shrink-0 font-bold">✓</span>
            <span style={{ color: isDark ? "#e5e5e7" : "#424245" }}>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        id={`subscribe-${plan.id}`}
        onClick={handleSubscribe}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.97] flex items-center justify-center gap-2 ${
          isDark ? "btn-white" : "btn-black"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <>
            <span
              style={{ borderTopColor: isDark ? "#1d1d1f" : "#ffffff" }}
              className="w-4 h-4 border-2 border-zinc-400 rounded-full animate-spin"
            />
            Redirecting...
          </>
        ) : (
          plan.cta
        )}
      </button>
    </div>
  );
}
