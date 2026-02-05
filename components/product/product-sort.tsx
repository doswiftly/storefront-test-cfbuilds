"use client";

import { Select } from "@/components/ui/select";

// Sort options that match backend expectations
// Backend should normalize these to ProductSortKeys + reverse flag
export type SortOption =
  | "relevance"
  | "best-selling"
  | "price-low-to-high"
  | "price-high-to-low"
  | "title-asc"
  | "title-desc"
  | "created-desc"
  | "created-asc";

export interface ProductSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Featured" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-low-to-high", label: "Price: Low to High" },
  { value: "price-high-to-low", label: "Price: High to Low" },
  { value: "title-asc", label: "Name: A to Z" },
  { value: "title-desc", label: "Name: Z to A" },
  { value: "created-desc", label: "Newest First" },
  { value: "created-asc", label: "Oldest First" },
];

/**
 * ProductSort - Sorting dropdown for product listings
 * 
 * @example
 * ```tsx
 * const [sort, setSort] = useState<SortOption>("featured");
 * 
 * <ProductSort 
 *   value={sort}
 *   onChange={setSort}
 * />
 * ```
 */
export function ProductSort({ value, onChange, className }: ProductSortProps) {
  return (
    <div className={className}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        label="Sort by"
        options={sortOptions}
      />
    </div>
  );
}
