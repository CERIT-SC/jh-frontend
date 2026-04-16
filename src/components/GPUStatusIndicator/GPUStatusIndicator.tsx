import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@e-infra/design-system";

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
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`flex items-start gap-3 cursor-pointer ${className}`}
          tabIndex={0}
          role="status"
          aria-label={`${label}: ${free} free, ${used} used`}
        >
          {/* GPU Type Label */}
          <span className="text-base font-semibold text-text-heading min-w-[4rem] pt-1 shrink-0 basis-24">
            {label}
          </span>

          {/* GPU Squares - responsive flex-wrap */}
          <div className={`flex flex-wrap items-start ${gapClasses[gap]}`}>
            {gpuStatuses.map((status, index) => (
              <GPUSquare key={index} status={status} size={size} />
            ))}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{label}</span>
          <span>
            {free} free / {total} total
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default GPUStatusIndicator;
