"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function DevLoginClient() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/dev-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, from }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(data.redirectTo || "/");
      } else {
        setError(true);
        setShake(true);
        setPassword("");
        setTimeout(() => setShake(false), 600);
        inputRef.current?.focus();
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html, body {
          height: 100%;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .page {
          min-height: 100vh;
          background: #080808;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        /* Subtle radial glow */
        .page::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 50% 0%, rgba(120, 80, 255, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(80, 140, 255, 0.06) 0%, transparent 50%);
          pointer-events: none;
        }

        /* Noise texture overlay */
        .page::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 40px 36px;
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.5),
            0 24px 48px rgba(0, 0, 0, 0.4),
            0 1px 0 rgba(255,255,255,0.06) inset;
          animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Status badge */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 99px;
          padding: 4px 12px;
          margin-bottom: 28px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #fbbf24;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fbbf24;
          animation: pulse 2s ease-in-out infinite;
          box-shadow: 0 0 0 0 rgba(251,191,36,0.4);
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,0.4); }
          50%       { box-shadow: 0 0 0 4px rgba(251,191,36,0); }
        }

        .wordmark {
          font-size: 28px;
          font-weight: 600;
          letter-spacing: -0.5px;
          color: #fff;
          margin-bottom: 8px;
          line-height: 1;
        }

        .subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.38);
          font-weight: 400;
          line-height: 1.5;
          margin-bottom: 32px;
        }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin-bottom: 28px;
        }

        label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .input-wrap {
          position: relative;
          margin-bottom: 16px;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.25);
          pointer-events: none;
          display: flex;
        }

        input[type="password"] {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 14px 12px 40px;
          font-size: 14px;
          font-family: inherit;
          color: #fff;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        input[type="password"]::placeholder {
          color: rgba(255,255,255,0.2);
        }

        input[type="password"]:focus {
          border-color: rgba(139,92,246,0.5);
          background: rgba(255,255,255,0.07);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
        }

        .input-error input[type="password"] {
          border-color: rgba(239, 68, 68, 0.5);
          box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
        }

        .error-msg {
          font-size: 12px;
          color: #f87171;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 5px;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .error-msg.visible { opacity: 1; }

        button[type="submit"] {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          color: #fff;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 0 rgba(255,255,255,0.12) inset, 0 4px 12px rgba(109,40,217,0.3);
        }

        button[type="submit"]:hover:not(:disabled) { opacity: 0.9; }
        button[type="submit"]:active:not(:disabled) { transform: scale(0.985); }
        button[type="submit"]:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }

        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }

        .footer-note {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          text-align: center;
          line-height: 1.6;
        }
      `}</style>

      <div className="page">
        <div className={`card ${shake ? "shake" : ""}`}>
          <div className="badge">
            <span className="badge-dot" />
            In Development
          </div>

          <div className="wordmark">Vellor</div>
          <p className="subtitle">
            This site is currently under active development and not yet publicly available.
          </p>

          <div className="divider" />

          <form onSubmit={handleSubmit}>
            <label htmlFor="dev-password">Access Password</label>

            <div className={`input-wrap ${error ? "input-error" : ""}`}>
              <span className="input-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                ref={inputRef}
                id="dev-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter access password"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            <p className={`error-msg ${error ? "visible" : ""}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Incorrect password. Please try again.
            </p>

            <button type="submit" disabled={loading || !password.trim()}>
              <span className="btn-inner">
                {loading ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10 17 15 12 10 7"/>
                      <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    Enter
                  </>
                )}
              </span>
            </button>
          </form>

          <p className="footer-note">
            Access restricted to authorized team members only.
            <br />
            Launching soon™
          </p>
        </div>
      </div>
    </>
  );
}

export default function DevLoginPage() {
  return (
    <Suspense fallback={<div className="page" style={{ background: "#080808" }} />}>
      <DevLoginClient />
    </Suspense>
  );
}
