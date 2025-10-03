'use client';

import { ArrowLeft, TrendingUp, Wallet, Zap } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MetricCard, MultiplierModal } from '~/components/dashboard';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle } from '~/components/ui/card';
import { usePersona } from '~/lib/hooks/usePersona';
import { api } from '~/trpc/react';
import { ActivityBreakdown } from './components/ActivityBreakdown';

export default function CategoryDetailPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const { persona, isInitialized } = usePersona();
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [multiplierModalOpen, setMultiplierModalOpen] = useState(false);

  const { data: weeks } = api.week.getWeeks.useQuery();

  // Set default selected week to the most recent week when weeks data is loaded
  useEffect(() => {
    if (weeks && weeks.length > 0 && !selectedWeekId) {
      const sortedWeeks = [...weeks].sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );
      if (sortedWeeks[0]) {
        setSelectedWeekId(sortedWeeks[0].id);
      }
    }
  }, [weeks, selectedWeekId]);

  // Get category data from earn page endpoint
  const { data: earnPageData } = api.activityCategory.getEarnPageData.useQuery(
    { weekId: selectedWeekId },
    { enabled: !!selectedWeekId },
  );

  // Get user's capital at work data
  const { data: userCapitalData } = api.user.getUserCapitalAtWork.useQuery(
    { weekId: selectedWeekId },
    {
      enabled: isInitialized && !!selectedWeekId && !!persona,
    },
  );

  // Get multiplier data for maintainXrdBalance
  const { data: userMultiplier } = api.user.getMultiplierByUserId.useQuery(
    { weekId: selectedWeekId },
    {
      enabled:
        isInitialized &&
        !!selectedWeekId &&
        !!persona &&
        categoryId === 'maintainXrdBalance',
    },
  );

  // Find the specific category data
  const categoryData = earnPageData?.find((cat) => cat.id === categoryId);
  const categoryCapitalData = userCapitalData?.find(
    (data) => data.categoryId === categoryId,
  );

  if (!categoryData) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-xl">Category not found</h2>
          <p className="text-muted-foreground">
            The requested category could not be found.
          </p>
          <Link href="/dashboard/earn">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Earn
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Format currency values
  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return num < 1000 ? `$${num.toFixed(2)}` : `$${(num / 1000).toFixed(1)}k`;
  };

  const formatAPPerHour = (value: string | null) => {
    if (!value) return '0';
    const num = parseFloat(value);
    if (num === 0) return '0';
    return num < 0.01 ? '<0.01' : num.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/earn">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Earn
          </Button>
        </Link>
      </div>

      {/* Category Info Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{categoryData.name}</CardTitle>
              <p className="mt-2 text-muted-foreground">
                {categoryData.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categoryData.seasonPointsPerWeek != null &&
                categoryData.seasonPointsPerWeek > 0 && (
                  <Badge variant="outline">
                    {(categoryData.seasonPointsPerWeek / 1000).toLocaleString()}
                    k SP/week
                  </Badge>
                )}
              {categoryData.multiplier && (
                <Badge variant="default">Multiplier</Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {categoryId !== 'maintainXrdBalance' && (
          <MetricCard
            title="AP Earned So Far"
            value={
              persona && categoryCapitalData
                ? Math.round(
                    parseFloat(categoryCapitalData.earnedAP),
                  ).toLocaleString()
                : '-'
            }
            icon={TrendingUp}
            description="Activity Points earned this week"
            iconColor="text-green-500"
          />
        )}

        {!['transactionFees', 'tradingVolume', 'componentCalls'].includes(
          categoryId,
        ) && (
          <MetricCard
            title="Capital at Work"
            value={
              persona && categoryCapitalData
                ? formatCurrency(categoryCapitalData.capitalAtWork)
                : '-'
            }
            icon={Wallet}
            description="USD value contributing to this category"
            iconColor="text-blue-500"
          />
        )}

        {![
          'maintainXrdBalance',
          'transactionFees',
          'tradingVolume',
          'componentCalls',
        ].includes(categoryId) && (
          <MetricCard
            title="AP per Hour"
            value={
              persona && categoryCapitalData && categoryCapitalData.apPerHour
                ? formatAPPerHour(categoryCapitalData.apPerHour)
                : '-'
            }
            icon={Zap}
            description="Activity Points earned per hour"
            iconColor="text-amber-500"
          />
        )}

        {categoryId === 'maintainXrdBalance' && (
          <MetricCard
            title="Multiplier"
            value={
              persona && userMultiplier?.value
                ? Number(userMultiplier.value).toLocaleString()
                : '-'
            }
            icon={Zap}
            description="Current points multiplier"
            iconColor="text-amber-500"
            onClick={() => setMultiplierModalOpen(true)}
            clickHint="Click for details"
          />
        )}
      </div>

      {/* Activity Breakdown */}
      <ActivityBreakdown
        categoryId={categoryId}
        categoryData={categoryCapitalData}
        weekId={selectedWeekId}
        isAnonymous={!persona}
      />

      <MultiplierModal
        open={multiplierModalOpen}
        onOpenChange={setMultiplierModalOpen}
        multiplierValue={userMultiplier?.value || '0'}
      />
    </div>
  );
}
