'use client';

import {
  BarChart3,
  DollarSign,
  Eye,
  Percent,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { usePersona } from '~/lib/hooks/usePersona';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/react';

interface CategoryDashboardProps {
  weekId: string;
}

type SortBy = 'percentile' | 'ranking' | 'ap' | 'investment';

const getCategoryIcon = (categoryId: string) => {
  // This matches the logic from ActivityCardDynamic
  switch (categoryId) {
    case 'lendingStables':
      return <DollarSign className="h-5 w-5" />;
    case 'maintainXrdBalance':
      return <Trophy className="h-5 w-5" />;
    case 'provideBlueChipLiquidityToDex':
    case 'provideNativeLiquidityToDex':
    case 'provideStablesLiquidityToDex':
    case 'provideXrdDerivativeLiquidityToDex':
      return <BarChart3 className="h-5 w-5" />;
    case 'lendingBlueChips':
    case 'lendingXrdDerivative':
      return <DollarSign className="h-5 w-5" />;
    case 'tradingVolume':
      return <TrendingUp className="h-5 w-5" />;
    case 'transactionFees':
      return <DollarSign className="h-5 w-5" />;
    case 'componentCalls':
      return <BarChart3 className="h-5 w-5" />;
    default:
      return <BarChart3 className="h-5 w-5" />;
  }
};

const getCategoryColor = (categoryId: string) => {
  // This matches the logic from ActivityCardDynamic
  switch (categoryId) {
    case 'lendingStables':
      return 'text-green-600';
    case 'maintainXrdBalance':
      return 'text-blue-600';
    case 'provideBlueChipLiquidityToDex':
      return 'text-purple-600';
    case 'provideNativeLiquidityToDex':
      return 'text-cyan-600';
    case 'provideStablesLiquidityToDex':
      return 'text-emerald-600';
    case 'provideXrdDerivativeLiquidityToDex':
      return 'text-cyan-600';
    case 'lendingBlueChips':
      return 'text-green-600';
    case 'lendingXrdDerivative':
      return 'text-green-600';
    case 'tradingVolume':
      return 'text-orange-600';
    case 'transactionFees':
      return 'text-red-600';
    case 'componentCalls':
      return 'text-gray-600';
    default:
      return 'text-slate-600';
  }
};

const formatCurrency = (value: number) => {
  if (value === 0) return '$0';
  if (value < 0.01) return '<$0.01';
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatAPPerHour = (value: number) => {
  if (value === 0) return '0 AP/h';
  if (value < 0.01) return '<0.01 AP/h';
  return `${value.toFixed(2)} AP/h`;
};

export function CategoryDashboard({ weekId }: CategoryDashboardProps) {
  const persona = usePersona();
  const [sortBy, setSortBy] = useState<SortBy>('percentile');

  // Get categories with user data (investment, AP/hour)
  const { data: categoriesWithUserData = [], isLoading } =
    api.activity.getEarnPageCategoriesWithUserData.useQuery(undefined, {
      enabled: !!persona,
      retry: false,
    });

  // Get user's category breakdown for AP points
  const { data: categoryBreakdown = [] } =
    api.user.getUserCategoryBreakdown.useQuery(
      { weekId },
      { enabled: !!persona && !!weekId },
    );

  if (!persona || !weekId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-2xl">Activity Categories</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-3/4 rounded bg-gray-200" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 rounded bg-gray-200" />
                  <div className="h-3 w-2/3 rounded bg-gray-200" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Combine the data sources
  const combinedCategories = categoriesWithUserData.map((category) => {
    const breakdownData = categoryBreakdown.find(
      (item) => item.categoryId === category.id,
    );

    return {
      id: category.id,
      name: category.name,
      description: category.description,
      userInvestment: category.userInvestment || 0,
      apPerHour: category.apPerHour || 0,
      activityPoints: breakdownData?.points || 0,
      // Mock data for ranking and percentile - in a real implementation,
      // these would come from a leaderboard API
      ranking: Math.floor(Math.random() * 1000) + 1, // TODO: Get from API
      percentile: Math.floor(Math.random() * 100) + 1, // TODO: Get from API
    };
  });

  // Sort the categories
  const sortedCategories = [...combinedCategories].sort((a, b) => {
    switch (sortBy) {
      case 'percentile':
        return b.percentile - a.percentile;
      case 'ranking':
        return a.ranking - b.ranking; // Lower ranking number is better
      case 'ap':
        return b.activityPoints - a.activityPoints;
      case 'investment':
        return b.userInvestment - a.userInvestment;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-bold text-2xl">Activity Categories</h2>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Sort by:</span>
          <Select
            value={sortBy}
            onValueChange={(value: SortBy) => setSortBy(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentile">Percentile</SelectItem>
              <SelectItem value="ranking">Ranking</SelectItem>
              <SelectItem value="ap">Activity Points</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedCategories.map((category) => (
          <Card key={category.id} className="transition-shadow hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'rounded-lg bg-muted p-2',
                      getCategoryColor(category.id),
                    )}
                  >
                    {getCategoryIcon(category.id)}
                  </div>
                  <div>
                    <CardTitle className="line-clamp-2 text-lg">
                      {category.name}
                    </CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Ranking</div>
                  <div className="font-semibold">#{category.ranking}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Percentile</div>
                  <div className="flex items-center gap-1 font-semibold">
                    <Percent className="h-3 w-3" />
                    {category.percentile}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Activity Points</div>
                  <div className="font-semibold">
                    {category.activityPoints.toLocaleString()} AP
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">AP/hour</div>
                  <div className="font-semibold">
                    {formatAPPerHour(category.apPerHour)}
                  </div>
                </div>
              </div>

              {/* Investment */}
              <div className="space-y-1">
                <div className="text-muted-foreground text-sm">
                  Your Investment
                </div>
                <div className="font-semibold">
                  {formatCurrency(category.userInvestment)}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <Link
                    href={`/dashboard/leaderboard?category=${category.id}&week=${weekId}`}
                  >
                    <Trophy className="mr-1 h-3 w-3" />
                    Leaderboard
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                >
                  <Link href={`/dashboard/earn/${category.id}`}>
                    <Eye className="mr-1 h-3 w-3" />
                    Earn
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
