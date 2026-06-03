"use client";

import Link from "next/link";

export default function CanceledOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Subscription Canceled</h2>
        <p className="text-[#888] text-sm leading-relaxed mb-8">
          Your access to Vellor has been suspended because your subscription was canceled. To regain access to your projects and tracking data, please resubscribe.
        </p>
        
        <Link 
          href="/pricing" 
          className="w-full py-3 px-4 bg-white text-black font-semibold rounded-xl transition-transform active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2"
        >
          Resubscribe Now
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      </div>
    </div>
  );
}
