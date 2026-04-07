export const StepProgress = ({ steps, currentStep }) => {
  const progress = ((currentStep - 1) / Math.max(steps.length - 1, 1)) * 100;

  return (
    <div className="rounded-[28px] bg-white/88 p-5 shadow-[0_18px_35px_rgba(45,45,45,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#B78331]">
            Onboarding Journey
          </p>
          <h2 className="mt-2 text-xl font-bold">
            Step {currentStep} of {steps.length}
          </h2>
        </div>
        <span className="pet-chip">{steps[currentStep - 1]?.title}</span>
      </div>

      <div className="mt-5 h-2 rounded-full bg-[#F6E5C7]">
        <div
          className="h-full rounded-full bg-[linear-gradient(135deg,#F5A623,#FFB347)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isPast = stepNumber < currentStep;

          return (
            <div
              key={step.title}
              className={`rounded-[22px] px-4 py-3 text-sm transition-all ${
                isActive
                  ? "bg-[linear-gradient(135deg,#F5A623,#FFB347)] text-white shadow-[0_16px_30px_rgba(245,166,35,0.2)]"
                  : isPast
                    ? "bg-[#FFF0D6] text-[#8B6428]"
                    : "bg-[#FFF8EE] text-[#8B7B66]"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">
                0{stepNumber}
              </p>
              <p className="mt-2 font-semibold">{step.title}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
