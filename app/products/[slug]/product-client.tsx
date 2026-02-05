"use client";

import { useState, useEffect } from "react";
import { useProduct } from "@/lib/graphql/hooks";
import { useCurrencyStore } from "@/stores/currency-store";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPrice } from "@/components/product/product-price";
import { ProductVariantSelector } from "@/components/product/product-variant-selector";
import { ProductQuantitySelector } from "@/components/product/product-quantity-selector";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { StockIndicator } from "@/components/product/stock-indicator";
import { SimilarProducts } from "@/components/product/similar-products";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Gift } from "lucide-react";
import { shopConfig } from "@/lib/config";

export interface Product {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  vendor?: string | null;
  productType?: string | null;
  type?: string | null;
  collectRecipientInfo?: boolean;
  tags?: string[];
  images: Array<{
    url: string;
    altText?: string | null;
  }>;
  variants: Array<{
    id: string;
    title: string;
    available: boolean;
    selectedOptions: Array<{
      name: string;
      value: string;
    }>;
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
  }>;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
}

export interface ProductClientProps {
  product: Product;
  similarProducts?: any[];
}

/**
 * Product Client Component
 * 
 * Handles interactive features and currency-aware price display.
 * 
 * Flow:
 * 1. Receives initial product data from Server Component (base currency)
 * 2. Checks if user's preferred currency differs from SSR currency
 * 3. If different, refetches product with preferred currency
 * 4. Uses suppressHydrationWarning on price elements to prevent mismatch
 * 
 * Requirements: 2.2, 3.2, 6.4
 */
