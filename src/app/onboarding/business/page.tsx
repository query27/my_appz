"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browser-client";
import OnboardingProgress from "@/app/components/OnboardingProgress";

export default function BusinessPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleNext() {
    if (!businessName.trim()) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        business_name: businessName,
        phone,
        email: email || user.email,
        onboarding_step: 2,
      });
    }

    router.push("/onboarding/invoices");
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

        <OnboardingProgress currentStep={1} />

        {/* Card */}
        <div className="bg-[#0f1f18] border border-gray-700/60 rounded-2xl p-8">
          <h1 className="text-white font-extrabold text-2xl mb-1">Tell us about your business</h1>
          <p className="text-gray-400 text-sm mb-8">This helps us personalize your reminders for your clients.</p>

          <div className="flex flex-col gap-5">

            {/* Business name */}
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">
                Business Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Studio"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-[#111c17] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition text-sm"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">
                Phone Number
                <span className="text-gray-600 font-normal ml-2">— for payment update notifications</span>
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#111c17] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">
                Business Email
                <span className="text-gray-600 font-normal ml-2">— or skip if same as login</span>
              </label>
              <input
                type="email"
                placeholder="billing@yourbusiness.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111c17] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition text-sm"
              />
            </div>

          </div>

          {/* CTA */}
          <button
            onClick={handleNext}
            disabled={!businessName.trim() || loading}
            className="mt-8 w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition text-white font-semibold py-3 rounded-xl text-sm"
          >
            {loading ? "Saving…" : "Continue →"}
          </button>

          <p className="text-gray-600 text-xs text-center mt-4">
            You can update these details anytime from settings
          </p>
        </div>

      </div>
    </div>
  );
}