import React, { useState, useEffect, useRef, useId } from "react";
import { P } from "@e-infra/design-system";

// ==============================================================================
// Type Definitions
// ==============================================================================

interface BaseTileSelectorProps {
  selectionText?: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

interface NumericTileSelectorProps extends BaseTileSelectorProps {
  options: number[];
  value?: number;
  defaultValue?: number;
  onChange: (value: number) => void;
  renderOptionLabel?: (value: number) => React.ReactNode;
}

interface StringTileSelectorProps extends BaseTileSelectorProps {
  options: Array<{ value: string; label: string; description?: string }>;
  value?: string;
  defaultValue?: string;
  onChange: (value: string) => void;
}

type TileSelectorProps = NumericTileSelectorProps | StringTileSelectorProps;

// ==============================================================================
// Helper Functions
// ==============================================================================

function isNumericProps(
  props: TileSelectorProps,
): props is NumericTileSelectorProps {
  return (
    Array.isArray(props.options) &&
    props.options.length > 0 &&
    typeof props.options[0] === "number"
  );
}

function isStringProps(
  props: TileSelectorProps,
): props is StringTileSelectorProps {
  return (
    Array.isArray(props.options) &&
    props.options.length > 0 &&
    typeof props.options[0] === "object" &&
    props.options[0] !== null &&
    "value" in props.options[0]
  );
}

// ==============================================================================
// Main Component
// ==============================================================================

export const TileSelector: React.FC<TileSelectorProps> = (props) => {
  const { selectionText, className, disabled = false, ariaLabel } = props;
  const groupName = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<(HTMLLabelElement | null)[]>([]);

  // Determine mode and get options
  const numericMode = isNumericProps(props);
  const stringMode = isStringProps(props);

  // Get options array for rendering
  const renderOptions: Array<{
    key: string | number;
    label: React.ReactNode;
    value: string | number;
  }> = React.useMemo(() => {
    if (numericMode) {
      const numericProps = props as NumericTileSelectorProps;
      return numericProps.options.map((value) => ({
        key: value,
        label: numericProps.renderOptionLabel
          ? numericProps.renderOptionLabel(value)
          : value,
        value,
      }));
    }
    if (stringMode) {
      const stringProps = props as StringTileSelectorProps;
      return stringProps.options.map((option) => ({
        key: option.value,
        label: option.label,
        value: option.value,
      }));
    }
    return [];
  }, [props, numericMode, stringMode]);

  // Selected state
  const [selectedValue, setSelectedValue] = useState<string | number>(() => {
    if (numericMode) {
      const numericProps = props as NumericTileSelectorProps;
      return (
        numericProps.value ??
        numericProps.defaultValue ??
        numericProps.options[0]
      );
    }
    if (stringMode) {
      const stringProps = props as StringTileSelectorProps;
      return (
        stringProps.value ??
        stringProps.defaultValue ??
        stringProps.options[0]?.value
      );
    }
    return "";
  });

  // Sync with controlled value
  useEffect(() => {
    if (props.value !== undefined) {
      setSelectedValue(props.value);
    }
  }, [props.value]);

  // Highlight animation style
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const selectedIdx = renderOptions.findIndex(
      (opt) => opt.value === selectedValue,
    );
    const selectedLabel = labelsRef.current[selectedIdx];
    if (selectedLabel && containerRef.current) {
      const rect = selectedLabel.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      setHighlightStyle({
        left: rect.left - containerRect.left,
        width: rect.width,
      });
    }
  }, [selectedValue, renderOptions]);

  const handleSelection = (value: string | number): void => {
    if (disabled) return;

    setSelectedValue(value);

    if (numericMode && typeof value === "number") {
      (props as NumericTileSelectorProps).onChange(value);
    } else if (stringMode && typeof value === "string") {
      (props as StringTileSelectorProps).onChange(value);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, currentIndex: number) => {
    if (disabled) return;

    let nextIndex: number | null = null;

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        nextIndex =
          currentIndex > 0 ? currentIndex - 1 : renderOptions.length - 1;
        break;
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        nextIndex =
          currentIndex < renderOptions.length - 1 ? currentIndex + 1 : 0;
        break;
      case "Home":
        event.preventDefault();
        nextIndex = 0;
        break;
      case "End":
        event.preventDefault();
        nextIndex = renderOptions.length - 1;
        break;
    }

    if (nextIndex !== null) {
      handleSelection(renderOptions[nextIndex].value);
      labelsRef.current[nextIndex]?.focus();
    }
  };

  return (
    <div>
      {selectionText ? <P className="m-0 mb-2">{selectionText}</P> : null}
      <div
        role="radiogroup"
        aria-label={ariaLabel || selectionText || "Tile selector"}
        className={`bg-surface-raised text-muted rounded-lg shadow-md text-left ${
          className || "w-full h-12"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex flex-col items-start text-black p-1 rounded-lg bg-muted h-full">
          <div
            ref={containerRef}
            className="flex flex-nowrap gap-0 w-full h-full relative"
          >
            {/* Animated highlight background */}
            <div
              className="absolute top-0 h-full bg-surface rounded-lg transition-all duration-300 ease-out"
              style={{
                left: `${highlightStyle.left}px`,
                width: `${highlightStyle.width}px`,
                transitionTimingFunction: "cubic-bezier(0.65, 0.05, 0.36, 1)",
              }}
              aria-hidden="true"
            />

            {renderOptions.map((option, index) => {
              const isSelected = selectedValue === option.value;

              return (
                <label
                  key={option.key}
                  ref={(el) => {
                    labelsRef.current[index] = el;
                  }}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={disabled ? -1 : isSelected ? 0 : -1}
                  className={`flex-1 h-full text-center relative cursor-pointer px-3 bg-transparent border-none select-none group z-10 flex items-center justify-center ${
                    disabled ? "cursor-not-allowed" : ""
                  }`}
                  onClick={() => handleSelection(option.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                >
                  <input
                    type="radio"
                    name={groupName}
                    value={option.value}
                    checked={isSelected}
                    onChange={() => handleSelection(option.value)}
                    disabled={disabled}
                    className="hidden"
                  />
                  <span
                    className={`relative z-10 block transition-all duration-300 ${
                      isSelected
                        ? "text-primary font-bold"
                        : "text-gray-600 group-hover:text-primary"
                    }`}
                  >
                    {option.label}
                  </span>

                  {isSelected && (
                    <span
                      className="absolute bottom-0 left-0 h-1 animate-in duration-300"
                      style={{
                        width: "100%",
                        animation:
                          "slideInRight 0.5s cubic-bezier(0.65, 0.05, 0.36, 1) forwards",
                      }}
                      aria-hidden="true"
                    />
                  )}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// Convenience Wrapper for String Options
// ==============================================================================

interface StringTileSelectorWrapperProps {
  selectionText?: string;
  options: Array<{ value: string; label: string; description?: string }>;
  value?: string;
  defaultValue?: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

/**
 * Convenience wrapper for string-based tile selection.
 * Provides a cleaner API when working with categorical options.
 */
export const StringTileSelector: React.FC<StringTileSelectorWrapperProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  ...rest
}) => {
  return (
    <TileSelector
      options={options}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      {...rest}
    />
  );
};

export default TileSelector;
