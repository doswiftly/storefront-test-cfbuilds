'use client';

/**
 * Wishlist Page
 *
 * Displays customer's saved products with price tracking
 * and quick add to cart functionality.
 */

import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { WishlistItem } from '@/components/wishlist/wishlist-item';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useCartActions } from '@/hooks/use-cart-actions';
import { toast } from 'sonner';

export default function WishlistPage() {
  const {
    wishlists,
    getActiveWishlist,
    clearWishlist,
    isHydrated,
  } = useWishlistStore();

  const { addToCart } = useCartActions();

  const activeWishlist = getActiveWishlist();
  const items = activeWishlist?.items || [];

  const handleClearWishlist = () => {
    if (activeWishlist) {
      clearWishlist(activeWishlist.id);
      toast.success('Lista życzeń została wyczyszczona');
    }
  };

  const handleAddAllToCart = async () => {
    if (!activeWishlist) return;

    for (const item of items) {
      try {
        await addToCart({
          variantId: item.variantId || item.productId,
          productId: item.productId,
          productTitle: item.productTitle,
          variantTitle: item.variantTitle || '',
          price: item.price,
          image: item.image,
          available: true,
        });
      } catch {
        // Individual item errors are handled by addToCart (shows toast)
      }
    }

    toast.success(`Dodano ${items.length} produktów do koszyka`);
  };

  // Show loading state while hydrating from localStorage
  if (!isHydrated) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <Breadcrumbs
        items={[
          { label: 'Strona główna', href: '/' },
          { label: 'Lista życzeń' },
        ]}
      />

      <div className="mt-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500" />
            Lista życzeń
          </h1>
          <p className="text-muted-foreground mt-1">
            {items.length === 0
              ? 'Twoja lista życzeń jest pusta'
              : `${items.length} ${items.length === 1 ? 'produkt' : 'produktów'}`}
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClearWishlist}>
              <Trash2 className="h-4 w-4 mr-2" />
              Wyczyść
            </Button>
            <Button size="sm" onClick={handleAddAllToCart}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Dodaj wszystko do koszyka
            </Button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-12 w-12" />}
          title="Lista życzeń jest pusta"
          description="Dodaj produkty do listy życzeń, aby śledzić ich ceny i szybko dodawać do koszyka."
          action={{
            label: 'Przeglądaj produkty',
            href: '/products',
          }}
        />
      ) : (
        <div className="space-y-4">
          {/* Price change summary */}
          <PriceChangeSummary items={items} />

          {/* Wishlist items */}
          {activeWishlist && items.map((item) => (
            <WishlistItem
              key={item.id}
              item={item}
              wishlistId={activeWishlist.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Shows summary of price changes for all items
 */
function PriceChangeSummary({ items }: { items: Array<{ price: { amount: string }; priceAtAdd: { amount: string } }> }) {
  const itemsWithPriceDrops = items.filter((item) => {
    const current = parseFloat(item.price.amount);
    const original = parseFloat(item.priceAtAdd.amount);
    return current < original;
  });

  const totalSavings = itemsWithPriceDrops.reduce((sum, item) => {
    const current = parseFloat(item.price.amount);
    const original = parseFloat(item.priceAtAdd.amount);
    return sum + (original - current);
  }, 0);

  if (itemsWithPriceDrops.length === 0) return null;

  return (
    <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
      <CardHeader className="pb-2">
        <CardTitle className="text-green-700 dark:text-green-400 text-lg flex items-center gap-2">
          🎉 Dobre wieści!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-green-700 dark:text-green-400">
          {itemsWithPriceDrops.length} {itemsWithPriceDrops.length === 1 ? 'produkt obniżył' : 'produktów obniżyło'} cenę!
          Możesz zaoszczędzić łącznie{' '}
          <span className="font-semibold">
            {new Intl.NumberFormat('pl-PL', {
              style: 'currency',
              currency: 'PLN',
            }).format(totalSavings)}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
