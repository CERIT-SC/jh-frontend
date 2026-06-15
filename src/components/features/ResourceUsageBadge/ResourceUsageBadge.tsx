import React from "react";
import { cn, Badge } from "@e-infra/design-system";

export interface ResourceUsageBadgeProps {
  /** Label */
  label: React.ReactNode;
  /** Usage ratio 0–1 for color threshold */
  ratio: number;
  /** Formatted display text */
  displayValue: string;
  /** Additional className */
  className?: string;
}

const formatBytes = (bytes: number): string => {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(0)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
};

const getBadgeColor = (ratio: number): string => {
  if (ratio >= 0.9)
    return "bg-error-100 text-error-800 dark:bg-error-900/40 dark:text-error-300";
  if (ratio >= 0.7)
    return "bg-warning-200 text-warning-800 dark:bg-warning-900/40 dark:text-warning-300";
  return "bg-info-200 text-info-800 dark:bg-info-900/40 dark:text-info-300";
};

/**
 * Helper to format CPU usage for display
 */
export const formatCpuDisplay = (cpuUsageRatio: number): string =>
  `${(cpuUsageRatio * 100).toFixed(1)}%`;

/**
 * Helper to format memory usage for display
 */
export const formatMemoryDisplay = (
  usedBytes: number,
  limitBytes: number,
): string => `${formatBytes(usedBytes)} / ${formatBytes(limitBytes)}`;

/**
 * ResourceUsageBadge
 */
export const ResourceUsageBadge: React.FC<ResourceUsageBadgeProps> = ({
  label,
  ratio,
  displayValue,
  className,
}) => {
  return (
    <Badge className={cn(getBadgeColor(ratio), className)}>
      {label} {displayValue}
    </Badge>
  );
};
