'use client';

/**
 * ReviewSummary Component
 *
 * Displays product review statistics with rating breakdown.
 */

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewStats {
  totalCount: number;
  averageRating: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
}

interface ReviewSummaryProps {
  stats: ReviewStats;
  className?: string;
}

export function ReviewSummary({ stats, className }: ReviewSummaryProps) {
  const {
    totalCount,
    averageRating,
    fiveStarCount,
    fourStarCount,
    threeStarCount,
    twoStarCount,
    oneStarCount,
  } = stats;

  const ratingBars = [
    { stars: 5, count: fiveStarCount },
    { stars: 4, count: fourStarCount },
    { stars: 3, count: threeStarCount },
    { stars: 2, count: twoStarCount },
    { stars: 1, count: oneStarCount },
  ];

  return (
    <div className={cn('flex flex-col sm:flex-row gap-6', className)}>
      {/* Average Rating */}
      <div className="flex flex-col items-center justify-center text-center min-w-32">
        <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
        <StarRating rating={averageRating} size="lg" className="mt-2" />
        <p className="text-sm text-muted-foreground mt-1">
          {totalCount} {totalCount === 1 ? 'opinia' : totalCount < 5 ? 'opinie' : 'opinii'}
        </p>
      </div>

      {/* Rating Distribution */}
      <div className="flex-1 space-y-2">
        {ratingBars.map(({ stars, count }) => {
          const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
          return (
            <div key={stars} className="flex items-center gap-2">
              <span className="text-sm w-4 text-muted-foreground">{stars}</span>
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm w-8 text-muted-foreground text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * StarRating Component - Displays star rating
 */
interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showValue?: boolean;
}

export function StarRating({
  rating,
  size = 'md',
  className,
  showValue = false,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.floor(rating);
    const partial = !filled && i === Math.ceil(rating) && rating % 1 !== 0;

    stars.push(
      <span key={i} className="relative">
        <Star
          className={cn(
            sizeClasses[size],
            'text-yellow-400',
            filled ? 'fill-yellow-400' : 'fill-muted'
          )}
        />
        {partial && (
          <Star
            className={cn(
              sizeClasses[size],
              'absolute inset-0 fill-yellow-400 text-yellow-400'
            )}
            style={{
              clipPath: `inset(0 ${100 - (rating % 1) * 100}% 0 0)`,
            }}
          />
        )}
      </span>
    );
  }

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {stars}
      {showValue && (
        <span className="ml-1 text-sm text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
