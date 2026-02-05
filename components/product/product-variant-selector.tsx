"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface VariantOption {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  available: boolean;
  selectedOptions: VariantOption[];
  price: {
    amount: string;
    currencyCode: string;
  };
}

export interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId?: string;
  onVariantChange: (variant: ProductVariant) => void;
  className?: string;
}

/**
 * ProductVariantSelector - Select product options (size, color, etc.)
 * 
 * Extracts unique options from variants and allows selection.
 * Automatically finds matching variant when options change.
 * 
 * @example
 * ```tsx
 * <ProductVariantSelector
 *   variants={product.variants}
 *   selectedVariantId={selectedVariant?.id}
 *   onVariantChange={setSelectedVariant}
 * />
 * ```
 */
export function ProductVariantSelector({
  variants,
  selectedVariantId,
  onVariantChange,
  className,
}: ProductVariantSelectorProps) {
  // Extract unique option names and their values
  const options = variants.reduce((acc, variant) => {
    variant.selectedOptions.forEach((opt) => {
      if (!acc[opt.name]) {
        acc[opt.name] = new Set<string>();
      }
      acc[opt.name].add(opt.value);
    });
    return acc;
  }, {} as Record<string, Set<string>>);

  const optionGroups = Object.entries(options).map(([name, values]) => ({
    name,
    values: Array.from(values),
  }));

  // Currently selected values for each option
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    // Try to find the specified variant, or fall back to first variant
    const initialVariant = selectedVariantId
      ? variants.find((v) => v.id === selectedVariantId) ?? variants[0]
      : variants[0];

    // If no variants available at all, return empty object
    if (!initialVariant?.selectedOptions) return {};

    return initialVariant.selectedOptions.reduce(
      (acc, opt) => ({
        ...acc,
        [opt.name]: opt.value,
      }),
      {}
    );
  });

  // Find variant matching current selection
  const findMatchingVariant = (opts: Record<string, string>): ProductVariant | undefined => {
    return variants.find((variant) =>
      variant.selectedOptions.every((opt) => opts[opt.name] === opt.value)
    );
  };

  // Check if option value leads to available variant
  const isOptionAvailable = (optionName: string, optionValue: string): boolean => {
    const testOptions = { ...selectedOptions, [optionName]: optionValue };
    const matchingVariant = findMatchingVariant(testOptions);
    return matchingVariant?.available ?? false;
  };

  // Handle option selection
  const handleOptionChange = (optionName: string, optionValue: string) => {
    const newOptions = { ...selectedOptions, [optionName]: optionValue };
    setSelectedOptions(newOptions);

    const matchingVariant = findMatchingVariant(newOptions);
    if (matchingVariant) {
      onVariantChange(matchingVariant);
    }
  };

  // Sync when selectedVariantId changes externally
  useEffect(() => {
    if (selectedVariantId) {
      const variant = variants.find((v) => v.id === selectedVariantId);
      if (variant) {
        const opts = variant.selectedOptions.reduce(
          (acc, opt) => ({ ...acc, [opt.name]: opt.value }),
          {}
        );
        setSelectedOptions(opts);
      }
    }
  }, [selectedVariantId, variants]);

  // Don't render if only one variant with no meaningful options
  if (variants.length <= 1 && optionGroups.every((o) => o.values.length <= 1)) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {optionGroups.map((option) => (
        <div key={option.name}>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {option.name}
          </label>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedOptions[option.name] === value;
              const available = isOptionAvailable(option.name, value);

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleOptionChange(option.name, value)}
                  disabled={!available}
                  className={cn(
                    "relative min-w-[3rem] rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : available
                      ? "border-border bg-background text-foreground hover:border-primary"
                      : "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50"
                  )}
                >
                  {value}
                  {/* Out of stock indicator */}
                  {!available && (
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background bg-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
