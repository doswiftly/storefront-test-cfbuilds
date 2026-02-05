'use client';

/**
 * ReferralSection Component
 *
 * Displays referral program information including:
 * - Referral code and share link
 * - Statistics (total referred, completed, pending)
 * - Points earned from referrals
 *
 * Requirements: R10.4 (Referral Program)
 */

import { useState } from 'react';
import { Users, Copy, Check, Share2, Gift, UserPlus, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ReferralStats {
  totalReferred: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
}

interface ReferralSectionProps {
  referralCode: string;
  shareUrl: string;
  stats: ReferralStats;
  pointsName?: string;
  referralPoints?: number;
  bonusPoints?: number;
  className?: string;
}

export function ReferralSection({
  referralCode,
  shareUrl,
  stats,
  pointsName = 'punktów',
  referralPoints = 0,
  bonusPoints = 0,
  className,
}: ReferralSectionProps) {
  const [copied, setCopied] = useState<'code' | 'url' | null>(null);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pl-PL').format(num);
  };

  const copyToClipboard = async (text: string, type: 'code' | 'url') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(type === 'code' ? 'Kod skopiowany!' : 'Link skopiowany!');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Nie udało się skopiować');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dołącz do programu lojalnościowego',
          text: `Zarejestruj się używając mojego kodu ${referralCode} i otrzymaj ${formatNumber(bonusPoints)} ${pointsName}!`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          toast.error('Nie udało się udostępnić');
        }
      }
    } else {
      // Fallback to copy URL
      copyToClipboard(shareUrl, 'url');
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Referral Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Twój kod polecający
          </CardTitle>
          <CardDescription>
            Podziel się tym kodem ze znajomymi. Gdy dokonają pierwszego zakupu, oboje
            otrzymacie punkty!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Referral Code */}
          <div className="flex gap-2">
            <Input
              value={referralCode}
              readOnly
              className="font-mono text-lg font-bold text-center tracking-wider"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(referralCode, 'code')}
            >
              {copied === 'code' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Share URL */}
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="text-sm text-muted-foreground"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(shareUrl, 'url')}
            >
              {copied === 'url' ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Share Button */}
          <Button onClick={handleShare} className="w-full">
            <Share2 className="h-4 w-4 mr-2" />
            Udostępnij znajomym
          </Button>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Jak to działa?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
              <div className="p-3 bg-primary/10 rounded-full mb-3">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-1">1. Udostępnij kod</h4>
              <p className="text-sm text-muted-foreground">
                Podziel się swoim kodem lub linkiem ze znajomymi
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
              <div className="p-3 bg-primary/10 rounded-full mb-3">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-1">2. Znajomy się rejestruje</h4>
              <p className="text-sm text-muted-foreground">
                Znajomy używa Twojego kodu przy rejestracji i dokonuje zakupu
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-muted/50 rounded-lg">
              <div className="p-3 bg-primary/10 rounded-full mb-3">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-medium mb-1">3. Oboje zyskujecie</h4>
              <p className="text-sm text-muted-foreground">
                Ty otrzymujesz {formatNumber(referralPoints)} {pointsName}, a znajomy{' '}
                {formatNumber(bonusPoints)} {pointsName}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Twoje statystyki poleceń
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">
                {formatNumber(stats.totalReferred)}
              </div>
              <div className="text-sm text-muted-foreground">Zaproszonych</div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(stats.completedReferrals)}
                </div>
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-sm text-muted-foreground">Zrealizowanych</div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1">
                <div className="text-2xl font-bold text-amber-600">
                  {formatNumber(stats.pendingReferrals)}
                </div>
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-sm text-muted-foreground">Oczekujących</div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">
                {formatNumber(stats.totalPointsEarned)}
              </div>
              <div className="text-sm text-muted-foreground">
                Zdobytych {pointsName}
              </div>
            </div>
          </div>

          {stats.pendingReferrals > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <Clock className="h-4 w-4 inline mr-1" />
                Masz {stats.pendingReferrals} oczekujących poleceń. Punkty zostaną
                przyznane po dokonaniu pierwszego zakupu przez poleconą osobę.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
