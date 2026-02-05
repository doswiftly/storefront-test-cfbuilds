"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type {
  AttributeDefinition,
  AttributeRangeBounds,
} from "./attribute-filter";

export interface RangeSliderFilterProps {
  attribute: AttributeDefinition;
  bounds: AttributeRangeBounds;
  values: { min?: number; max?: number };
  onRangeChange: (range: { min?: number; max?: number }) => void;
  className?: string;
  /** Debounce delay in ms */
  debounceMs?: number;
}

/**
 * RangeSliderFilter - Numeric range filter with dual inputs
 *
 * Features:
 * - Min/max input fields
 * - Debounced value changes
 * - Currency symbol for CURRENCY type
 * - Visual range bar
 *
 * Requirements: R35.7, R35.14
 */
export function RangeSliderFilter({
  attribute,
  bounds,
  values,
  onRangeChange,
  className,
  debounceMs = 300,
}: RangeSliderFilterProps) {
  const [localMin, setLocalMin] = useState<string>(
    values.min?.toString() || ""
  );
  const [localMax, setLocalMax] = useState<string>(
    values.max?.toString() || ""
  );

  const isCurrency = attribute.type === "CURRENCY";
  const currencyCode = bounds.currencyCode || "PLN";

  // Update local state when props change
  useEffect(() => {
    setLocalMin(values.min?.toString() || "");
    setLocalMax(values.max?.toString() || "");
  }, [values.min, values.max]);

  // Debounced change handler
  const debouncedChange = useCallback(
    debounce((min: string, max: string) => {
      const minValue = min ? parseFloat(min) : undefined;
      const maxValue = max ? parseFloat(max) : undefined;
      onRangeChange({ min: minValue, max: maxValue });
    }, debounceMs),
    [onRangeChange, debounceMs]
  );

  const handleMinChange = (value: string) => {
    setLocalMin(value);
    debouncedChange(value, localMax);
  };

  const handleMaxChange = (value: string) => {
    setLocalMax(value);
    debouncedChange(localMin, value);
  };

  // Calculate visual progress
  const boundsMin = bounds.min ?? 0;
  const boundsMax = bounds.max ?? 1000;
  const boundsRange = boundsMax - boundsMin;
  const currentMin = values.min ?? boundsMin;
  const currentMax = values.max ?? boundsMax;
  const leftPercent = ((currentMin - boundsMin) / boundsRange) * 100;
  const rightPercent = ((currentMax - boundsMin) / boundsRange) * 100;

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-sm font-medium text-foreground">{attribute.name}</h4>

      {/* Visual range bar */}
      <div className="relative h-2 bg-muted rounded-full">
        <div
          className="absolute h-full bg-primary rounded-full"
          style={{
            left: `${leftPercent}%`,
            width: `${rightPercent - leftPercent}%`,
          }}
        />
      </div>

      {/* Min/Max inputs */}
      <div className="flex items-center gap-2">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-muted-foreground">Min</label>
          <div className="relative">
            {isCurrency && (
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {currencyCode}
              </span>
            )}
            <Input
              type="number"
              value={localMin}
              onChange={(e) => handleMinChange(e.target.value)}
              placeholder={boundsMin.toString()}
              min={boundsMin}
              max={boundsMax}
              className={cn(
                "h-8 text-sm",
                isCurrency && "pl-10"
              )}
            />
          </div>
        </div>

        <span className="text-muted-foreground mt-5">-</span>

        <div className="flex-1 space-y-1">
          <label className="text-xs text-muted-foreground">Max</label>
          <div className="relative">
            {isCurrency && (
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {currencyCode}
              </span>
            )}
            <Input
              type="number"
              value={localMax}
              onChange={(e) => handleMaxChange(e.target.value)}
              placeholder={boundsMax.toString()}
              min={boundsMin}
              max={boundsMax}
              className={cn(
                "h-8 text-sm",
                isCurrency && "pl-10"
              )}
            />
          </div>
        </div>
      </div>

      {/* Bounds info */}
      <p className="text-xs text-muted-foreground">
        Range: {formatValue(boundsMin, isCurrency, currencyCode)} -{" "}
        {formatValue(boundsMax, isCurrency, currencyCode)}
      </p>
    </div>
  );
}

/**
 * Format value for display
 */
function formatValue(
  value: number,
  isCurrency: boolean,
  currencyCode: string
): string {
  if (isCurrency) {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }
  return value.toString();
}

/**
 * Simple debounce function
 */
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

export default RangeSliderFilter;
