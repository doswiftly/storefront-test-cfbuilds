"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCartSync } from "@/hooks/use-cart-sync";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CartIconProps {
  className?: string;
  /** If true, navigates to /cart page instead of opening drawer */
  navigateToCart?: boolean;
}

/**
 * CartIcon - Cart button with item count badge
 *
 * Client Component that reads cart count from server (source of truth)
 */
export function CartIcon({ className, navigateToCart = true }: CartIconProps) {
  const router = useRouter();
  const { totalQuantity, isLoading } = useCartSync();

  const handleClick = () => {
    if (navigateToCart) {
      router.push("/cart");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn("relative p-2", className)}
      aria-label={`Shopping cart with ${totalQuantity} items`}
    >
      <ShoppingCart className="h-5 w-5" />

      {/* Badge */}
      {totalQuantity > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {totalQuantity > 99 ? "99+" : totalQuantity}
        </span>
      )}
    </Button>
  );
}
