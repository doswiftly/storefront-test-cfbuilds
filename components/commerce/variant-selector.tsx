"use client";

import { useState, useMemo, useEffect } from "react";

interface VariantOption {
  name: string;
  value: string;
}

interface ProductVariant {
  id: string;
  title: string;
  available: boolean;
  selectedOptions: VariantOption[];
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  } | null;
  image?: {
    url: string;
    altText?: string | null;
  } | null;
}

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId?: string;
  onVariantChange: (variant: ProductVariant) => void;
}

/**
 * VariantSelector - Select product options (size, color, etc.)
 *
 * Extracts unique options from variants and allows selection.
 * Automatically finds matching variant when options change.
 *
 * @example
 * ```tsx
 * <VariantSelector
 *   variants={product.variants}
 *   selectedVariantId={selectedVariant?.id}
 *   onVariantChange={setSelectedVariant}
 * />
 * ```
 */
export function VariantSelector({
  variants,
  selectedVariantId,
  onVariantChange,
}: VariantSelectorProps) {
  // Extract unique option names and their values
  const options = useMemo(() => {
    const optionMap = new Map<string, Set<string>>();

    variants.forEach((variant) => {
      variant.selectedOptions.forEach((opt) => {
        if (!optionMap.has(opt.name)) {
          optionMap.set(opt.name, new Set());
        }
        optionMap.get(opt.name)!.add(opt.value);
      });
    });

    return Array.from(optionMap.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }));
  }, [variants]);

  // Currently selected values for each option
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(() => {
    // Initialize from selected variant or first variant
    const initialVariant = selectedVariantId
      ? variants.find((v) => v.id === selectedVariantId)
      : variants[0];

    if (!initialVariant) return {};

    return initialVariant.selectedOptions.reduce(
      (acc, opt) => ({
        ...acc,
        [opt.name]: opt.value,
      }),
      {}
    );
  });

  // Find variant matching current selection
  const findMatchingVariant = (
    opts: Record<string, string>
  ): ProductVariant | undefined => {
    return variants.find((variant) =>
      variant.selectedOptions.every((opt) => opts[opt.name] === opt.value)
    );
  };

  // Check if a specific option value is available
  const isOptionAvailable = (
    optionName: string,
    optionValue: string
  ): boolean => {
    const testOptions = { ...selectedOptions, [optionName]: optionValue };
    const matchingVariant = findMatchingVariant(testOptions);
    return !!matchingVariant;
  };

  // Check if option value leads to in-stock variant
  const isOptionInStock = (
    optionName: string,
    optionValue: string
  ): boolean => {
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

  // Sync parent when variants prop changes (e.g., after currency change)
  // This ensures parent gets the updated variant object with new prices
  useEffect(() => {
    if (selectedVariantId && variants.length > 0) {
      const updatedVariant = variants.find((v) => v.id === selectedVariantId);
      if (updatedVariant) {
        // Notify parent with updated variant (containing new prices)
        onVariantChange(updatedVariant);
      }
    }
  }, [variants]); // Only trigger when variants change, not on every render

  // Don't render if only one variant with no meaningful options
  if (variants.length <= 1 && options.every((o) => o.values.length <= 1)) {
    return null;
  }

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <div key={option.name}>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {option.name}
          </label>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedOptions[option.name] === value;
              const available = isOptionAvailable(option.name, value);
              const inStock = isOptionInStock(option.name, value);

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleOptionChange(option.name, value)}
                  disabled={!available}
                  className={`
                    relative min-w-[3rem] rounded-lg border px-4 py-2 text-sm font-medium
                    transition-all
                    ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : available
                        ? "border-gray-300 bg-white text-gray-900 hover:border-primary"
                        : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                    }
                    ${!inStock && available ? "text-gray-500" : ""}
                  `}
                >
                  {value}
                  {/* Out of stock indicator */}
                  {!inStock && available && (
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-gray-400" />
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
