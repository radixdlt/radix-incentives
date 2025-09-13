'use client';

import {
  BarChart3,
  ChevronDown,
  Coins,
  CreditCard,
  DollarSign,
  Droplet,
  Eye,
  FileText,
  Settings,
  TrendingUp,
  Trophy,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { usePersona } from '~/lib/hooks/usePersona';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/react';

interface EnhancedCategoryBreakdownProps {
  weekId: string;
}

type ViewMode = 'investment' | 'ap';

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

const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case 'lendingStables':
      return <Coins className="h-4 w-4" />;
    case 'maintainXrdBalance':
      return <Wallet className="h-4 w-4" />;
    case 'provideBlueChipLiquidityToDex':
    case 'provideNativeLiquidityToDex':
    case 'provideStablesLiquidityToDex':
    case 'provideXrdDerivativeLiquidityToDex':
      return <Droplet className="h-4 w-4" />;
    case 'lendingBlueChips':
    case 'lendingXrdDerivative':
      return <Coins className="h-4 w-4" />;
    case 'tradingVolume':
      return <TrendingUp className="h-4 w-4" />;
    case 'transactionFees':
      return <CreditCard className="h-4 w-4" />;
    case 'componentCalls':
      return <Settings className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const colorPalette = [
  { bg: 'bg-red-500', text: 'text-red-600' },
  { bg: 'bg-orange-500', text: 'text-orange-600' },
  { bg: 'bg-amber-500', text: 'text-amber-600' },
  { bg: 'bg-yellow-500', text: 'text-yellow-600' },
  { bg: 'bg-lime-500', text: 'text-lime-600' },
  { bg: 'bg-green-500', text: 'text-green-600' },
  { bg: 'bg-emerald-500', text: 'text-emerald-600' },
  { bg: 'bg-teal-500', text: 'text-teal-600' },
  { bg: 'bg-cyan-500', text: 'text-cyan-600' },
  { bg: 'bg-sky-500', text: 'text-sky-600' },
  { bg: 'bg-blue-500', text: 'text-blue-600' },
  { bg: 'bg-indigo-500', text: 'text-indigo-600' },
  { bg: 'bg-violet-500', text: 'text-violet-600' },
  { bg: 'bg-purple-500', text: 'text-purple-600' },
  { bg: 'bg-fuchsia-500', text: 'text-fuchsia-600' },
  { bg: 'bg-pink-500', text: 'text-pink-600' },
  { bg: 'bg-rose-500', text: 'text-rose-600' },
];

const getCategoryColor = (categoryId: string) => {
  // Create a simple hash from the categoryId to ensure consistent color assignment
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = ((hash << 5) - hash + categoryId.charCodeAt(i)) & 0xffffffff;
  }
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index] || { bg: 'bg-slate-500', text: 'text-slate-600' };
};

