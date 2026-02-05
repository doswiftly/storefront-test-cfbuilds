"use client";

import { useState, useMemo } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: "checkbox" | "range" | "color";
  options?: FilterOption[];
  min?: number;
  max?: number;
}

export interface ProductFiltersProps {
  filters: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (filterId: string, values: string[]) => void;
  onClearAll?: () => void;
  className?: string;
}

/**
 * ProductFilters - Filter products by price, category, attributes
 * 
 * @example
 * ```tsx
 * const [filters, setFilters] = useState({});
 * 
 * <ProductFilters
 *   filters={filterGroups}
 *   selectedFilters={filters}
 *   onFilterChange={(id, values) => {
 *     setFilters({ ...filters, [id]: values });
 *   }}
 * />
 * ```
 */
export function ProductFilters({
  filters,
  selectedFilters,
  onFilterChange,
  onClearAll,
  className,
}: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  });

  const handleCheckboxChange = (filterId: string, value: string) => {
    const current = selectedFilters[filterId] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange(filterId, updated);
  };

  const handlePriceRangeApply = (filterId: string, min: number, max: number) => {
    onFilterChange(filterId, [`${min}-${max}`]);
  };

  const hasActiveFilters = Object.values(selectedFilters).some(
    (values) => values.length > 0
  );

  // Memoize default open filter IDs to avoid re-creating array on every render
  const defaultOpenFilters = useMemo(() => filters.map((f) => f.id), [filters]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Clear all button */}
      {hasActiveFilters && onClearAll && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="w-full"
        >
          Clear all filters
        </Button>
      )}

      {/* Filter groups */}
      <Accordion type="multiple" defaultValue={defaultOpenFilters}>
        {filters.map((filter) => (
          <AccordionItem key={filter.id} value={filter.id}>
            <AccordionTrigger value={filter.id}>
              <span className="flex items-center gap-2">
                {filter.label}
                {selectedFilters[filter.id]?.length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {selectedFilters[filter.id].length}
                  </span>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent value={filter.id}>
              {/* Checkbox filters */}
              {filter.type === "checkbox" && filter.options && (
                <div className="space-y-2">
                  {filter.options.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFilters[filter.id]?.includes(
                          option.value
                        )}
                        onChange={() =>
                          handleCheckboxChange(filter.id, option.value)
                        }
                        className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      />
                      <span className="flex-1 text-sm text-foreground">
                        {option.label}
                      </span>
                      {option.count !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          ({option.count})
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}

              {/* Price range filter */}
              {filter.type === "range" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: e.target.value })
                      }
                      min={filter.min}
                      max={filter.max}
                      className="w-full"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: e.target.value })
                      }
                      min={filter.min}
                      max={filter.max}
                      className="w-full"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      handlePriceRangeApply(
                        filter.id,
                        parseFloat(priceRange.min) || filter.min || 0,
                        parseFloat(priceRange.max) || filter.max || 999999
                      )
                    }
                    className="w-full"
                  >
                    Apply
                  </Button>
                </div>
              )}

              {/* Color filters */}
              {filter.type === "color" && filter.options && (
                <div className="flex flex-wrap gap-2">
                  {filter.options.map((option) => {
                    const isSelected = selectedFilters[filter.id]?.includes(
                      option.value
                    );
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          handleCheckboxChange(filter.id, option.value)
                        }
                        className={cn(
                          "h-8 w-8 rounded-full border-2 transition-all",
                          isSelected
                            ? "border-primary ring-2 ring-ring ring-offset-2"
                            : "border-border hover:border-primary"
                        )}
                        style={{ backgroundColor: option.value }}
                        title={option.label}
                        aria-label={option.label}
                      />
                    );
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
