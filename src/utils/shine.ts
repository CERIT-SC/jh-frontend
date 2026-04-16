/**
 * Triggers a shine border animation on an element by its ID.
 * Uses CSS animation that only pulses the ring (box-shadow), not content.
 *
 * @param elementId - The ID of the DOM element to shine
 * @param options - Configuration options for the shine effect
 *
 * @example
 * ```tsx
 * triggerShineById("resources-section");
 * ```
 */
export interface TriggerShineOptions {
  /** Duration of the shine animation in milliseconds (default: 1500) */
  duration?: number;
  /** Color of the shine effect - CSS color value (default: "var(--primary)") */
  color?: string;
  /** Delay before starting shine, useful after scroll (default: 0) */
  delay?: number;
}

export function triggerShineById(
  elementId: string,
  options: TriggerShineOptions = {},
): void {
  const { duration = 1500, color = "var(--primary)", delay = 0 } = options;

  const executeShine = (): void => {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(
        `[triggerShineById] Element with id "${elementId}" not found`,
      );
      return;
    }

    // Set color via CSS variable and add shine class
    element.style.setProperty("--shine-color", color);
    element.classList.add("shine-ring");

    // Remove after duration
    setTimeout(() => {
      element.classList.remove("shine-ring");
      element.style.removeProperty("--shine-color");
    }, duration);
  };

  if (delay > 0) {
    setTimeout(executeShine, delay);
  } else {
    executeShine();
  }
}

/**
 * Triggers shine on multiple elements sequentially.
 *
 * @example
 * ```tsx
 * triggerShineMultiple(["image-section", "resources-section", "storage-section"]);
 * ```
 */
export function triggerShineMultiple(
  elementIds: string[],
  options: TriggerShineOptions = {},
  staggerDelay: number = 200,
): void {
  elementIds.forEach((id, index) => {
    triggerShineById(id, {
      ...options,
      delay: (options.delay ?? 0) + index * staggerDelay,
    });
  });
}
