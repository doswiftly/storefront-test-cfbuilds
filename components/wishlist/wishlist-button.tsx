'use client';

/**
 * WishlistButton Component
 *
 * Toggle button to add/remove products from wishlist.
 * Shows filled heart when product is in wishlist.
 */

import { useState, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWishlistStore } from '@/stores/wishlist-store';
import { toast } from 'sonner';

interface WishlistButtonProps {
  productId: string;
  variantId?: string;
  productTitle: string;
  variantTitle?: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  image?: {
    url: string;
    altText?: string | null;
  } | null;
  variant?: 'default' | 'icon' | 'icon-sm';
  className?: string;
}

export function WishlistButton({
  productId,
  variantId,
  productTitle,
  variantTitle,
  price,
  image,
  variant = 'default',
  className,
}: WishlistButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const {
    wishlists,
    isInWishlist,
    getWishlistForProduct,
    addItem,
    removeItem,
  } = useWishlistStore();

  const inWishlist = isInWishlist(productId, variantId);

  const handleToggle = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    if (inWishlist) {
      // Find the wishlist containing this product and remove it
      const wishlist = getWishlistForProduct(productId, variantId);
      if (wishlist) {
        const item = wishlist.items.find(
          (i) =>
            i.productId === productId &&
            (variantId ? i.variantId === variantId : true)
        );
        if (item) {
          removeItem(wishlist.id, item.id);
          toast.success('Usunięto z listy życzeń');
        }
      }
    } else {
      // Add to first wishlist or create default
      const wishlistId = wishlists[0]?.id || 'default';
      addItem(wishlistId, {
        productId,
        variantId,
        productTitle,
        variantTitle,
        price,
        priceAtAdd: price,
        image,
        notifyOnSale: false,
        notifyOnRestock: false,
      });
      toast.success('Dodano do listy życzeń');
    }
  }, [
    inWishlist,
    productId,
    variantId,
    productTitle,
    variantTitle,
    price,
    image,
    wishlists,
    addItem,
    removeItem,
    getWishlistForProduct,
  ]);

  if (variant === 'icon' || variant === 'icon-sm') {
    return (
      <Button
        variant="ghost"
        size={variant === 'icon-sm' ? 'sm' : 'icon'}
        className={cn(
          'transition-all duration-200',
          inWishlist && 'text-red-500 hover:text-red-600',
          isAnimating && 'scale-125',
          className
        )}
        onClick={handleToggle}
        aria-label={inWishlist ? 'Usuń z listy życzeń' : 'Dodaj do listy życzeń'}
      >
        <Heart
          className={cn(
            'h-5 w-5 transition-all',
            variant === 'icon-sm' && 'h-4 w-4',
            inWishlist && 'fill-current'
          )}
        />
      </Button>
    );
  }

  return (
    <Button
      variant={inWishlist ? 'secondary' : 'outline'}
      className={cn(
        'gap-2 transition-all duration-200',
        isAnimating && 'scale-105',
        className
      )}
      onClick={handleToggle}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-all',
          inWishlist && 'fill-current text-red-500'
        )}
      />
      {inWishlist ? 'W liście życzeń' : 'Dodaj do listy życzeń'}
    </Button>
  );
}
