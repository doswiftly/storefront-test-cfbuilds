'use client';

/**
 * WishlistItem Component
 *
 * Single item card in wishlist page.
 * Shows product info, price comparison, and actions.
 */

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useWishlistStore, type WishlistItem as WishlistItemType } from '@/stores/wishlist-store';
import { useCartActions } from '@/hooks/use-cart-actions';
import { toast } from 'sonner';

interface WishlistItemProps {
  item: WishlistItemType;
  wishlistId: string;
}

export function WishlistItem({ item, wishlistId }: WishlistItemProps) {
  const { removeItem } = useWishlistStore();
  const { addToCart } = useCartActions();

  const handleRemove = () => {
    removeItem(wishlistId, item.id);
    toast.success('Usunięto z listy życzeń');
  };

  const handleAddToCart = async () => {
    await addToCart({
      variantId: item.variantId || item.productId,
      productId: item.productId,
      productTitle: item.productTitle,
      variantTitle: item.variantTitle || '',
      price: item.price,
      image: item.image,
      available: true,
    });
  };

  // Calculate price change since added
  const currentPrice = parseFloat(item.price.amount);
  const originalPrice = parseFloat(item.priceAtAdd.amount);
  const priceChange = currentPrice - originalPrice;
  const priceChangePercent = originalPrice > 0
    ? ((priceChange / originalPrice) * 100).toFixed(0)
    : 0;

  const formatPrice = (amount: string, currency: string) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency,
    }).format(parseFloat(amount));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Product Image */}
          <Link
            href={`/products/${item.productId}`}
            className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-md overflow-hidden"
          >
            {item.image ? (
              <Image
                src={item.image.url}
                alt={item.image.altText || item.productTitle}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ShoppingCart className="h-8 w-8" />
              </div>
            )}
          </Link>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <Link
              href={`/products/${item.productId}`}
              className="block hover:underline"
            >
              <h3 className="font-medium text-foreground truncate">
                {item.productTitle}
              </h3>
            </Link>
            {item.variantTitle && (
              <p className="text-sm text-muted-foreground truncate">
                {item.variantTitle}
              </p>
            )}

            {/* Price */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-lg">
                {formatPrice(item.price.amount, item.price.currencyCode)}
              </span>

              {/* Price change indicator */}
              {priceChange !== 0 && (
                <Badge
                  variant={priceChange < 0 ? 'success' : 'destructive'}
                  className={cn(
                    'text-xs gap-0.5',
                    priceChange < 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  )}
                >
                  {priceChange < 0 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <TrendingUp className="h-3 w-3" />
                  )}
                  {priceChangePercent}%
                </Badge>
              )}
            </div>

            {/* Added date */}
            <p className="text-xs text-muted-foreground mt-1">
              Dodano: {formatDate(item.addedAt)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="gap-1.5"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Do koszyka</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline ml-1.5">Usuń</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
