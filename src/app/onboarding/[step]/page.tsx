"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import BusinessStep from "../steps/BusinessStep";
import InvoicesStep from "../steps/InvoicesStep";
import RemindersStep from "../steps/RemindersStep";
import PaymentsStep from "../steps/PaymentsStep";
import CompleteStep from "../steps/CompleteStep";

const VALID_STEPS = ["business", "invoices", "reminders", "payments", "complete"];

export default function OnboardingPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = use(params); // ← Next.js 15 requires React.use() to unwrap params

  if (!VALID_STEPS.includes(step)) notFound();

  return (
    <div>
      {step === "business"  && <BusinessStep />}
      {step === "invoices"  && <InvoicesStep />}
      {step === "reminders" && <RemindersStep />}
      {step === "payments"  && <PaymentsStep />}
      {step === "complete"  && <CompleteStep />}
    </div>
  );
}