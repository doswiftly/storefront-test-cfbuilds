'use client';

/**
 * WishlistIcon Component
 *
 * Header icon showing wishlist with item count badge.
 * Links to wishlist page.
 */

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useWishlistStore } from '@/stores/wishlist-store';

interface WishlistIconProps {
  className?: string;
  showCount?: boolean;
}

export function WishlistIcon({ className, showCount = true }: WishlistIconProps) {
  const { getTotalItems, isHydrated } = useWishlistStore();

  const totalItems = getTotalItems();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('relative', className)}
      asChild
    >
      <Link href="/wishlist" aria-label={`Lista życzeń (${totalItems} produktów)`}>
        <Heart className="h-5 w-5" />
        {showCount && isHydrated && totalItems > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-xs"
          >
            {totalItems > 99 ? '99+' : totalItems}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
