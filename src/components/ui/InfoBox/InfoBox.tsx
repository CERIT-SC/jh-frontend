import React, { useCallback, useEffect, useRef, useState, useId } from "react";
import { Info } from "lucide-react";
import { cn } from "@e-infra/design-system";
import "./InfoBox.css";

/* ──────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────── */

/** Position of the InfoBox content panel relative to the trigger. */
export type InfoBoxPosition = "top" | "bottom" | "left" | "right";

/** Alignment of the content panel along its cross-axis. */
export type InfoBoxAlign = "start" | "center" | "end";

/** Action link rendered inside the InfoBox content area. */
export interface InfoBoxAction {
  /** Visible label for the link. */
  label: string;
  /** URL the link navigates to. */
  href: string;
  /** Opens the link in a new tab/window when true. */
  external?: boolean;
  /** Optional click handler (runs before navigation). */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

/** Props for the InfoBox component. */
export interface InfoBoxProps {
  /** Content displayed inside the InfoBox panel. Supports arbitrary React nodes. */
  children: React.ReactNode;

  /** Custom trigger icon element. Defaults to a Lucide `Info` icon. */
  triggerIcon?: React.ReactNode;

  /** Accessible label for the trigger button. Defaults to "More information". */
  triggerAriaLabel?: string;

  /** Position of the content panel relative to the trigger icon. @default "top" */
  position?: InfoBoxPosition;

  /** Alignment of the content panel along the cross-axis. @default "center" */
  align?: InfoBoxAlign;

  /** Maximum width of the content panel. Accepts a CSS value string or numeric pixels. @default 320 */
  maxWidth?: number | string;

  /** Duration of enter/exit animations in milliseconds. @default 200 */
  animationDuration?: number;

  /** Grace period in ms before closing after the cursor leaves both trigger and content. @default 150 */
  closeDelay?: number;

  /** Accessible label for the content panel itself. */
  "aria-label"?: string;

  /** ID of an element that labels the content panel (alternative to aria-label). */
  "aria-labelledby"?: string;

  /** Additional CSS classes applied to the outermost wrapper. */
  className?: string;

  /** Additional CSS classes applied to the content panel. */
  contentClassName?: string;

