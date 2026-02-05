"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AttributeDefinition,
  AttributeFilterValue,
} from "./attribute-filter";

export interface ColorSwatchFilterProps {
  attribute: AttributeDefinition;
  values: AttributeFilterValue[];
  selectedValues: string[];
  onValueChange: (values: string[]) => void;
  className?: string;
}

/**
 * ColorSwatchFilter - Color swatch selection filter
 *
 * Features:
 * - Displays color circles with hex colors
 * - Supports pattern swatches (imageUrl)
 * - Multi-select toggle on click
 * - Shows product count on hover
 * - Highlights selected with ring/checkmark
 *
 * Requirements: R35.5, R35.17, R35.19
 */
export function ColorSwatchFilter({
  attribute,
  values,
  selectedValues,
  onValueChange,
  className,
}: ColorSwatchFilterProps) {
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onValueChange(selectedValues.filter((v) => v !== value));
    } else {
      onValueChange([...selectedValues, value]);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-medium text-foreground">{attribute.name}</h4>

      <div className="flex flex-wrap gap-2">
        {values.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          const isHovered = hoveredValue === option.value;
          const hasColor = option.swatch?.colorHex;
          const hasPattern = option.swatch?.imageUrl;

          return (
            <div key={option.id} className="relative">
              <button
                type="button"
                onClick={() => handleToggle(option.value)}
                onMouseEnter={() => setHoveredValue(option.value)}
                onMouseLeave={() => setHoveredValue(null)}
                className={cn(
                  "relative h-8 w-8 rounded-full border-2 transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  isSelected
                    ? "border-primary ring-2 ring-primary ring-offset-1"
                    : "border-border hover:border-primary/50"
                )}
                style={{
                  backgroundColor: hasColor ? option.swatch?.colorHex : undefined,
                  backgroundImage: hasPattern
                    ? `url(${option.swatch?.imageUrl})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                title={`${option.label} (${option.productCount})`}
                aria-label={`${option.label} - ${option.productCount} products`}
                aria-pressed={isSelected}
              >
                {/* Checkmark for selected */}
                {isSelected && (
                  <span
                    className={cn(
                      "absolute inset-0 flex items-center justify-center",
                      "rounded-full",
                      hasColor && isLightColor(option.swatch?.colorHex)
                        ? "text-foreground"
                        : "text-white"
                    )}
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                )}

                {/* White/light color indicator */}
                {hasColor &&
                  isWhiteOrNearWhite(option.swatch?.colorHex) && (
                    <span className="absolute inset-[2px] rounded-full border border-muted-foreground/20" />
                  )}
              </button>

              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10">
                  <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-muted-foreground">
                      {option.productCount} products
                    </div>
                    {/* Price modifier badge - Requirements: R35.15, R35.16 */}
                    {option.priceModifier && (
                      <div
                        className={cn(
                          "mt-1 text-xs font-medium",
                          parseFloat(option.priceModifier.amount) > 0
                            ? "text-amber-600"
                            : "text-green-600"
                        )}
                      >
                        {parseFloat(option.priceModifier.amount) > 0 ? "+" : ""}
                        {option.priceModifier.amount} {option.priceModifier.currencyCode}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected count */}
      {selectedValues.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedValues.length} selected
        </p>
      )}
    </div>
  );
}

/**
 * Check if a color is light (for contrast)
 */
function isLightColor(hex?: string): boolean {
  if (!hex) return false;
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

/**
 * Check if color is white or very light (needs border)
 */
function isWhiteOrNearWhite(hex?: string): boolean {
  if (!hex) return false;
  const cleanHex = hex.replace("#", "").toLowerCase();
  // Check for white and very light colors
  return (
    cleanHex === "ffffff" ||
    cleanHex === "fff" ||
    cleanHex === "fafafa" ||
    cleanHex === "f5f5f5" ||
    cleanHex === "f0f0f0"
  );
}

export default ColorSwatchFilter;
