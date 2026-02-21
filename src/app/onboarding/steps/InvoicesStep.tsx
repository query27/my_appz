"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/app/lib/supabase/browser-client";
import OnboardingProgress from "@/app/components/OnboardingProgress";

export default function InvoicesStep() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [clientName, setClientName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleNext() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user && clientName && amount && dueDate) {
      await supabase.from("invoices").insert({
        user_id: user.id,
        client_name: clientName,
        amount: parseFloat(amount),
        due_date: dueDate,
        status: "pending",
      });
      await supabase.from("profiles").upsert({ id: user.id, onboarding_step: 3 });
    }
    router.push("/onboarding/reminders");
  }

  async function handleSkip() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("profiles").upsert({ id: user.id, onboarding_step: 3 });
    router.push("/onboarding/reminders");
  }

  return (
    <div className="min-h-screen bg-[#0a1a14] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">

        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">GentleChase</span>
        </div>

        <OnboardingProgress currentStep={2} />

        <div className="bg-[#0f1f18] border border-gray-700/60 rounded-2xl p-8">
          <h1 className="text-white font-extrabold text-2xl mb-1">Add your first invoice</h1>
          <p className="text-gray-400 text-sm mb-8">
            Got an unpaid invoice? Let&apos;s add it so GentleChase can start chasing it for you.
          </p>

          <div className="flex flex-col gap-5">
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">Client Name</label>
              <input
                type="text"
                placeholder="e.g. Officer, Inc."
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-[#111c17] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition text-sm"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-gray-300 text-sm font-medium block mb-2">Amount ($)</label>
                <input
                  type="number"
                  placeholder="2150"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#111c17] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-gray-300 text-sm font-medium block mb-2">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[#111c17] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition text-sm"
                />
              </div>
            </div>
          </div>

          {clientName && amount && (
            <div className="mt-6 bg-[#0a1a14] border border-emerald-700/40 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-semibold">{clientName}</p>
                <p className="text-gray-500 text-xs">Invoice pending</p>
              </div>
              <p className="text-emerald-400 font-extrabold text-lg">${parseFloat(amount || "0").toLocaleString()}</p>
            </div>
          )}

          <button
            onClick={handleNext}
            disabled={loading}
            className="mt-8 w-full bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 transition text-white font-semibold py-3 rounded-xl text-sm"
          >
            {loading ? "Saving…" : "Continue →"}
          </button>

          <button
            onClick={handleSkip}
            className="mt-3 w-full text-gray-600 hover:text-gray-400 transition text-sm py-2"
          >
            Skip for now — I&apos;ll add invoices later
          </button>
        </div>
      </div>
    </div>
  );
}