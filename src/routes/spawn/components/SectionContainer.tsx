/**
 * @fileoverview Collapsible sub-section container used inside StepPanel.
 *
 * Extracted from StorageSection.tsx so ResourceSection can reuse the same
 * lightweight "sub-panel inside the outer Panel" pattern. Compound component
 * API: `<SectionContainer.Header>` + `<SectionContainer.Content>`.
 *
 * Differences vs. design-system `Panel`:
 * - No outer border (uses `ring shadow-sm` instead), avoiding the double
 *   chrome that appears when a Panel is nested inside StepPanel's Panel.
 * - `Header` supports an `action` slot (e.g. a refresh button) and a
 *   `showToggle` switch; both are optional and mutually exclusive in
 *   practice.
 */

import {
  createContext,
  useContext,
  type ReactNode,
  type ReactElement,
} from "react";
import { Switch } from "@e-infra/design-system";
import { cn } from "@utils";

// ==============================================================================
// Context
// ==============================================================================

interface SectionContainerContextValue {
  enabled: boolean;
  onToggle?: (enabled: boolean) => void;
}

const SectionContainerContext = createContext<SectionContainerContextValue>({
  enabled: true,
});

// ==============================================================================
// Props
// ==============================================================================

interface SectionContainerProps {
  children?: ReactNode;
  className?: string;
  /** Whether the section is enabled (content visible). Defaults to `true`. */
  enabled?: boolean;
  /** Callback when the toggle switch is clicked. */
  onToggle?: (enabled: boolean) => void;
  /** DOM id for the section element. */
  id?: string;
}

interface SectionHeaderProps {
  children?: ReactNode;
  /** Optional leading icon. */
  icon?: ReactNode;
  className?: string;
  /** Whether to render the enable/disable switch on the right. */
  showToggle?: boolean;
  /** Optional right-side action (e.g. a refresh button). Use instead of `showToggle`. */
  action?: ReactNode;
}

interface SectionContentProps {
  children?: ReactNode;
  className?: string;
}

// ==============================================================================
// Sub-components
// ==============================================================================

/**
 * Header row: icon + title/description children, optional toggle or action.
 * Clicking the header toggles when `showToggle` is set.
 */
function SectionHeader({
  children,
  icon,
  className,
  showToggle = false,
  action,
}: SectionHeaderProps): ReactElement {
  const { enabled, onToggle } = useContext(SectionContainerContext);

  const handleToggle = (checked: boolean) => {
    if (onToggle) {
      onToggle(checked);
    }
  };

  return (
    <div
      className={cn("flex items-start gap-3 p-4", className)}
      onClick={() => showToggle && handleToggle(!enabled)}
    >
      {icon && (
        <span
          className={cn(
            "shrink-0 mt-0.5 transition-colors",
            enabled ? "text-text" : "text-muted-foreground opacity-60",
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <div className={cn("flex-1", !enabled && "opacity-60")}>{children}</div>
      {showToggle && (
        <Switch
          checked={enabled}
          className="scale-120 data-[state=unchecked]:bg-surface-raised dark:data-[state=unchecked]:bg-secondary"
        />
      )}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * Content area. Collapses (renders `null`) when the section is disabled.
 */
function SectionContent({
  children,
  className,
}: SectionContentProps): ReactElement | null {
  const { enabled } = useContext(SectionContainerContext);

  if (!enabled) {
    return null;
  }

  return (
    <div
      className={cn(
        "p-4 rounded-b-lg border-t border-border bg-secondary-200 dark:bg-surface",
        "animate-[slideInFade_300ms_ease-out]",
        "px-12",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ==============================================================================
// SectionContainer (compound root)
// ==============================================================================

/**
 * Collapsible section container with header and content areas.
 *
 * @example
 * ```tsx
 * <SectionContainer enabled={storageEnabled} onToggle={setStorageEnabled} id="storage-section">
 *   <SectionContainer.Header icon={<Server />} showToggle>
 *     <H3>Storage</H3>
 *     <P>Description</P>
 *   </SectionContainer.Header>
 *   <SectionContainer.Content>
 *     {/* Form content *\/}
 *   </SectionContainer.Content>
 * </SectionContainer>
 * ```
 */
function SectionContainer({
  children,
  className,
  enabled = true,
  onToggle,
  id,
}: SectionContainerProps): ReactElement {
  return (
    <SectionContainerContext.Provider value={{ enabled, onToggle }}>
      <section
        id={id}
        className={cn(
          "rounded-lg ring shadow-sm bg-background transition-all duration-300",
          enabled ? "" : "ring-border",
          className,
        )}
      >
        {children}
      </section>
    </SectionContainerContext.Provider>
  );
}

SectionContainer.Header = SectionHeader;
SectionContainer.Content = SectionContent;

export default SectionContainer;
