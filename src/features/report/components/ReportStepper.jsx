export default function ReportStepper({ steps, currentStep }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;

        return (
          <div
            key={step.id}
            className={`rounded-[24px] border p-4 transition ${
              isActive
                ? 'border-[#183665] bg-[#183665] text-white'
                : isComplete
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : isComplete
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                }`}
              >
                {isComplete ? '✓' : index + 1}
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] opacity-80">{step.short}</p>
                <p className="text-sm font-semibold">{step.title}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
