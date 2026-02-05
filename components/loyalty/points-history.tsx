'use client';

/**
 * PointsHistory Component
 *
 * Displays loyalty points transaction history.
 */

import { ArrowUpCircle, ArrowDownCircle, Clock, Gift, ShoppingCart, UserPlus, Star, Cake, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type TransactionType =
  | 'EARN_PURCHASE'
  | 'EARN_SIGNUP'
  | 'EARN_REFERRAL'
  | 'EARN_REVIEW'
  | 'EARN_BIRTHDAY'
  | 'EARN_BONUS'
  | 'REDEEM'
  | 'EXPIRE'
  | 'ADJUST';

interface Transaction {
  id: string;
  type: TransactionType;
  points: number;
  balanceAfter: number;
  orderId?: string;
  description?: string;
  expiresAt?: string;
  createdAt: string;
}

interface PointsHistoryProps {
  transactions: Transaction[];
  className?: string;
}

const transactionConfig: Record<TransactionType, {
  label: string;
  icon: typeof ArrowUpCircle;
  color: string;
}> = {
  EARN_PURCHASE: {
    label: 'Zakup',
    icon: ShoppingCart,
    color: 'text-green-600',
  },
  EARN_SIGNUP: {
    label: 'Rejestracja',
    icon: UserPlus,
    color: 'text-green-600',
  },
  EARN_REFERRAL: {
    label: 'Polecenie',
    icon: Gift,
    color: 'text-green-600',
  },
  EARN_REVIEW: {
    label: 'Opinia',
    icon: Star,
    color: 'text-green-600',
  },
  EARN_BIRTHDAY: {
    label: 'Urodziny',
    icon: Cake,
    color: 'text-green-600',
  },
  EARN_BONUS: {
    label: 'Bonus',
    icon: Gift,
    color: 'text-green-600',
  },
  REDEEM: {
    label: 'Wymiana',
    icon: ArrowDownCircle,
    color: 'text-red-600',
  },
  EXPIRE: {
    label: 'Wygaśnięcie',
    icon: Clock,
    color: 'text-orange-600',
  },
  ADJUST: {
    label: 'Korekta',
    icon: AlertCircle,
    color: 'text-blue-600',
  },
};

export function PointsHistory({ transactions, className }: PointsHistoryProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pl-PL').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (transactions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Brak historii transakcji</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Historia punktów
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const config = transactionConfig[transaction.type];
            const Icon = config.icon;
            const isEarning = transaction.points > 0;

            return (
              <div
                key={transaction.id}
                className="flex items-center gap-4 py-3 border-b last:border-0"
              >
                <div className={cn('p-2 rounded-full bg-muted', config.color)}>
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{config.label}</span>
                    {transaction.orderId && (
                      <Badge variant="outline" className="text-xs">
                        #{transaction.orderId.slice(0, 8)}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {transaction.description || formatDate(transaction.createdAt)}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={cn(
                      'font-semibold',
                      isEarning ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {isEarning ? '+' : ''}{formatNumber(transaction.points)} pkt
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Saldo: {formatNumber(transaction.balanceAfter)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
