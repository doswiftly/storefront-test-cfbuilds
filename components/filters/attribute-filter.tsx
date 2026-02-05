"use client";

import { cn } from "@/lib/utils";
import { ColorSwatchFilter } from "./color-swatch-filter";
import { CheckboxGroupFilter } from "./checkbox-group-filter";
import { RangeSliderFilter } from "./range-slider-filter";
import { ToggleFilter } from "./toggle-filter";

/**
 * Types matching GraphQL schema
 */
export type AttributeType =
  | "TEXT"
  | "TEXTAREA"
  | "SELECT"
  | "CHECKBOX"
  | "RADIO"
  | "IMAGE"
  | "FILE"
  | "NUMBER"
  | "CURRENCY"
  | "DATE"
  | "BOOLEAN"
  | "COLOR";

export interface AttributeSwatch {
  colorHex?: string;
  imageUrl?: string;
}

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface AttributeFilterValue {
  id: string;
  value: string;
  label: string;
  productCount: number;
  swatch?: AttributeSwatch;
  priceModifier?: Money;
  sortOrder: number;
}

export interface AttributeRangeBounds {
  min?: number;
  max?: number;
  currencyCode?: string;
}

export interface AttributeDefinition {
  id: string;
  name: string;
  handle: string;
  type: AttributeType;
  isFilterable: boolean;
  isVisible: boolean;
  displayOrder: number;
  filterValues?: AttributeFilterValue[];
  rangeBounds?: AttributeRangeBounds;
}

export interface AttributeFilterProps {
  attribute: AttributeDefinition;
  selectedValues: string[];
  rangeValues?: { min?: number; max?: number };
  onValueChange: (values: string[]) => void;
  onRangeChange?: (range: { min?: number; max?: number }) => void;
  className?: string;
}

/**
 * AttributeFilter - Component switcher for different attribute types
 *
 * Renders the appropriate filter UI based on attribute type:
 * - COLOR -> ColorSwatchFilter
 * - SELECT, RADIO, CHECKBOX -> CheckboxGroupFilter
 * - BOOLEAN -> ToggleFilter
 * - NUMBER, CURRENCY -> RangeSliderFilter
 *
 * Requirements: R35.4, R35.5, R35.6, R35.7, R35.8
 */
export function AttributeFilter({
  attribute,
  selectedValues,
  rangeValues,
  onValueChange,
  onRangeChange,
  className,
}: AttributeFilterProps) {
  const { type, filterValues, rangeBounds } = attribute;

  // COLOR type: render swatch filter
  if (type === "COLOR" && filterValues) {
    return (
      <ColorSwatchFilter
        attribute={attribute}
        values={filterValues}
        selectedValues={selectedValues}
        onValueChange={onValueChange}
        className={className}
      />
    );
  }

  // BOOLEAN type: render toggle filter
  if (type === "BOOLEAN" && filterValues) {
    return (
      <ToggleFilter
        attribute={attribute}
        values={filterValues}
        selectedValues={selectedValues}
        onValueChange={onValueChange}
        className={className}
      />
    );
  }

  // NUMBER, CURRENCY types: render range slider
  if ((type === "NUMBER" || type === "CURRENCY") && rangeBounds && onRangeChange) {
    return (
      <RangeSliderFilter
        attribute={attribute}
        bounds={rangeBounds}
        values={rangeValues || {}}
        onRangeChange={onRangeChange}
        className={className}
      />
    );
  }

  // SELECT, RADIO, CHECKBOX types: render checkbox group
  if (
    (type === "SELECT" || type === "RADIO" || type === "CHECKBOX") &&
    filterValues
  ) {
    return (
      <CheckboxGroupFilter
        attribute={attribute}
        values={filterValues}
        selectedValues={selectedValues}
        onValueChange={onValueChange}
        className={className}
      />
    );
  }

  // TEXT, TEXTAREA, etc: not typically used for filtering
  return null;
}

export default AttributeFilter;
