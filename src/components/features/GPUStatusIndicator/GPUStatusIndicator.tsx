import React from "react";

export type GPUStatus = "free" | "used";

export interface GPUSquareProps {
  /** Status of the GPU square */
  status: GPUStatus;
  /** Size of the square */
  size?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

export interface GPUStatusIndicatorProps {
  /** Label for the GPU type (e.g., "A100", "V100", "RTX 4090") */
  label: string;
  /** Number of free/available GPUs */
  free: number;
  /** Total number of GPUs */
  total: number;
  /** Size of each GPU square */
  size?: "sm" | "md" | "lg";
  /** Gap between GPU squares */
  gap?: "sm" | "md" | "lg";
  /** Additional className for the container */
  className?: string;
}

const sizeClasses: Record<string, string> = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

const gapClasses: Record<string, string> = {
  sm: "gap-1.5",
  md: "gap-2",
  lg: "gap-3",
};

/**
 * GPUSquare - Individual GPU status square component
 * Can be used standalone for legends or custom layouts.
 *
 * @example
 * ```tsx
 * <GPUSquare status="free" /> // Green square
 * <GPUSquare status="used" /> // Red square
 * ```
 */
export const GPUSquare: React.FC<GPUSquareProps> = ({
  status,
  size = "md",
  className = "",
}) => {
  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${status === "free" ? "bg-success" : "bg-error"}
        rounded
        ring-1
        ring-black/10
        shrink-0
        ${className}
      `}
    />
  );
};

/**
 * GPUStatusIndicator displays a labeled row of colored squares representing
 * individual GPU status for a single GPU type.
 *
 * Each square represents one physical GPU:
 * - Green (success) for free/available GPUs
 * - Red (error) for used/busy GPUs
 *
 * Uses e-infra design system semantic colors and rounded utility.
 * Responsive layout with flex-wrap for natural wrapping.
 *
 * @example
 * ```tsx
 * // 2 free, 4 total = 2 green squares + 2 red squares
 * <GPUStatusIndicator label="A100" free={2} total={4} />
 * ```
 */
export const GPUStatusIndicator: React.FC<GPUStatusIndicatorProps> = ({
  label,
  free,
  total,
  size = "md",
  gap = "md",
  className = "",
}) => {
  const used = total - free;

  // Build array of statuses: free GPUs first (green), then used (red)
  const gpuStatuses: GPUStatus[] = [
    ...Array.from({ length: free }, () => "free" as const),
    ...Array.from({ length: used }, () => "used" as const),
  ];

  return (
    <div
      className={`flex items-start gap-3 ${className}`}
      role="status"
      aria-label={`${label}: ${free} free, ${used} used`}
    >
      {/* Label and Stats - stacked vertically */}
      <div className="min-w-[4rem] shrink-0 basis-24 pt-1">
        <span className="text-base font-semibold text-text-heading block">
          {label}
        </span>
        <span className="text-xs text-text-muted block mt-0.5">
          {free} free / {total} total
        </span>
      </div>

      {/* GPU Squares - responsive flex-wrap */}
      <div className={`flex flex-wrap items-start ${gapClasses[gap]}`}>
        {gpuStatuses.map((status, index) => (
          <GPUSquare key={index} status={status} size={size} />
        ))}
      </div>
    </div>
  );
};

export default GPUStatusIndicator;