export function ProductClient({ product: initialProduct, similarProducts = [] }: ProductClientProps) {
  const [selectedVariant, setSelectedVariant] = useState(initialProduct.variants[0]);
  const [quantity, setQuantity] = useState(1);
  
  // Get user's preferred currency from store
  const currency = useCurrencyStore((s: any) => s.currency);
  const isHydrated = useCurrencyStore((s: any) => s.isHydrated);
  
  // Check if SSR currency matches user's preferred currency
  const ssrCurrency = initialProduct.priceRange?.minVariantPrice?.currencyCode;
  const currencyMatches = !isHydrated || !currency || currency === ssrCurrency;
  
  // Refetch product with current currency from store
  // Query key includes currency, so it auto-refetches when currency changes
  const { data, isFetching } = useProduct(initialProduct.handle, {
    // Only enable after hydration to avoid SSR/client mismatch
    enabled: isHydrated,
    // Only use SSR data as placeholder if currency matches
    // Otherwise, don't show stale data from wrong currency
    placeholderData: currencyMatches ? { product: initialProduct } : undefined,
    // Don't use stale data - always refetch when currency changes
    staleTime: 0,
  });
  
  // Use fetched product if available, otherwise use initial (SSR) data only if currency matches
  const product = data?.product || (currencyMatches ? initialProduct : null);
  
  // Update selected variant when product changes (currency switch)
  // IMPORTANT: This useEffect must be called BEFORE any conditional returns
  // to comply with React Hooks rules (hooks must be called in the same order every render)
  useEffect(() => {
    if (product?.variants.length > 0) {
      // Try to maintain the same variant by matching ID
      const matchingVariant = product.variants.find(
        (v: any) => v.id === selectedVariant.id
      );
      if (matchingVariant) {
        setSelectedVariant(matchingVariant);
      } else {
        // Fallback to first variant if ID doesn't match
        setSelectedVariant(product.variants[0]);
      }
    }
  }, [product, selectedVariant.id]);
  
  // Show loading state if we don't have data in correct currency yet
  // This check comes AFTER all hooks to prevent "Rendered fewer hooks than expected" error
  if (!product) {
    return (
      <div className="space-y-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="aspect-square animate-pulse bg-muted rounded-lg" />
          <div className="space-y-6">
            <div className="h-10 w-3/4 animate-pulse bg-muted rounded" />
            <div className="h-8 w-1/4 animate-pulse bg-muted rounded" />
            <div className="h-24 animate-pulse bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  const isOnSale = selectedVariant.compareAtPrice &&
    parseFloat(selectedVariant.compareAtPrice.amount) >
    parseFloat(selectedVariant.price.amount);

  return (
    <div className="space-y-16">
      {/* Product Details */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div>
          <ProductGallery images={product.images} productTitle={product.title} />
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Title & Badges */}
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {product.type === "GIFT_CARD" && (
                <Badge variant="default">
                  <Gift className="mr-1 h-3 w-3" />
                  Karta podarunkowa
                </Badge>
              )}
              {product.tags?.includes("new") && product.type !== "GIFT_CARD" && (
                <Badge variant="default">NEW</Badge>
              )}
              {isOnSale && <Badge variant="destructive">SALE</Badge>}
            </div>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
              {product.title}
            </h1>
            {product.vendor && (
              <p className="mt-2 text-sm text-muted-foreground">
                by {product.vendor}
              </p>
            )}
          </div>

          {/* Price - suppressHydrationWarning prevents mismatch during currency switch */}
          <div suppressHydrationWarning>
            <ProductPrice
              price={selectedVariant.price}
              compareAtPrice={selectedVariant.compareAtPrice || undefined}
              showCompareAt
              size="xl"
            />
          </div>

          {/* Stock */}
          <StockIndicator
            available={selectedVariant.available}
            variant="text"
          />

          {/* Description */}
          {product.description && (
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>{product.description}</p>
            </div>
          )}

          {/* Variant Selector */}
          {product.variants.length > 1 && (
            <ProductVariantSelector
              variants={product.variants}
              selectedVariantId={selectedVariant.id}
              onVariantChange={setSelectedVariant}
            />
          )}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <ProductQuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={99}
                disabled={!selectedVariant.available}
              />
              <AddToCartButton
                variantId={selectedVariant.id}
                productId={product.id}
                productHandle={product.handle}
                productTitle={product.title}
                variantTitle={selectedVariant.title}
                price={selectedVariant.price}
                image={selectedVariant.image || product.images[0]}
                available={selectedVariant.available}
                quantity={quantity}
                fullWidth
                size="lg"
              />
            </div>
          </div>

          {/* Product Details */}
          {(product.vendor || product.productType) && (
            <div className="border-t border-border pt-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                Product Details
              </h3>
              <dl className="space-y-2 text-sm">
                {product.vendor && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Vendor</dt>
                    <dd className="font-medium text-foreground">
                      {product.vendor}
                    </dd>
                  </div>
                )}
                {product.productType && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium text-foreground">
                      {product.productType}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info Tabs */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="mt-6">
          <div className="prose prose-sm max-w-none">
            <p>{product.description || "No description available."}</p>
          </div>
        </TabsContent>
        
        <TabsContent value="details" className="mt-6">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-foreground">Product ID</dt>
              <dd className="mt-1 text-sm text-muted-foreground">
                {product.id}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Handle</dt>
              <dd className="mt-1 text-sm text-muted-foreground">
                {product.handle}
              </dd>
            </div>
            {product.vendor && (
              <div>
                <dt className="font-medium text-foreground">Vendor</dt>
                <dd className="mt-1 text-sm text-muted-foreground">
                  {product.vendor}
                </dd>
              </div>
            )}
            {product.productType && (
              <div>
                <dt className="font-medium text-foreground">Type</dt>
                <dd className="mt-1 text-sm text-muted-foreground">
                  {product.productType}
                </dd>
              </div>
            )}
          </dl>
        </TabsContent>
        
        <TabsContent value="shipping" className="mt-6">
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Free shipping on orders over ${shopConfig.shipping.freeShippingThreshold}.
              Standard delivery takes {shopConfig.shipping.standardDeliveryDays.min}-{shopConfig.shipping.standardDeliveryDays.max} business days.
            </p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              {shopConfig.shipping.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        </TabsContent>
      </Tabs>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <SimilarProducts
          products={similarProducts}
          title="You might also like"
          columns={4}
        />
      )}
    </div>
  );
}
