'use client';

/**
 * Loyalty Dashboard Page
 *
 * Displays customer loyalty program information including:
 * - Current tier and points balance
 * - Progress towards next tier
 * - Available rewards to redeem
 * - Points transaction history
 * - Referral program (if enabled)
 *
 * Integrates with GraphQL API via commerce-sdk hooks.
 * Requirements: R7, R8, R10.4
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gift, Award, History, Loader2, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TierBadge } from '@/components/loyalty/tier-badge';
import { PointsBalance } from '@/components/loyalty/points-balance';
import { TierProgress } from '@/components/loyalty/tier-progress';
import { RewardsCatalog } from '@/components/loyalty/rewards-catalog';
import { PointsHistory } from '@/components/loyalty/points-history';
import { ReferralSection } from '@/components/loyalty/referral-section';
import { useAuth } from '@doswiftly/commerce-sdk/graphql/react';

// Type imports - these match the GraphQL schema
type TierType = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

interface CustomBenefit {
  name: string;
  description?: string | null;
  icon?: string | null;
}

interface LoyaltyTier {
  id: string;
  name: string;
  type?: TierType | null;
  minPoints: number;
  minAnnualSpend?: { amount: string; currencyCode: string } | null;
  pointsMultiplier: number;
  customBenefits: CustomBenefit[];
}

interface PointsSummary {
  totalPoints: number;
  currentPoints: number;
  pendingPoints: number;
  redeemedPoints: number;
  expiredPoints: number;
  expiringPoints?: number;
  nextExpiryDate?: string;
}

interface TierProgressData {
  currentTier: LoyaltyTier;
  nextTier?: LoyaltyTier;
  pointsToNextTier: number;
  progressPercent: number;
  spendToNextTier?: { amount: string; currencyCode: string };
}

interface LoyaltyMember {
  id: string;
  customerId: string;
  points: PointsSummary;
  tier?: LoyaltyTier;
  tierProgress?: TierProgressData;
  annualSpend: { amount: string; currencyCode: string };
  lastActivityAt?: string;
  enrolledAt: string;
}

interface LoyaltyReward {
  id: string;
  name: string;
  slug: string;
  type: string;
  pointsCost: number;
  discountPercent?: number | null;
  discountAmount?: { amount: string; currencyCode: string } | null;
  description?: string | null;
  image?: { url: string; altText?: string | null } | null;
  available: boolean;
  tierRequired?: LoyaltyTier | null;
  remainingRedemptions?: number | null;
}

interface LoyaltyTransaction {
  id: string;
  type: string;
  points: number;
  balanceAfter: number;
  orderId?: string;
  description?: string;
  expiresAt?: string;
  createdAt: string;
}

interface LoyaltySettings {
  enabled: boolean;
  pointsName: string;
  pointsPerCurrency: number;
  pointsExpiryMonths?: number;
  referralEnabled: boolean;
  referralPoints?: number;
  referralBonusPoints?: number;
}

interface ReferralStats {
  referralCode: string;
  shareUrl: string;
  totalReferred: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
}

// Real hooks from generated GraphQL
import {
  useLoyaltyMember,
  useLoyaltyRewards,
  useLoyaltyTransactions,
  useLoyaltySettings,
  useReferralStats,
  useRedeemLoyaltyReward,
} from '@/lib/graphql/hooks';

export default function LoyaltyPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const { isAuthenticated } = useAuth();

  // Fetch loyalty data using real GraphQL hooks
  const { data: memberData, isLoading: memberLoading } = useLoyaltyMember();
  const { data: rewardsData, isLoading: rewardsLoading } = useLoyaltyRewards();
  const { data: transactionsData } = useLoyaltyTransactions({ first: 20 });
  const { data: settingsData } = useLoyaltySettings();
  const { data: referralData } = useReferralStats();
  const redeemMutation = useRedeemLoyaltyReward();

  // Extract data from query responses
  const member = memberData?.loyaltyMember;
  const rewards = rewardsData?.loyaltyRewards ?? [];
  const transactions = transactionsData?.loyaltyTransactions?.edges?.map((e: any) => e.node) ?? [];
  const settings = settingsData?.loyaltySettings;
  const referralStats = referralData?.referralStats;

  const isLoading = memberLoading || rewardsLoading;

  // Check if program is disabled
  const programDisabled = settings && !settings.enabled;

  // Handle reward redemption
  // Returns the resulting code (discount, product discount, or gift card)
  const handleRedeemReward = async (rewardId: string) => {
    try {
      const result = await redeemMutation.mutateAsync({ input: { rewardId } });
      const payload = result.redeemLoyaltyReward;

      if (payload?.userErrors?.length) {
        throw new Error(payload.userErrors[0]);
      }

      if (payload?.success) {
        // Return all possible code types
        return {
          discountCode: payload.discountCode,
          productDiscountCode: payload.productDiscountCode,
          giftCardCode: payload.giftCardCode,
        };
      }

      throw new Error('Nie udało się wymienić nagrody');
    } catch (error) {
      throw error;
    }
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container max-w-6xl py-8">
        <Link href="/account">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót do konta
          </Button>
        </Link>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Program lojalnościowy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Zaloguj się, aby zobaczyć swoje punkty i nagrody.
            </p>
            <Link href="/auth/login?redirect=/account/loyalty">
              <Button className="w-full">Zaloguj się</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Show disabled program message
  if (programDisabled) {
    return (
      <div className="container max-w-6xl py-8">
        <Link href="/account">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót do konta
          </Button>
        </Link>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Program lojalnościowy jest obecnie niedostępny. Sprawdź ponownie później.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show message if not enrolled
  if (!member) {
    return (
      <div className="container max-w-6xl py-8">
        <Link href="/account">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót do konta
          </Button>
        </Link>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Dołącz do programu lojalnościowego
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Zbieraj punkty za zakupy i wymieniaj je na nagrody! Zapisanie jest automatyczne
              przy pierwszym zakupie.
            </p>
            <Link href="/products">
              <Button className="w-full">Przeglądaj produkty</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Map tier data for components
  const tierData = member.tier
    ? {
        id: member.tier.id,
        name: member.tier.name,
        type: member.tier.type,
        minPoints: member.tier.minPoints,
        pointsMultiplier: member.tier.pointsMultiplier,
        customBenefits: member.tier.customBenefits ?? [],
      }
    : null;

  const progressData = member.tierProgress
    ? {
        currentTier: {
          id: member.tierProgress.currentTier.id,
          name: member.tierProgress.currentTier.name,
          type: member.tierProgress.currentTier.type,
          minPoints: member.tierProgress.currentTier.minPoints,
          pointsMultiplier: member.tierProgress.currentTier.pointsMultiplier,
          customBenefits: member.tierProgress.currentTier.customBenefits ?? [],
        },
        nextTier: member.tierProgress.nextTier
          ? {
              id: member.tierProgress.nextTier.id,
              name: member.tierProgress.nextTier.name,
              type: member.tierProgress.nextTier.type,
              minPoints: member.tierProgress.nextTier.minPoints,
              pointsMultiplier: member.tierProgress.nextTier.pointsMultiplier,
              customBenefits: member.tierProgress.nextTier.customBenefits ?? [],
            }
          : undefined,
        pointsToNextTier: member.tierProgress.pointsToNextTier,
        progressPercent: member.tierProgress.progressPercent,
      }
    : null;

  // Check if referral tab should be shown
  const showReferralTab = settings?.referralEnabled && referralStats;

  return (
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/account">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót do konta
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Program lojalnościowy</h1>
            <p className="text-muted-foreground">
              Zbieraj {settings?.pointsName ?? 'punkty'} i wymieniaj je na nagrody
            </p>
          </div>
          {tierData && <TierBadge tier={tierData.type} name={tierData.name} size="lg" />}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="gap-2">
            <Award className="h-4 w-4" />
            Przegląd
          </TabsTrigger>
          <TabsTrigger value="rewards" className="gap-2">
            <Gift className="h-4 w-4" />
            Nagrody
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Historia
          </TabsTrigger>
          {showReferralTab && (
            <TabsTrigger value="referral" className="gap-2">
              <Users className="h-4 w-4" />
              Polecenia
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PointsBalance points={member.points} />
            {progressData && <TierProgress progress={progressData} />}
          </div>

          {/* Tier Benefits */}
          {tierData && (
            <div className="p-6 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-600" />
                Twoje korzyści na poziomie {tierData.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                  <div className="font-medium">Mnożnik punktów</div>
                  <div className="text-2xl font-bold text-amber-600">x{tierData.pointsMultiplier}</div>
                </div>
                {tierData.customBenefits.slice(0, 2).map((benefit, idx) => (
                  <div key={idx} className="p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                    <div className="font-medium">{benefit.name}</div>
                    {benefit.description && (
                      <div className="text-sm text-amber-600">{benefit.description}</div>
                    )}
                  </div>
                ))}
              </div>
              {tierData.customBenefits.length > 2 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tierData.customBenefits.slice(2).map((benefit, idx) => (
                    <div key={idx} className="px-3 py-1.5 bg-white/50 dark:bg-black/20 rounded-full text-sm">
                      {benefit.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setActiveTab('rewards')}>
              <Gift className="h-4 w-4 mr-2" />
              Przeglądaj nagrody
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('history')}>
              <History className="h-4 w-4 mr-2" />
              Zobacz historię
            </Button>
            {showReferralTab && (
              <Button variant="outline" onClick={() => setActiveTab('referral')}>
                <Users className="h-4 w-4 mr-2" />
                Poleć znajomego
              </Button>
            )}
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Dostępne nagrody</h2>
            <p className="text-muted-foreground">
              Wymień swoje {settings?.pointsName ?? 'punkty'} na atrakcyjne nagrody
            </p>
          </div>
          <RewardsCatalog
            rewards={rewards.map((r) => ({
              ...r,
              discountAmount: r.discountAmount
                ? { amount: r.discountAmount.amount, currencyCode: r.discountAmount.currencyCode }
                : undefined,
              // Map tierRequired from LoyaltyTier object to just the type string
              tierRequired: r.tierRequired?.type,
            }))}
            currentPoints={member.points.currentPoints}
            currentTier={member.tier?.type}
            onRedeem={handleRedeemReward}
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Historia punktów</h2>
            <p className="text-muted-foreground">Przegląd wszystkich transakcji punktowych</p>
          </div>
          <PointsHistory transactions={transactions} />
        </TabsContent>

        {/* Referral Tab */}
        {showReferralTab && referralStats && (
          <TabsContent value="referral">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Poleć znajomego</h2>
              <p className="text-muted-foreground">
                Zaproś znajomych i otrzymaj {settings?.referralPoints ?? 0}{' '}
                {settings?.pointsName ?? 'punktów'} za każde polecenie
              </p>
            </div>
            <ReferralSection
              referralCode={referralStats.referralCode}
              shareUrl={referralStats.shareUrl}
              stats={{
                totalReferred: referralStats.totalReferred,
                completedReferrals: referralStats.completedReferrals,
                pendingReferrals: referralStats.pendingReferrals,
                totalPointsEarned: referralStats.totalPointsEarned,
              }}
              pointsName={settings?.pointsName ?? 'punktów'}
              referralPoints={settings?.referralPoints ?? 0}
              bonusPoints={settings?.referralBonusPoints ?? 0}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
