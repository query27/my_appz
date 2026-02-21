"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browser-client";
import OnboardingProgress from "@/app/components/OnboardingProgress";

const styles = [
  {
    id: "polite",
    label: "Polite",
    emoji: "😊",
    description: "Warm and friendly tone. Great for long-term client relationships.",
    example: "Hi [Client], just a gentle nudge about Invoice #123 — hope all is well!",
  },
  {
    id: "firm",
    label: "Firm",
    emoji: "💼",
    description: "Professional and direct. Clear without being aggressive.",
    example: "Dear [Client], this is a reminder that Invoice #123 is now overdue.",
  },
  {
    id: "final",
    label: "Final Notice",
    emoji: "⚠️",
    description: "Serious tone for invoices that are significantly overdue.",
    example: "FINAL NOTICE: Invoice #123 requires immediate attention.",
  },
];

const patterns = [
  { id: "3days",  label: "Every 3 days",  description: "Best for invoices close to due date" },
  { id: "7days",  label: "Every 7 days",  description: "Weekly — most common choice" },
  { id: "14days", label: "Every 2 weeks", description: "Relaxed — for longer payment terms" },
];

export default function RemindersStep() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [selectedStyle, setSelectedStyle] = useState("polite");
  const [selectedPattern, setSelectedPattern] = useState("7days");
  const [loading, setLoading] = useState(false);

  async function handleNext() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        reminder_style: selectedStyle,
        reminder_pattern: selectedPattern,
        onboarding_step: 4,
      });
    }
    router.push("/onboarding/payments");
  }

  return (
    <div className="min-h-screen bg-[#0a1a14] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">GentleChase</span>
        </div>

        <OnboardingProgress currentStep={3} />

        <div className="bg-[#0f1f18] border border-gray-700/60 rounded-2xl p-8">
          <h1 className="text-white font-extrabold text-2xl mb-1">Set your reminder style</h1>
          <p className="text-gray-400 text-sm mb-8">How should GentleChase sound when chasing your invoices?</p>

          <div className="flex flex-col gap-3 mb-8">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStyle(s.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selectedStyle === s.id
                    ? "border-emerald-500 bg-emerald-900/20"
                    : "border-gray-700/60 bg-[#111c17] hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xl">{s.emoji}</span>
                  <span className="text-white font-semibold text-sm">{s.label}</span>
                  {selectedStyle === s.id && (
                    <span className="ml-auto text-emerald-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs mb-2">{s.description}</p>
                <p className="text-gray-600 text-xs italic">&ldquo;{s.example}&rdquo;</p>
              </button>
            ))}
          </div>

          <p className="text-gray-300 text-sm font-semibold mb-3">How often should we send reminders?</p>
          <div className="flex gap-3 flex-wrap mb-8">
            {patterns.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPattern(p.id)}
                className={`flex-1 min-w-[100px] p-3 rounded-xl border text-sm transition-all ${
                  selectedPattern === p.id
                    ? "border-emerald-500 bg-emerald-900/20 text-white"
                    : "border-gray-700/60 bg-[#111c17] text-gray-400 hover:border-gray-600"
                }`}
              >
                <p className="font-semibold">{p.label}</p>
                <p className="text-xs text-gray-500 mt-1">{p.description}</p>
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 transition text-white font-semibold py-3 rounded-xl text-sm"
          >
            {loading ? "Saving…" : "Continue →"}
          </button>

          <p className="text-gray-600 text-xs text-center mt-4">You can change this anytime from settings</p>
        </div>
      </div>
    </div>
  );
}