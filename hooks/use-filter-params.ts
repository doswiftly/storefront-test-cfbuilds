"use client";

import { useCallback, useMemo, useRef, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { AppliedFilters } from "@/components/filters/dynamic-attribute-filters";

/**
 * useFilterParams - Hook for syncing filter state with URL
 *
 * URL parameter format:
 * - Discrete attributes: ?attr_color=red,blue&attr_size=xl
 * - Range attributes: ?attr_price_min=100&attr_price_max=500
 * - Price filter: ?min_price=50&max_price=200
 * - Category: ?category=category-id
 *
 * Features:
 * - Debounced URL updates (300ms)
 * - Multi-value support (comma-separated)
 * - Range value support (min/max pairs)
 * - SSR-safe (uses useSearchParams)
 *
 * Requirements: R35.20, R35.21, R35.22
 */

const ATTR_PREFIX = "attr_";
const RANGE_MIN_SUFFIX = "_min";
const RANGE_MAX_SUFFIX = "_max";
const DEBOUNCE_MS = 300;

export interface UseFilterParamsOptions {
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
}

export interface UseFilterParamsReturn {
  /** Current applied filters parsed from URL */
  appliedFilters: AppliedFilters;
  /** Update attribute filter values */
  setAttributeFilter: (attributeId: string, values: string[]) => void;
  /** Update range filter values */
  setRangeFilter: (attributeId: string, range: { min?: number; max?: number }) => void;
  /** Update price filter */
  setPriceFilter: (range: { min?: number; max?: number }) => void;
  /** Update category filter */
  setCategoryFilter: (categoryId?: string) => void;
  /** Clear all filters */
  clearAllFilters: () => void;
  /** Get URL for sharing/linking with current filters */
  getFilteredUrl: () => string;
}

/**
 * Parse URL search params into AppliedFilters object
 */
function parseSearchParams(searchParams: URLSearchParams): AppliedFilters {
  const attributes: Record<string, string[]> = {};
  const ranges: Record<string, { min?: number; max?: number }> = {};
  let price: { min?: number; max?: number } | undefined;
  let categoryId: string | undefined;

  // Parse category
  const categoryParam = searchParams.get("category");
  if (categoryParam) {
    categoryId = categoryParam;
  }

  // Parse price
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");
  if (minPrice || maxPrice) {
    price = {
      min: minPrice ? parseFloat(minPrice) : undefined,
      max: maxPrice ? parseFloat(maxPrice) : undefined,
    };
  }

  // Parse attribute filters
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith(ATTR_PREFIX)) {
      const attrKey = key.slice(ATTR_PREFIX.length);

      // Check if it's a range parameter (ends with _min or _max)
      if (attrKey.endsWith(RANGE_MIN_SUFFIX)) {
        const attrId = attrKey.slice(0, -RANGE_MIN_SUFFIX.length);
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          if (!ranges[attrId]) ranges[attrId] = {};
          ranges[attrId].min = numValue;
        }
      } else if (attrKey.endsWith(RANGE_MAX_SUFFIX)) {
        const attrId = attrKey.slice(0, -RANGE_MAX_SUFFIX.length);
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          if (!ranges[attrId]) ranges[attrId] = {};
          ranges[attrId].max = numValue;
        }
      } else {
        // Discrete attribute values (comma-separated)
        const values = value.split(",").filter(Boolean);
        if (values.length > 0) {
          attributes[attrKey] = values;
        }
      }
    }
  }

  return { attributes, ranges, price, categoryId };
}

/**
 * Serialize AppliedFilters to URLSearchParams
 */
