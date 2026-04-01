import { cn } from "@e-infra/design-system";

export interface StepInfo {
  id: string;
  label: string;
}

export interface ProgressIndicatorProps {
  steps: StepInfo[];
  currentStep: number;
  className?: string;
}

/**
 * A progress indicator component showing step dots with labels.
 * Provides clear positional context within a multi-step form process.
 *
 * @example
 * ```tsx
 * <ProgressIndicator
 *   steps={[
 *     { id: "storage", label: "Storage" },
 *     { id: "resources", label: "Resources" },
 *     { id: "review", label: "Review" }
 *   ]}
 *   currentStep={0}
 * />
 * ```
 */
export function ProgressIndicator({
  steps,
  currentStep,
  className,
}: ProgressIndicatorProps): JSX.Element {
  return (
    <nav aria-label="Form progress" className={cn("w-full", className)}>
      <ol className="flex items-center justify-center gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <li key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200",
                  isCompleted && "bg-green-100 text-green-700",
                  isCurrent && "bg-blue-500 text-white shadow-sm",
                  isPending && "bg-gray-100 text-gray-400",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {/* Step number/dot */}
                <span
                  className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent && "bg-white/20 text-white",
                    isPending && "bg-gray-300 text-gray-500",
                  )}
                >
                  {index + 1}
                </span>

                {/* Step label */}
                <span className="text-sm font-medium hidden sm:inline">
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 h-0.5 mx-1 transition-colors",
                    index < currentStep ? "bg-green-400" : "bg-gray-200",
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.label}
      </div>
    </nav>
  );
}

export default ProgressIndicator;
