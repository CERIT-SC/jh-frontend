import { cn } from "@e-infra/design-system";
import { X, Check } from "lucide-react";

export interface SummaryChipItem {
  id: string;
  label: string;
  value: string | boolean;
  category?: string;
}

export interface SummaryChipsProps {
  items: SummaryChipItem[];
  onRemove?: (id: string) => void;
  className?: string;
}

/**
 * A summary chips component displaying current configuration as removable tags.
 * Allows users to review selections before proceeding.
 *
 * @example
 * ```tsx
 * <SummaryChips
 *   items={[
 *     { id: "ph", label: "Persistent Home", value: "New" },
 *     { id: "s3", label: "S3 Storage", value: true }
 *   ]}
 *   onRemove={(id) => console.log("Remove:", id)}
 * />
 * ```
 */
export function SummaryChips({
  items,
  onRemove,
  className,
}: SummaryChipsProps): JSX.Element {
  if (items.length === 0) {
    return (
      <div className={cn("text-sm text-gray-500 italic", className)}>
        No storage options selected
      </div>
    );
  }

  const groupedItems = items.reduce<Record<string, SummaryChipItem[]>>(
    (acc, item) => {
      const category = item.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {},
  );

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Check className="w-4 h-4 text-green-500" aria-hidden="true" />
        Configuration Summary
      </h4>

      <div className="flex flex-wrap gap-2">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className="flex flex-wrap gap-2">
            {categoryItems.map((item) => {
              const displayValue =
                typeof item.value === "boolean"
                  ? item.value
                    ? "Enabled"
                    : "Disabled"
                  : item.value;

              return (
                <span
                  key={item.id}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                    "bg-gray-100 text-gray-700 border border-gray-200",
                    "transition-colors hover:bg-gray-200",
                  )}
                >
                  <span className="text-gray-500">{item.label}:</span>
                  <span
                    className={cn(
                      typeof item.value === "boolean" && item.value
                        ? "text-green-600"
                        : typeof item.value === "boolean" && !item.value
                          ? "text-red-500"
                          : "text-gray-900",
                    )}
                  >
                    {displayValue}
                  </span>
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className={cn(
                        "ml-1 p-0.5 rounded-full hover:bg-gray-300",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                      )}
                      aria-label={`Remove ${item.label}`}
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  )}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SummaryChips;
