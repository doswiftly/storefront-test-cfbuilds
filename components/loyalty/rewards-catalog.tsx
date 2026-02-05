'use client';

/**
 * RewardsCatalog Component
 *
 * Displays available loyalty rewards that can be redeemed.
 */

import { useState } from 'react';
import Image from 'next/image';
import { Gift, Check, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TierBadge } from './tier-badge';
import { toast } from 'sonner';

type TierType = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

interface Reward {
  id: string;
  name: string;
  slug: string;
  type: string;
  pointsCost: number;
  discountPercent?: number;
  discountAmount?: {
    amount: string;
    currencyCode: string;
  };
  description?: string;
  image?: {
    url: string;
    altText?: string | null;
  } | null;
  available: boolean;
  tierRequired?: TierType | null;
  remainingRedemptions?: number;
}

interface RedeemResult {
  discountCode?: string | null;
  productDiscountCode?: string | null;
  giftCardCode?: string | null;
}

interface RewardsCatalogProps {
  rewards: Reward[];
  currentPoints: number;
  currentTier?: TierType | null;
  onRedeem?: (rewardId: string) => Promise<RedeemResult>;
  className?: string;
}

export function RewardsCatalog({
  rewards,
  currentPoints,
  currentTier,
  onRedeem,
  className,
}: RewardsCatalogProps) {
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pl-PL').format(num);
  };

  const formatMoney = (amount: string, currency: string) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency,
    }).format(parseFloat(amount));
  };

  const tierOrder: TierType[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  const canAccessTier = (requiredTier?: TierType | null) => {
    if (!requiredTier || !currentTier) return true;
    return tierOrder.indexOf(currentTier) >= tierOrder.indexOf(requiredTier);
  };

  const handleRedeem = async (reward: Reward) => {
    if (!onRedeem) return;

    setRedeemingId(reward.id);
    try {
      const result = await onRedeem(reward.id);

      // Display the appropriate code based on reward type
      if (result.discountCode) {
        toast.success(
          `Nagroda odebrana! Kod rabatowy: ${result.discountCode}`,
          { duration: 10000 }
        );
      } else if (result.productDiscountCode) {
        toast.success(
          `Nagroda odebrana! Kod na darmowy produkt: ${result.productDiscountCode}`,
          { duration: 10000 }
        );
      } else if (result.giftCardCode) {
        toast.success(
          `Nagroda odebrana! Karta podarunkowa: ${result.giftCardCode}`,
          { duration: 10000 }
        );
      } else {
        toast.success('Nagroda odebrana!');
      }
    } catch {
      toast.error('Nie udało się odebrać nagrody');
    } finally {
      setRedeemingId(null);
    }
  };

  if (rewards.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Brak dostępnych nagród</p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {rewards.map((reward) => {
        const canAfford = currentPoints >= reward.pointsCost;
        const hasTierAccess = canAccessTier(reward.tierRequired);
        const canRedeem = reward.available && canAfford && hasTierAccess;

        return (
          <Card key={reward.id} className={cn('overflow-hidden', !canRedeem && 'opacity-75')}>
            {reward.image && (
              <div className="relative aspect-[16/9] bg-muted">
                <Image
                  src={reward.image.url}
                  alt={reward.image.altText || reward.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold">{reward.name}</h3>
                {reward.tierRequired && (
                  <TierBadge tier={reward.tierRequired} size="sm" />
                )}
              </div>

              {reward.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {reward.description}
                </p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="gap-1">
                  <Gift className="h-3 w-3" />
                  {formatNumber(reward.pointsCost)} pkt
                </Badge>

                {reward.discountPercent && (
                  <Badge variant="outline">
                    -{reward.discountPercent}%
                  </Badge>
                )}
                {reward.discountAmount && (
                  <Badge variant="outline">
                    -{formatMoney(reward.discountAmount.amount, reward.discountAmount.currencyCode)}
                  </Badge>
                )}

                {reward.remainingRedemptions !== undefined && reward.remainingRedemptions !== null && (
                  <Badge variant="outline" className="text-xs">
                    Zostało: {reward.remainingRedemptions}
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              {!hasTierAccess ? (
                <Button variant="outline" className="w-full" disabled>
                  <Lock className="h-4 w-4 mr-2" />
                  Wymaga {reward.tierRequired}
                </Button>
              ) : !canAfford ? (
                <Button variant="outline" className="w-full" disabled>
                  Brakuje {formatNumber(reward.pointsCost - currentPoints)} pkt
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleRedeem(reward)}
                  disabled={redeemingId === reward.id || !reward.available}
                >
                  {redeemingId === reward.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Odbieranie...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Odbierz nagrodę
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
