'use client';

/**
 * TierProgress Component
 *
 * Shows progress towards next loyalty tier.
 */

import { TrendingUp, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TierBadge } from './tier-badge';
import { cn } from '@/lib/utils';

type TierType = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

interface CustomBenefit {
  name: string;
  description?: string | null;
  icon?: string | null;
}

interface Tier {
  id: string;
  name: string;
  type?: TierType | null;
  minPoints: number;
  pointsMultiplier: number;
  customBenefits?: CustomBenefit[];
}

interface TierProgressData {
  currentTier: Tier;
  nextTier?: Tier;
  pointsToNextTier: number;
  progressPercent: number;
  spendToNextTier?: {
    amount: string;
    currencyCode: string;
  };
}

interface TierProgressProps {
  progress: TierProgressData;
  className?: string;
}

// Simple Progress component fallback
const ProgressBar = typeof Progress === 'undefined'
  ? ({ value, className }: { value: number; className?: string }) => (
      <div className={cn('h-2 bg-muted rounded-full overflow-hidden', className)}>
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    )
  : Progress;

export function TierProgress({ progress, className }: TierProgressProps) {
  const { currentTier, nextTier, pointsToNextTier, progressPercent } = progress;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pl-PL').format(num);
  };

  const formatMoney = (amount: string, currency: string) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency,
    }).format(parseFloat(amount));
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Postęp poziomu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TierBadge tier={currentTier.type} name={currentTier.name} />
            <span className="text-sm text-muted-foreground">Twój poziom</span>
          </div>
          {nextTier && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Następny:</span>
              <TierBadge tier={nextTier.type} name={nextTier.name} />
            </div>
          )}
        </div>

        {nextTier ? (
          <>
            <ProgressBar value={progressPercent} className="h-3 mb-3" />
            <p className="text-sm text-muted-foreground">
              Potrzebujesz jeszcze{' '}
              <span className="font-semibold text-foreground">
                {formatNumber(pointsToNextTier)} punktów
              </span>{' '}
              do poziomu {nextTier.name}
            </p>

            {/* Next tier benefits preview */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                Odblokujesz na poziomie {nextTier.name}:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {nextTier.pointsMultiplier > 1 && (
                  <li>• Mnożnik punktów x{nextTier.pointsMultiplier}</li>
                )}
                {nextTier.customBenefits?.map((benefit, idx) => (
                  <li key={idx}>• {benefit.name}</li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            🎉 Gratulacje! Osiągnąłeś najwyższy poziom!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