export function EnhancedCategoryBreakdown({
  weekId,
}: EnhancedCategoryBreakdownProps) {
  const persona = usePersona();
  const [viewMode, setViewMode] = useState<ViewMode>('ap');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(
    null,
  );

  // Get category breakdown for AP points
  const { data: categoryBreakdown = [], isLoading: breakdownLoading } =
    api.user.getUserCategoryBreakdown.useQuery(
      { weekId },
      { enabled: !!persona && !!weekId },
    );

  // Get categories with user investment data
  const { data: categoriesWithUserData = [], isLoading: categoriesLoading } =
    api.activity.getEarnPageCategoriesWithUserData.useQuery(undefined, {
      enabled: !!persona,
      retry: false,
    });

  if (!persona || !weekId) {
    return null;
  }

  const isLoading = breakdownLoading || categoriesLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">View:</span>
          <div className="flex gap-1">
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="animate-pulse">
              <div className="mb-4 h-6 w-1/3 rounded bg-gray-200" />
              <div className="h-8 w-full rounded bg-gray-200" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get all categories from both sources (show categories with 0 values too)
  const allCategories = categoriesWithUserData.map((category) => {
    const breakdownData = categoryBreakdown.find(
      (item) => item.categoryId === category.id,
    );
    return {
      id: category.id,
      name: category.name,
      points: breakdownData?.points || 0,
      userInvestment: category.userInvestment || 0,
      apPerHour: category.apPerHour || 0,
      // Mock ranking/percentile data - would come from proper API
      ranking: Math.floor(Math.random() * 1000) + 1,
      percentile: Math.floor(Math.random() * 100) + 1,
    };
  });

  // Calculate totals for the big progress bar
  const totalValue = allCategories.reduce(
    (sum, item) =>
      sum + (viewMode === 'ap' ? item.points : item.userInvestment),
    0,
  );

  // Sort by value (descending)
  const sortedData = [...allCategories].sort((a, b) => {
    const aValue = viewMode === 'ap' ? a.points : a.userInvestment;
    const bValue = viewMode === 'ap' ? b.points : b.userInvestment;
    return bValue - aValue;
  });

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const formatValue = (value: number) => {
    return viewMode === 'ap'
      ? `${value.toLocaleString()} AP`
      : formatCurrency(value);
  };

  return (
    <div className="space-y-4">
      {/* Toggle buttons outside the card - aligned right */}
      <div className="flex items-center justify-between">
        <div></div> {/* Spacer */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">View:</span>
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'ap' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('ap')}
              className="h-8 px-3 text-xs"
            >
              <BarChart3 className="mr-1 h-3 w-3" />
              AP
            </Button>
            <Button
              variant={viewMode === 'investment' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('investment')}
              className="h-8 px-3 text-xs"
            >
              <DollarSign className="mr-1 h-3 w-3" />
              Investment
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Activity Categories</CardTitle>

          {/* Big stacked progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Total</span>
              <span className="font-semibold">{formatValue(totalValue)}</span>
            </div>
            <div className="relative h-6 w-full overflow-hidden rounded-full bg-muted">
              <div className="flex h-6 w-full">
                {sortedData.map((category) => {
                  const value =
                    viewMode === 'ap'
                      ? category.points
                      : category.userInvestment;
                  const percentage =
                    totalValue > 0 ? (value / totalValue) * 100 : 0;
                  const colors = getCategoryColor(category.id);

                  if (percentage === 0) return null;

                  return (
                    <button
                      key={category.id}
                      className={cn(
                        'group relative h-6 cursor-pointer transition-all duration-300 border-0 p-0',
                        colors.bg,
                      )}
                      style={{ width: `${percentage}%` }}
                      onMouseEnter={() => setHighlightedCategory(category.id)}
                      onMouseLeave={() => setHighlightedCategory(null)}
                      onClick={() => toggleCategory(category.id)}
                      type="button"
                    >
                      <div className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 transform whitespace-nowrap rounded bg-black px-2 py-1 text-white text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        {category.name}: {formatValue(value)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            {sortedData.map((category) => {
              const value =
                viewMode === 'ap' ? category.points : category.userInvestment;
              const isExpanded = expandedCategories.has(category.id);
              const colors = getCategoryColor(category.id);

              return (
                <div
                  key={category.id}
                  className={cn(
                    'rounded-lg border transition-all duration-200',
                    highlightedCategory === category.id
                      ? 'bg-muted/70 shadow-md'
                      : 'hover:bg-muted/50',
                  )}
                >
                  <button
                    className="flex cursor-pointer items-center gap-2 p-2 border-0 bg-transparent w-full text-left"
                    onClick={() => toggleCategory(category.id)}
                    type="button"
                  >
                    <div className={cn('flex-shrink-0', colors.text)}>
                      {getCategoryIcon(category.id)}
                    </div>

                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="truncate pr-2 text-base">
                          {category.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {formatValue(value)}
                          </span>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 text-muted-foreground transition-transform duration-200',
                              isExpanded ? 'rotate-180' : 'rotate-0',
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </button>

                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-300 ease-in-out',
                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
                    )}
                  >
                    <div className="space-y-4 px-4 pt-2 pb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
                        <div className="space-y-1">
                          <div className="text-muted-foreground">AP</div>
                          <div className="font-semibold">
                            {category.points.toLocaleString()}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground">AP/hour</div>
                          <div className="font-semibold">
                            {formatAPPerHour(category.apPerHour)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground">
                            Investment
                          </div>
                          <div className="font-semibold">
                            {formatCurrency(category.userInvestment)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground">Placement</div>
                          <div className="font-semibold">
                            #{category.ranking} ({category.percentile}%)
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                        >
                          <Link href={`/dashboard/earn/${category.id}`}>
                            <Eye className="mr-1 h-3 w-3" />
                            Details
                          </Link>
                        </Button>
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
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