function serializeToSearchParams(
  filters: AppliedFilters,
  existingParams?: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams();

  // Preserve non-filter params (like page, sort)
  if (existingParams) {
    for (const [key, value] of existingParams.entries()) {
      if (
        !key.startsWith(ATTR_PREFIX) &&
        key !== "min_price" &&
        key !== "max_price" &&
        key !== "category"
      ) {
        params.set(key, value);
      }
    }
  }

  // Category
  if (filters.categoryId) {
    params.set("category", filters.categoryId);
  }

  // Price
  if (filters.price?.min !== undefined) {
    params.set("min_price", filters.price.min.toString());
  }
  if (filters.price?.max !== undefined) {
    params.set("max_price", filters.price.max.toString());
  }

  // Discrete attributes
  for (const [attrId, values] of Object.entries(filters.attributes)) {
    if (values.length > 0) {
      params.set(`${ATTR_PREFIX}${attrId}`, values.join(","));
    }
  }

  // Range attributes
  for (const [attrId, range] of Object.entries(filters.ranges)) {
    if (range.min !== undefined) {
      params.set(`${ATTR_PREFIX}${attrId}${RANGE_MIN_SUFFIX}`, range.min.toString());
    }
    if (range.max !== undefined) {
      params.set(`${ATTR_PREFIX}${attrId}${RANGE_MAX_SUFFIX}`, range.max.toString());
    }
  }

  return params;
}

export function useFilterParams(
  options: UseFilterParamsOptions = {}
): UseFilterParamsReturn {
  const { debounceMs = DEBOUNCE_MS } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Debounce timer ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Parse current filters from URL
  const appliedFilters = useMemo(() => {
    return parseSearchParams(searchParams);
  }, [searchParams]);

  // Update URL with debouncing
  const updateUrl = useCallback(
    (newFilters: AppliedFilters) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        const params = serializeToSearchParams(newFilters, searchParams);
        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        router.push(newUrl, { scroll: false });
      }, debounceMs);
    },
    [pathname, searchParams, router, debounceMs]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Set attribute filter values
  const setAttributeFilter = useCallback(
    (attributeId: string, values: string[]) => {
      const newFilters = { ...appliedFilters };
      newFilters.attributes = { ...newFilters.attributes };

      if (values.length > 0) {
        newFilters.attributes[attributeId] = values;
      } else {
        delete newFilters.attributes[attributeId];
      }

      updateUrl(newFilters);
    },
    [appliedFilters, updateUrl]
  );

  // Set range filter values
  const setRangeFilter = useCallback(
    (attributeId: string, range: { min?: number; max?: number }) => {
      const newFilters = { ...appliedFilters };
      newFilters.ranges = { ...newFilters.ranges };

      if (range.min !== undefined || range.max !== undefined) {
        newFilters.ranges[attributeId] = range;
      } else {
        delete newFilters.ranges[attributeId];
      }

      updateUrl(newFilters);
    },
    [appliedFilters, updateUrl]
  );

  // Set price filter
  const setPriceFilter = useCallback(
    (range: { min?: number; max?: number }) => {
      const newFilters = { ...appliedFilters };

      if (range.min !== undefined || range.max !== undefined) {
        newFilters.price = range;
      } else {
        newFilters.price = undefined;
      }

      updateUrl(newFilters);
    },
    [appliedFilters, updateUrl]
  );

  // Set category filter
  const setCategoryFilter = useCallback(
    (categoryId?: string) => {
      const newFilters = { ...appliedFilters };
      newFilters.categoryId = categoryId;
      updateUrl(newFilters);
    },
    [appliedFilters, updateUrl]
  );

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const newFilters: AppliedFilters = {
      attributes: {},
      ranges: {},
      price: undefined,
      categoryId: undefined,
    };
    updateUrl(newFilters);
  }, [updateUrl]);

  // Get URL for sharing
  const getFilteredUrl = useCallback(() => {
    const params = serializeToSearchParams(appliedFilters, searchParams);
    const queryString = params.toString();
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return queryString ? `${baseUrl}${pathname}?${queryString}` : `${baseUrl}${pathname}`;
  }, [appliedFilters, pathname, searchParams]);

  return {
    appliedFilters,
    setAttributeFilter,
    setRangeFilter,
    setPriceFilter,
    setCategoryFilter,
    clearAllFilters,
    getFilteredUrl,
  };
}

export default useFilterParams;
