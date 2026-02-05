'use client';

/**
 * PointsBalance Component
 *
 * Displays current loyalty points balance with expiring points warning.
 */

import { Coins, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PointsSummary {
  totalPoints: number;
  currentPoints: number;
  pendingPoints: number;
  redeemedPoints: number;
  expiredPoints: number;
  expiringPoints?: number;
  nextExpiryDate?: string;
}

interface PointsBalanceProps {
  points: PointsSummary;
  variant?: 'default' | 'compact';
  className?: string;
}

export function PointsBalance({ points, variant = 'default', className }: PointsBalanceProps) {
  const {
    currentPoints,
    pendingPoints,
    expiringPoints,
    nextExpiryDate,
  } = points;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pl-PL').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pl-PL', {
      day: 'numeric',
      month: 'long',
    }).format(new Date(dateString));
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Coins className="h-5 w-5 text-yellow-500" />
        <span className="font-bold text-lg">{formatNumber(currentPoints)}</span>
        <span className="text-muted-foreground">pkt</span>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          Twoje punkty
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold mb-2">
          {formatNumber(currentPoints)}
          <span className="text-lg font-normal text-muted-foreground ml-2">pkt</span>
        </div>

        {pendingPoints > 0 && (
          <p className="text-sm text-muted-foreground mb-2">
            + {formatNumber(pendingPoints)} pkt oczekujących
          </p>
        )}

        {expiringPoints && expiringPoints > 0 && nextExpiryDate && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-semibold">{formatNumber(expiringPoints)} pkt</span>{' '}
                wygaśnie {formatDate(nextExpiryDate)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
