"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CompletePage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Separate effect to handle redirect when countdown hits 0
  useEffect(() => {
    if (countdown <= 0) {
      router.push("/dashboard");
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-[#0a1a14] flex items-center justify-center px-4">

      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-900/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md text-center">

        {/* Success icon */}
        <div className="w-24 h-24 bg-emerald-700/30 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-white font-extrabold text-3xl mb-2">You&apos;re all set! 🎉</h1>
        <p className="text-gray-400 text-base mb-2">
          GentleChase is ready to start recovering your invoices.
        </p>
        <p className="text-gray-600 text-sm mb-10">
          Your 30-day free trial has started. No credit card needed.
        </p>

        {/* Summary */}
        <div className="bg-[#0f1f18] border border-gray-700/60 rounded-2xl p-6 mb-8 text-left">
          {[
            { label: "Business profile",      done: true },
            { label: "First invoice added",   done: true },
            { label: "Reminder style set",    done: true },
            { label: "Payment integration",   done: false, note: "Optional — set up later" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 py-2 border-b border-gray-800/60 last:border-0">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                item.done ? "bg-emerald-700" : "bg-gray-700"
              }`}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-gray-300 text-sm flex-1">{item.label}</span>
              {item.note && <span className="text-gray-600 text-xs">{item.note}</span>}
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-emerald-700 hover:bg-emerald-600 transition text-white font-semibold py-3 rounded-xl text-sm mb-3"
        >
          Go to Dashboard →
        </button>

        <p className="text-gray-600 text-xs">
          Redirecting automatically in {countdown}s…
        </p>

      </div>
    </div>
  );
}