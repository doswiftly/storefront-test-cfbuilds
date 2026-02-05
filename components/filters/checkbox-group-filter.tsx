"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AttributeDefinition,
  AttributeFilterValue,
} from "./attribute-filter";

export interface CheckboxGroupFilterProps {
  attribute: AttributeDefinition;
  values: AttributeFilterValue[];
  selectedValues: string[];
  onValueChange: (values: string[]) => void;
  className?: string;
  /** Maximum items to show before "Show more" */
  maxVisible?: number;
}

/**
 * CheckboxGroupFilter - Multi-select checkbox list filter
 *
 * Features:
 * - Multi-select checkbox list
 * - Shows product count per option
 * - Collapsible with "Show more" for long lists
 * - Price modifier display
 *
 * Requirements: R35.4, R35.19
 */
export function CheckboxGroupFilter({
  attribute,
  values,
  selectedValues,
  onValueChange,
  className,
  maxVisible = 6,
}: CheckboxGroupFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onValueChange(selectedValues.filter((v) => v !== value));
    } else {
      onValueChange([...selectedValues, value]);
    }
  };

  const visibleValues = isExpanded ? values : values.slice(0, maxVisible);
  const hasMore = values.length > maxVisible;
  const hiddenCount = values.length - maxVisible;

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-medium text-foreground">{attribute.name}</h4>

      <div className="space-y-2">
        {visibleValues.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          const hasPriceModifier = option.priceModifier;

          return (
            <label
              key={option.id}
              className={cn(
                "flex items-center gap-3 cursor-pointer group",
                "py-1 px-2 -mx-2 rounded-md transition-colors",
                "hover:bg-muted/50"
              )}
            >
              {/* Custom checkbox */}
              <div
                className={cn(
                  "h-4 w-4 rounded border-2 flex items-center justify-center transition-colors",
                  isSelected
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/30 group-hover:border-muted-foreground/50"
                )}
              >
                {isSelected && (
                  <svg
                    className="h-3 w-3 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(option.value)}
                className="sr-only"
              />

              {/* Label and count */}
              <span className="flex-1 text-sm text-foreground">
                {option.label}
              </span>

              {/* Price modifier badge */}
              {hasPriceModifier && (
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    parseFloat(option.priceModifier!.amount) > 0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  )}
                >
                  {parseFloat(option.priceModifier!.amount) > 0 ? "+" : ""}
                  {option.priceModifier!.amount} {option.priceModifier!.currencyCode}
                </span>
              )}

              {/* Product count */}
              <span className="text-xs text-muted-foreground tabular-nums">
                ({option.productCount})
              </span>
            </label>
          );
        })}
      </div>

      {/* Show more/less toggle */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground",
            "transition-colors"
          )}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              Show {hiddenCount} more
            </>
          )}
        </button>
      )}

      {/* Selected count */}
      {selectedValues.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedValues.length} selected
        </p>
      )}
    </div>
  );
}

export default CheckboxGroupFilter;
