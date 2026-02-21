type OnboardingProgressProps = {
  currentStep: number; // 1-4
  totalSteps?: number;
};

const steps = [
  { number: 1, label: "Business" },
  { number: 2, label: "Invoices" },
  { number: 3, label: "Reminders" },
  { number: 4, label: "Payments" },
];

export default function OnboardingProgress({ currentStep, totalSteps = 4 }: OnboardingProgressProps) {
  return (
    <div className="w-full mb-10">
      {/* Step label */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-gray-400 text-sm">Step {currentStep} of {totalSteps}</p>
        <p className="text-emerald-400 text-sm font-semibold">{steps[currentStep - 1]?.label}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between mt-3">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center gap-1">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              step.number < currentStep
                ? "bg-emerald-500"
                : step.number === currentStep
                ? "bg-emerald-400 ring-2 ring-emerald-400/30"
                : "bg-gray-700"
            }`} />
            <span className={`text-xs ${
              step.number === currentStep ? "text-emerald-400" : "text-gray-600"
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}