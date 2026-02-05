'use client';

/**
 * TierBadge Component
 *
 * Displays loyalty tier badge with icon and name.
 */

import { Crown, Star, Gem, Award, Medal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type TierType = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

interface TierBadgeProps {
  tier?: TierType | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const tierConfig: Record<TierType, {
  icon: typeof Crown;
  bgColor: string;
  textColor: string;
  borderColor: string;
  label: string;
}> = {
  BRONZE: {
    icon: Medal,
    bgColor: 'bg-amber-100 dark:bg-amber-950',
    textColor: 'text-amber-800 dark:text-amber-200',
    borderColor: 'border-amber-300 dark:border-amber-700',
    label: 'Brąz',
  },
  SILVER: {
    icon: Award,
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-700 dark:text-gray-200',
    borderColor: 'border-gray-300 dark:border-gray-600',
    label: 'Srebro',
  },
  GOLD: {
    icon: Star,
    bgColor: 'bg-yellow-100 dark:bg-yellow-950',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    label: 'Złoto',
  },
  PLATINUM: {
    icon: Gem,
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-700 dark:text-slate-200',
    borderColor: 'border-slate-400 dark:border-slate-500',
    label: 'Platyna',
  },
  DIAMOND: {
    icon: Crown,
    bgColor: 'bg-cyan-100 dark:bg-cyan-950',
    textColor: 'text-cyan-800 dark:text-cyan-200',
    borderColor: 'border-cyan-300 dark:border-cyan-700',
    label: 'Diament',
  },
};

const defaultConfig = {
  icon: Award,
  bgColor: 'bg-purple-100 dark:bg-purple-950',
  textColor: 'text-purple-800 dark:text-purple-200',
  borderColor: 'border-purple-300 dark:border-purple-700',
  label: 'Niestandardowy',
};

export function TierBadge({ tier, name, size = 'md', className }: TierBadgeProps) {
  const config = tier ? tierConfig[tier] : defaultConfig;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 font-medium border',
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {name || config.label}
    </Badge>
  );
}
