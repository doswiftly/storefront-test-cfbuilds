"use client";

import { useState, useMemo } from "react";
import { VariantSelector } from "@/components/commerce/variant-selector";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { formatPrice } from "@/lib/format";

interface ProductVariant {
  id: string;
  title: string;
  available: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
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

interface ProductActionsProps {
  variants: ProductVariant[];
  productId: string;
  productHandle?: string;
  productTitle: string;
  productImages?: Array<{
    url: string;
    altText?: string | null;
  }>;
}

/**
 * ProductActions - Client-side product interactions
 *
 * Handles variant selection, quantity, and add to cart.
 * Server Component renders the rest of the page.
 */
export function ProductActions({ 
  variants, 
  productId, 
  productHandle,
  productTitle,
  productImages = []
}: ProductActionsProps) {
  // Store only variant ID - derive variant object from props (SSOT)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    () => variants[0]?.id ?? null
  );
  const [quantity, setQuantity] = useState(1);

  // Derived state: automatically updates when variants prop changes (e.g., after currency change)
  const selectedVariant = useMemo(() => {
    if (!variants || variants.length === 0) return null;
    const found = variants.find((v) => v.id === selectedVariantId);
    // Fallback to first variant if selected ID not found in new variants
    return found ?? variants[0];
  }, [variants, selectedVariantId]);

  // Handler for VariantSelector - extracts ID from variant object
  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariantId(variant.id);
  };

  const inStock = selectedVariant?.available ?? true;
  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;

  return (
    <div className="space-y-6">
      {/* Price */}
      <div className="flex items-baseline gap-4">
        <span className="text-2xl font-bold text-primary">
          {formatPrice(price)}
        </span>
        {compareAtPrice && (
          <span className="text-lg text-gray-400 line-through">
            {formatPrice(compareAtPrice)}
          </span>
        )}
      </div>

      {/* Variant Selector */}
      {variants.length > 1 && (
        <VariantSelector
          variants={variants}
          selectedVariantId={selectedVariant?.id}
          onVariantChange={handleVariantChange}
        />
      )}

      {/* Stock Status */}
      <div>
        {inStock ? (
          <span className="inline-flex items-center gap-2 text-green-600">
            <span className="h-2 w-2 rounded-full bg-green-600" />
            In Stock
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-red-600">
            <span className="h-2 w-2 rounded-full bg-red-600" />
            Out of Stock
          </span>
        )}
      </div>

      {/* Quantity & Add to Cart */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Quantity:</label>
          <div className="flex items-center rounded-lg border border-gray-300">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-gray-600 hover:text-primary"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-16 border-x border-gray-300 py-2 text-center"
            />
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-2 text-gray-600 hover:text-primary"
            >
              +
            </button>
          </div>
        </div>

        <AddToCartButton
          variantId={selectedVariant?.id || productId}
          productId={productId}
          productHandle={productHandle}
          productTitle={productTitle}
          variantTitle={selectedVariant?.title || "Default"}
          price={selectedVariant?.price || { amount: "0", currencyCode: "USD" }}
          image={selectedVariant?.image || productImages[0]}
          available={inStock}
          quantity={quantity}
          disabled={!inStock}
        />
      </div>
    </div>
  );
}
