"use client";

import { useState, useRef, useEffect } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useCartActions } from "@/hooks/use-cart-actions";

export interface AddToCartButtonProps {
  // Product/Variant info
  variantId: string;
  productId: string;
  productHandle?: string;
  productTitle: string;
  variantTitle: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  image?: {
    url: string;
    altText?: string | null;
  } | null;
  available?: boolean;
  
  // UI props
  quantity?: number;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  
  // Optional custom handler (overrides default GraphQL behavior)
  onAddToCart?: (variantId: string, quantity: number) => Promise<void>;
}

/**
 * AddToCartButton - Add product to cart with GraphQL integration
 * 
 * Automatically handles:
 * - Cart creation if needed
 * - Adding to GraphQL cart
 * - Updating local store for immediate UI feedback
 * - Error handling with toast notifications
 * 
 * @example
 * ```tsx
 * <AddToCartButton
 *   variantId={selectedVariant.id}
 *   productId={product.id}
 *   productHandle={product.handle}
 *   productTitle={product.title}
 *   variantTitle={selectedVariant.title}
 *   price={selectedVariant.price}
 *   image={selectedVariant.image}
 *   quantity={quantity}
 * />
 * ```
 */
export function AddToCartButton({
  variantId,
  productId,
  productHandle,
  productTitle,
  variantTitle,
  price,
  image,
  available = true,
  quantity = 1,
  disabled = false,
  onAddToCart,
  className,
  size = "md",
  fullWidth = false,
}: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, isLoading } = useCartActions();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    try {
      // Use custom handler if provided, otherwise use GraphQL integration
      if (onAddToCart) {
        await onAddToCart(variantId, quantity);
      } else {
        await addToCart({
          variantId,
          productId,
          productHandle,
          productTitle,
          variantTitle,
          price,
          image,
          available,
          quantity,
        });
      }
      
      setIsAdded(true);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Reset "added" state after 2 seconds
      timeoutRef.current = setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      // Error toast is handled by useCartActions
    }
  };

  const buttonSize = size === "md" ? "default" : size;

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading || !available}
      size={buttonSize}
      className={cn(
        "relative transition-all",
        fullWidth && "w-full",
        isAdded && "bg-green-600 hover:bg-green-700",
        className
      )}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          Adding...
        </>
      ) : isAdded ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" />
          {!available ? "Out of Stock" : "Add to Cart"}
        </>
      )}
    </Button>
  );
}
