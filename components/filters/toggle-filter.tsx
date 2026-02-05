"use client";

import { cn } from "@/lib/utils";
import type {
  AttributeDefinition,
  AttributeFilterValue,
} from "./attribute-filter";

export interface ToggleFilterProps {
  attribute: AttributeDefinition;
  values: AttributeFilterValue[];
  selectedValues: string[];
  onValueChange: (values: string[]) => void;
  className?: string;
}

/**
 * ToggleFilter - Single checkbox toggle for BOOLEAN attributes
 *
 * Features:
 * - Single toggle switch/checkbox
 * - Shows label and product count
 * - Typically used for "In Stock", "On Sale", etc.
 *
 * Requirements: R35.6
 */
export function ToggleFilter({
  attribute,
  values,
  selectedValues,
  onValueChange,
  className,
}: ToggleFilterProps) {
  // For BOOLEAN attributes, we typically have one or two values: "true" or both "true"/"false"
  const trueOption = values.find(
    (v) => v.value === "true" || v.value === "1" || v.value === "yes"
  );

  if (!trueOption) {
    // Fallback: use first option
    const firstOption = values[0];
    if (!firstOption) return null;

    const isSelected = selectedValues.includes(firstOption.value);

    const handleToggle = () => {
      if (isSelected) {
        onValueChange([]);
      } else {
        onValueChange([firstOption.value]);
      }
    };

    return (
      <div className={cn("space-y-2", className)}>
        <label className="flex items-center gap-3 cursor-pointer group">
          {/* Toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isSelected}
            onClick={handleToggle}
            className={cn(
              "relative h-5 w-9 rounded-full transition-colors",
              isSelected ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                isSelected && "translate-x-4"
              )}
            />
          </button>

          {/* Label */}
          <span className="text-sm text-foreground">{attribute.name}</span>

          {/* Product count */}
          <span className="text-xs text-muted-foreground tabular-nums">
            ({firstOption.productCount})
          </span>
        </label>
      </div>
    );
  }

  const isSelected = selectedValues.includes(trueOption.value);

  const handleToggle = () => {
    if (isSelected) {
      onValueChange([]);
    } else {
      onValueChange([trueOption.value]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="flex items-center gap-3 cursor-pointer group">
        {/* Toggle switch */}
        <button
          type="button"
          role="switch"
          aria-checked={isSelected}
          onClick={handleToggle}
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors",
            isSelected ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
              isSelected && "translate-x-4"
            )}
          />
        </button>

        {/* Label */}
        <span className="text-sm text-foreground">{attribute.name}</span>

        {/* Product count */}
        <span className="text-xs text-muted-foreground tabular-nums">
          ({trueOption.productCount})
        </span>
      </label>
    </div>
  );
}

export default ToggleFilter;
