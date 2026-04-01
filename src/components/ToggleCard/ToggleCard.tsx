import { cn } from "@e-infra/design-system";
import { Check, X } from "lucide-react";

export interface ToggleCardProps {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
  badge?: string;
}

/**
 * A toggle card component providing instant visual overview of enabled/disabled options.
 * Displays a clear visual state with checkmark/cross indicators.
 *
 * @example
 * ```tsx
 * <ToggleCard
 *   id="s3-storage"
 *   title="S3 Storage"
 *   description="Mount S3-compatible object storage"
 *   enabled={s3Enabled}
 *   onToggle={setS3Enabled}
 * />
 * ```
 */
export function ToggleCard({
  id,
  title,
  description,
  icon,
  enabled,
  onToggle,
  disabled = false,
  className,
  badge,
}: ToggleCardProps): JSX.Element {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle(!enabled);
    }
  };

  return (
    <div
      role="switch"
      aria-checked={enabled}
      aria-disabled={disabled}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onToggle(!enabled)}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        enabled
          ? "border-blue-500 bg-blue-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className,
      )}
    >
      {/* Status indicator */}
      {/* <div
        className={cn(
          "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors",
          enabled ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-400",
        )}
      >
        {enabled ? (
          <Check className="w-4 h-4" aria-hidden="true" />
        ) : (
          <X className="w-4 h-4" aria-hidden="true" />
        )}
      </div> */}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {icon && (
            <span className="flex-shrink-0 text-gray-600" aria-hidden="true">
              {icon}
            </span>
          )}
          <h3
            id={`${id}-title`}
            className={cn(
              "text-sm font-semibold",
              enabled ? "text-blue-900" : "text-gray-700",
            )}
          >
            {title}
          </h3>
          {badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {badge}
            </span>
          )}
        </div>
        <p
          id={`${id}-description`}
          className={cn(
            "mt-1 text-sm",
            enabled ? "text-blue-700" : "text-gray-500",
          )}
        >
          {description}
        </p>
      </div>

      {/* Visual toggle switch */}
      <div
        className={cn(
          "flex-shrink-0 w-11 h-6 rounded-full relative transition-colors",
          enabled ? "bg-blue-500" : "bg-gray-300",
        )}
        aria-hidden="true"
      >
        <div
          className={cn(
            "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform",
            enabled ? "translate-x-5 left-0.5" : "translate-x-0 left-0.5",
          )}
        />
      </div>
    </div>
  );
}

export default ToggleCard;
