"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductSort, type SortOption } from "@/components/product/product-sort";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts, useCategories } from "@/lib/graphql/hooks";

export function ProductsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Parse URL parameters (all lowercase)
  const page = parseInt(searchParams.get("page") || "1", 10);
  const sort = (searchParams.get("sort") as SortOption) || "relevance";
  const categories = searchParams.get("categories")?.split(",").filter(Boolean) || [];
  const priceMin = searchParams.get("price_min");
  const priceMax = searchParams.get("price_max");
  
  const limit = 20;

  // Fetch categories for filter sidebar
  const { data: categoriesData } = useCategories();
  const allCategories = categoriesData?.categories ?? [];

  // Build GraphQL query string for filters
  let queryString = "";
  if (categories.length > 0) {
    // Use category handles in query
    queryString = categories.map(cat => `category:${cat}`).join(" OR ");
  }

  // Fetch products using GraphQL
  // Backend should normalize sort values (e.g., "price-asc" → PRICE + reverse: false)
  const { data, isLoading, error } = useProducts({
    first: limit,
    query: queryString || undefined,
    sortKey: sort as any, // Backend normalizes this
  });

  const products = data?.products ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Build selected filters object
  const selectedFilters: Record<string, any> = {};
  if (categories.length > 0) {
    selectedFilters.categories = categories;
  }
  if (priceMin) {
    selectedFilters.price_min = priceMin;
  }
  if (priceMax) {
    selectedFilters.price_max = priceMax;
  }

  // Update URL with new filters
  const updateFilters = (updates: Record<string, any>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        newParams.delete(key);
      } else if (Array.isArray(value)) {
        if (value.length > 0) {
          newParams.set(key, value.join(","));
        } else {
          newParams.delete(key);
        }
      } else {
        newParams.set(key, value.toString());
      }
    });
    
    // Reset to page 1 when filters change
    newParams.set("page", "1");
    router.push(`/products?${newParams.toString()}`);
  };

  // Handle filter changes
  const handleFilterChange = (filterId: string, value: any) => {
    if (filterId === "categories") {
      // Toggle category in array
      const newCategories = categories.includes(value)
        ? categories.filter(c => c !== value)
        : [...categories, value];
      updateFilters({ categories: newCategories });
    } else if (filterId === "price_min") {
      updateFilters({ price_min: value });
    } else if (filterId === "price_max") {
      updateFilters({ price_max: value });
    }
  };

  // Build filter options from categories
  const filterOptions = [
    {
      id: "categories",
      label: "Categories",
      type: "checkbox" as const,
      options: allCategories.map((category: any) => ({
        label: category.name,
        value: category.slug,
        count: category.productCount || 0,
      })),
    },
    {
      id: "price",
      label: "Price Range",
      type: "range" as const,
      min: 0,
      max: 1000,
    },
  ];

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 lg:flex-shrink-0">
        <div className="sticky top-4">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Filters
          </h2>
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <ProductFilters
              filters={filterOptions}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              onClearAll={() => router.push("/products")}
            />
          </Suspense>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Sort & Results Count */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            {totalCount > 0
              ? `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, totalCount)} of ${totalCount} products`
              : "No products found"}
          </p>
          <ProductSort 
            value={sort} 
            onChange={(newSort) => {
              const newParams = new URLSearchParams(searchParams.toString());
              newParams.set("sort", newSort);
              router.push(`/products?${newParams.toString()}`);
            }} 
          />
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full" />
            ))}
          </div>
        ) : (
          <ProductGrid
            products={products}
            columns={3}
            priorityCount={6}
            showBadges
            emptyMessage="No products match your filters"
            onResetFilters={() => router.push("/products")}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage: number) => {
                const newParams = new URLSearchParams(searchParams.toString());
                newParams.set("page", newPage.toString());
                router.push(`/products?${newParams.toString()}`);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