  /** Disables the InfoBox interaction entirely when true. @default false */
  disabled?: boolean;
}

/* ──────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────── */

const POSITION_CLASSES: Record<InfoBoxPosition, string> = {
  top: "info-box--top",
  bottom: "info-box--bottom",
  left: "info-box--left",
  right: "info-box--right",
};

const ALIGN_CLASSES: Record<InfoBoxAlign, string> = {
  start: "info-box--align-start",
  center: "info-box--align-center",
  end: "info-box--align-end",
};

function resolveMaxWidth(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

/* ──────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────── */

/**
 * InfoBox — A tooltip/popover hybrid that displays contextual information
 * triggered by an icon. The content panel stays visible while the cursor
 * hovers over either the trigger icon or the panel itself, and smoothly
 * animates out when the cursor leaves both.
 *
 * @example
 * ```tsx
 * <InfoBox position="top">
 *   <p>Select the Docker image for your notebook server.</p>
 *   <a href="/docs/images">See available images →</a>
 * </InfoBox>
 * ```
 */
export const InfoBox: React.FC<InfoBoxProps> = ({
  children,
  triggerIcon,
  triggerAriaLabel = "More information",
  position = "top",
  align = "center",
  maxWidth = 320,
  animationDuration = 200,
  closeDelay = 150,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  className,
  contentClassName,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const generatedId = useId();
  const contentId = ariaLabelledby ?? `infobox-content-${generatedId}`;

  /* ── Visibility helpers ─────────────────────── */

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    if (disabled) return;
    clearCloseTimer();
    setIsAnimatingOut(false);
    setIsVisible(true);
  }, [disabled, clearCloseTimer]);

  const hide = useCallback(() => {
    setIsAnimatingOut(true);
    // Wait for exit animation to complete before unmounting
    closeTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsAnimatingOut(false);
    }, animationDuration);
  }, [animationDuration]);

  const scheduleHide = useCallback(() => {
    if (disabled) return;
    clearCloseTimer();
    closeTimerRef.current = setTimeout(hide, closeDelay);
  }, [disabled, clearCloseTimer, hide, closeDelay]);

  /* ── Hover handlers ─────────────────────────── */

  const handleTriggerEnter = useCallback(() => {
    show();
  }, [show]);

  const handleTriggerLeave = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  const handleContentEnter = useCallback(() => {
    clearCloseTimer();
  }, [clearCloseTimer]);

  const handleContentLeave = useCallback(() => {
    scheduleHide();
  }, [scheduleHide]);

  /* ── Keyboard handlers ──────────────────────── */

  const handleTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (isVisible && !isAnimatingOut) {
          hide();
        } else {
          show();
        }
      }
      if (event.key === "Escape" && isVisible) {
        event.preventDefault();
        hide();
      }
    },
    [isVisible, isAnimatingOut, hide, show],
  );

  const handleContentKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape" && isVisible) {
        event.preventDefault();
        hide();
        // Return focus to the trigger
        triggerRef.current?.focus();
      }
    },
    [isVisible, hide],
  );

  /* ── Focus management ───────────────────────── */

  const handleTriggerBlur = useCallback(
    (event: React.FocusEvent<HTMLButtonElement>) => {
      // Don't close if focus moves into the content panel
      if (
        contentRef.current &&
        contentRef.current.contains(event.relatedTarget as Node)
      ) {
        return;
      }
      scheduleHide();
    },
    [scheduleHide],
  );

  const handleContentBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      // Don't close if focus moves back to the trigger
      if (
        triggerRef.current &&
        triggerRef.current.contains(event.relatedTarget as Node)
      ) {
        return;
      }
      // Don't close if focus stays within the content panel
      if (
        contentRef.current &&
        contentRef.current.contains(event.relatedTarget as Node)
      ) {
        return;
      }
      scheduleHide();
    },
    [scheduleHide],
  );

  /* ── Cleanup on unmount ─────────────────────── */

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, [clearCloseTimer]);

  /* ── Click outside to close ─────────────────── */

  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        hide();
      }
    };

    // Delay listener to avoid the opening click
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, hide]);

  /* ── Render ─────────────────────────────────── */

  const resolvedMaxWidth = resolveMaxWidth(maxWidth);

  return (
    <div
      className={cn("info-box-wrapper inline-flex items-center", className)}
      onMouseEnter={handleTriggerEnter}
      onMouseLeave={handleTriggerLeave}
    >
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          "info-box-trigger inline-flex items-center justify-center",
          "h-5 w-5 rounded-full",
          "text-text-muted hover:text-primary",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1",
          disabled && "opacity-40 pointer-events-none cursor-default",
        )}
        aria-expanded={isVisible && !isAnimatingOut}
        aria-haspopup="dialog"
        aria-label={triggerAriaLabel}
        onKeyDown={handleTriggerKeyDown}
        onBlur={handleTriggerBlur}
        disabled={disabled}
        tabIndex={disabled ? -1 : 0}
      >
        {triggerIcon ?? <Info className="h-4 w-4" />}
      </button>

      {/* Content Panel */}
      {isVisible && (
        <div
          ref={contentRef}
          id={contentId}
          role="dialog"
          aria-modal="false"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          className={cn(
            "info-box-content",
            POSITION_CLASSES[position],
            ALIGN_CLASSES[align],
            isAnimatingOut ? "info-box-exit" : "info-box-enter",
            "z-50",
            "rounded-lg border border-border",
            "bg-surface-raised text-text",
            "shadow-lg shadow-black/10",
            "overflow-hidden",
            contentClassName,
          )}
          style={
            {
              maxWidth: resolvedMaxWidth,
              "--info-box-duration": `${animationDuration}ms`,
            } as React.CSSProperties
          }
          onMouseEnter={handleContentEnter}
          onMouseLeave={handleContentLeave}
          onKeyDown={handleContentKeyDown}
          onBlur={handleContentBlur}
        >
          <div className="px-4 py-3 text-sm leading-relaxed">{children}</div>
        </div>
      )}
    </div>
  );
};

InfoBox.displayName = "InfoBox";

export default InfoBox;
