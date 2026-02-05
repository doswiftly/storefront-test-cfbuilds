"use client";

import { useState, useCallback } from "react";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AttributeFilter } from "./attribute-filter";
import type { AttributeDefinition } from "./attribute-filter";
import { Spinner } from "@/components/ui/spinner";

/**
 * Price range for filtering
 */
export interface PriceRange {
  min: { amount: string; currencyCode: string };
  max: { amount: string; currencyCode: string };
}

/**
 * Category filter option
 */
export interface CategoryFilterOption {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  level: number;
  parentId?: string;
}

/**
 * Complete filter state
 */
export interface AvailableFilters {
  attributes: AttributeDefinition[];
  priceRange?: PriceRange;
  categories?: CategoryFilterOption[];
  activeFilterCount: number;
  totalProducts: number;
}

/**
 * Applied filter values
 */
export interface AppliedFilters {
  attributes: Record<string, string[]>;
  ranges: Record<string, { min?: number; max?: number }>;
  price?: { min?: number; max?: number };
  categoryId?: string;
}

export interface DynamicAttributeFiltersProps {
  filters?: AvailableFilters;
  appliedFilters: AppliedFilters;
  onAttributeChange: (attributeId: string, values: string[]) => void;
  onRangeChange: (attributeId: string, range: { min?: number; max?: number }) => void;
  onPriceChange?: (range: { min?: number; max?: number }) => void;
  onClearAll: () => void;
  isLoading?: boolean;
  className?: string;
  /** Whether to show in a collapsible panel (mobile) */
  collapsible?: boolean;
}

/**
 * DynamicAttributeFilters - Wrapper component for all attribute filters
 *
 * Features:
 * - Fetches and displays available filters
 * - Handles loading and empty states
 * - Manages applied filters state
 * - Clear all filters button
 * - Collapsible on mobile
 *
 * Requirements: R35.1, R35.2, R35.3
 */
export function DynamicAttributeFilters({
  filters,
  appliedFilters,
  onAttributeChange,
  onRangeChange,
  onPriceChange,
  onClearAll,
  isLoading,
  className,
  collapsible = false,
}: DynamicAttributeFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  // Calculate active filter count
  const activeCount =
    Object.values(appliedFilters.attributes).filter((v) => v.length > 0).length +
    Object.values(appliedFilters.ranges).filter((r) => r.min !== undefined || r.max !== undefined).length +
    (appliedFilters.price?.min || appliedFilters.price?.max ? 1 : 0) +
    (appliedFilters.categoryId ? 1 : 0);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("p-4", className)}>
        <div className="flex items-center gap-2">
          <Spinner className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">Loading filters...</span>
        </div>
      </div>
    );
  }

  // No filters available
  if (!filters || filters.attributes.length === 0) {
    return null;
  }

  const header = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-foreground">Filters</h3>
        {activeCount > 0 && (
          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs">
            {activeCount}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}

        {collapsible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );

  const filterContent = (
    <div className="space-y-6 mt-4">
      {/* Price filter */}
      {filters.priceRange && onPriceChange && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Price</h4>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder={`Min (${filters.priceRange.min.currencyCode})`}
              value={appliedFilters.price?.min || ""}
              onChange={(e) =>
                onPriceChange({
                  ...appliedFilters.price,
                  min: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="flex-1 h-8 px-2 text-sm border rounded-md"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="number"
              placeholder={`Max (${filters.priceRange.max.currencyCode})`}
              value={appliedFilters.price?.max || ""}
              onChange={(e) =>
                onPriceChange({
                  ...appliedFilters.price,
                  max: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="flex-1 h-8 px-2 text-sm border rounded-md"
            />
          </div>
        </div>
      )}

      {/* Attribute filters */}
      {filters.attributes.map((attribute) => (
        <AttributeFilter
          key={attribute.id}
          attribute={attribute}
          selectedValues={appliedFilters.attributes[attribute.id] || []}
          rangeValues={appliedFilters.ranges[attribute.id]}
          onValueChange={(values) => onAttributeChange(attribute.id, values)}
          onRangeChange={(range) => onRangeChange(attribute.id, range)}
        />
      ))}

      {/* Product count */}
      <p className="text-xs text-muted-foreground pt-2 border-t">
        {filters.totalProducts} products
      </p>
    </div>
  );

  return (
    <div className={cn("", className)}>
      {header}
      {(!collapsible || isExpanded) && filterContent}
    </div>
  );
}

export default DynamicAttributeFilters;
