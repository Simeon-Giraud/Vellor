"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculateStrength(password);

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
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight mb-2">Create an account</h1>
          <p className="text-zinc-500 mb-8 text-sm">Join Vellor to track your brand's AI visibility.</p>

          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-[#1d1d1f] mb-2">Check your email</h2>
              <p className="text-zinc-600 text-sm">We've sent a confirmation link to <span className="text-zinc-900 font-medium">{email}</span>. Click it to activate your account.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm mb-4">
                  {error}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-zinc-200 text-zinc-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0071e3]/50 focus:ring-1 focus:ring-[#0071e3]/50 transition-colors"
                  placeholder="John Doe"
                />
              </div>

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
                <label className="text-sm font-medium text-zinc-700">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-zinc-200 text-zinc-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#0071e3]/50 focus:ring-1 focus:ring-[#0071e3]/50 transition-colors"
                  placeholder="••••••••"
                />
                {password.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 w-full rounded-full transition-colors ${
                          strength >= level
                            ? strength > 2 ? "bg-emerald-500" : strength === 2 ? "bg-amber-500" : "bg-red-500"
                            : "bg-zinc-200"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || password.length < 6}
                className="w-full mt-6 py-2.5 rounded-lg bg-[#1d1d1f] hover:bg-[#3d3d3f] text-white font-medium transition-all duration-[160ms] ease-out active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
          )}
          
          <div className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-[#0071e3] hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
