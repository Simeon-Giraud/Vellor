"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#f5f5f7]">
      {/* Background styling matching Vellor light-mode vibe */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0071e3]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md animate-fade-in-up relative z-10">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
            <Logo className="w-8 h-8" />
            <span className="text-xl font-bold text-[#1d1d1f] tracking-tight">Vellor</span>
          </Link>
        </div>

        <div className="card-white rounded-2xl p-8 border border-black/[0.06] shadow-xl bg-white">
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight mb-2">Welcome back</h1>
          <p className="text-zinc-500 mb-8 text-sm">Enter your details to sign in to your account.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-zinc-200 text-zinc-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0071e3]/50 focus:ring-1 focus:ring-[#0071e3]/50 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#0071e3] hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-zinc-200 text-zinc-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0071e3]/50 focus:ring-1 focus:ring-[#0071e3]/50 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-2.5 rounded-lg bg-[#1d1d1f] hover:bg-[#3d3d3f] text-white font-medium transition-all duration-[160ms] ease-out active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-[#0071e3] hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
