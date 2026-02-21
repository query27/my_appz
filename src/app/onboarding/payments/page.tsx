"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browser-client";
import OnboardingProgress from "@/app/components/OnboardingProgress";

export default function PaymentsPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);

  async function handleConnectStripe() {
    // Placeholder — wire up Stripe Connect later
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Stripe Connect coming soon!");
    }, 800);
  }

  async function handleSkip() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        onboarding_step: 5,
        onboarding_complete: true,
      });
    }
    router.push("/onboarding/complete");
  }

  async function handleDone() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        onboarding_step: 5,
        onboarding_complete: true,
      });
    }
    router.push("/onboarding/complete");
  }

  return (
    <div className="min-h-screen bg-[#0a1a14] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">GentleChase</span>
        </div>

        <OnboardingProgress currentStep={4} />

        <div className="bg-[#0f1f18] border border-gray-700/60 rounded-2xl p-8">
          <h1 className="text-white font-extrabold text-2xl mb-1">Get paid directly</h1>
          <p className="text-gray-400 text-sm mb-8">
            Connect Stripe so your clients can pay you instantly from the reminder email — no back and forth.
          </p>

          {/* Stripe card */}
          <div className="bg-[#111c17] border border-gray-700/40 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              {/* Stripe logo placeholder */}
              <div className="w-12 h-12 bg-[#635BFF] rounded-xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">Stripe Connect</p>
                <p className="text-gray-500 text-xs">Secure · Instant payouts · Industry standard</p>
              </div>
            </div>

            <ul className="flex flex-col gap-2 mb-6">
              {[
                "Clients pay directly from reminder emails",
                "Funds land in your bank account",
                "Automatic payment confirmation",
                "Zero setup fees",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-gray-400 text-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={handleConnectStripe}
              disabled={loading}
              className="w-full bg-[#635BFF] hover:bg-[#5851e8] disabled:opacity-50 transition text-white font-semibold py-3 rounded-xl text-sm"
            >
              {loading ? "Connecting…" : "Connect Stripe →"}
            </button>
          </div>

          <button
            onClick={handleDone}
            className="w-full bg-emerald-700 hover:bg-emerald-600 transition text-white font-semibold py-3 rounded-xl text-sm mb-3"
          >
            Finish Setup →
          </button>

          <button
            onClick={handleSkip}
            className="w-full text-gray-600 hover:text-gray-400 transition text-sm py-2"
          >
            Skip for now — I&apos;ll connect payments later
          </button>
        </div>

      </div>
    </div>
  );
}