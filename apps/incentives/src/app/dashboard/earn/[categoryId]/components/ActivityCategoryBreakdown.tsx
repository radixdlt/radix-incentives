'use client';

import {
  ChevronDown,
  Coins,
  CreditCard,
  Droplet,
  ExternalLink,
  FileText,
  Settings,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/lib/utils';

interface ActivityCategoryBreakdownProps {
  items: Array<{
    id: string;
    name: string;
    description?: string;
    userInvestment: number;
    apPerHour: number;
    dapp?: {
      name: string;
      website?: string;
      logoFileName?: string;
    };
  }>;
  title: string;
}

const getCategoryIcon = (categoryId: string) => {
  // Extract the base category from activity IDs
  if (
    categoryId.includes('lendingStables') ||
    categoryId.includes('_lend_stable')
  ) {
    return <Coins className="h-4 w-4" />;
  }
  if (
    categoryId.includes('maintainXrdBalance') ||
    categoryId.includes('_ho_')
  ) {
    return <Wallet className="h-4 w-4" />;
  }
  if (categoryId.includes('LiquidityToDex') || categoryId.includes('_lp_')) {
    return <Droplet className="h-4 w-4" />;
  }
  if (
    categoryId.includes('lendingBlueChips') ||
    categoryId.includes('lendingXrdDerivative') ||
    categoryId.includes('_lend_')
  ) {
    return <Coins className="h-4 w-4" />;
  }
  if (categoryId.includes('tradingVolume') || categoryId.includes('_trade')) {
    return <TrendingUp className="h-4 w-4" />;
  }
  if (categoryId.includes('transactionFees') || categoryId.includes('_fee')) {
    return <CreditCard className="h-4 w-4" />;
  }
  if (categoryId.includes('componentCalls') || categoryId.includes('_call')) {
    return <Settings className="h-4 w-4" />;
  }
  return <FileText className="h-4 w-4" />;
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

const getCategoryColor = (categoryId: string, allIds: string[]) => {
  // If we have fewer items than colors, distribute them evenly to avoid duplicates
  if (allIds.length <= colorPalette.length) {
    const index = allIds.indexOf(categoryId);
    if (index !== -1) {
      // Space out the colors evenly
      const colorIndex = Math.floor(
        (index * colorPalette.length) / allIds.length,
      );
      return (
        colorPalette[colorIndex] || {
          bg: 'bg-slate-500',
          text: 'text-slate-600',
        }
      );
    }
  }

  // Fallback to hash-based assignment for larger lists
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = ((hash << 5) - hash + categoryId.charCodeAt(i)) & 0xffffffff;
  }
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index] || { bg: 'bg-slate-500', text: 'text-slate-600' };
};

export function ActivityCategoryBreakdown({
  items,
  title,
}: ActivityCategoryBreakdownProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(
    null,
  );

  // Calculate total for percentage calculations (using userInvestment)
  const totalValue = items.reduce((sum, item) => sum + item.userInvestment, 0);

  // Sort by user investment (descending)
  const sortedData = [...items].sort(
    (a, b) => b.userInvestment - a.userInvestment,
  );

  // Get all IDs for color distribution
  const allIds = sortedData.map((item) => item.id);

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

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>

        {/* Big stacked progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Total</span>
            <span className="font-semibold">{formatCurrency(totalValue)}</span>
          </div>
          <div className="relative h-6 w-full overflow-hidden rounded-full bg-muted">
            <div className="flex h-6 w-full">
              {sortedData.map((item) => {
                const percentage =
                  totalValue > 0 ? (item.userInvestment / totalValue) * 100 : 0;
                const colors = getCategoryColor(item.id, allIds);

                if (percentage === 0) return null;

                return (
                  <button
                    key={item.id}
                    className={cn(
                      'group relative h-6 cursor-pointer transition-all duration-300 border-0 p-0',
                      colors.bg,
                    )}
                    style={{ width: `${percentage}%` }}
                    onMouseEnter={() => setHighlightedCategory(item.id)}
                    onMouseLeave={() => setHighlightedCategory(null)}
                    onClick={() => toggleCategory(item.id)}
                    type="button"
                  >
                    <div className="-translate-x-1/2 pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 transform whitespace-nowrap rounded bg-black px-2 py-1 text-white text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      {item.name}: {formatCurrency(item.userInvestment)}
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
          {sortedData.map((item) => {
            const isExpanded = expandedCategories.has(item.id);
            const colors = getCategoryColor(item.id, allIds);

            return (
              <div
                key={item.id}
                className={cn(
                  'rounded-lg border transition-all duration-200',
                  highlightedCategory === item.id
                    ? 'bg-muted/70 shadow-md'
                    : 'hover:bg-muted/50',
                )}
              >
                <button
                  className="flex cursor-pointer items-center gap-2 p-2 border-0 bg-transparent w-full text-left"
                  onClick={() => toggleCategory(item.id)}
                  type="button"
                >
                  <div className={cn('flex-shrink-0', colors.text)}>
                    {getCategoryIcon(item.id)}
                  </div>

                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center justify-between">
                      <span className="truncate pr-2 text-base">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {formatCurrency(item.userInvestment)}
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
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div className="space-y-1">
                        <div className="text-muted-foreground">
                          Dollar Contribution
                        </div>
                        <div className="font-semibold">
                          {formatCurrency(item.userInvestment)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground">AP/hour</div>
                        <div className="font-semibold">
                          {formatAPPerHour(item.apPerHour)}
                        </div>
                      </div>
                    </div>

                    {item.description && (
                      <div className="text-muted-foreground text-sm">
                        {item.description}
                      </div>
                    )}

                    {/* dApp Information and Button */}
                    {item.dapp && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">
                            Available on:
                          </span>
                          <div className="relative h-6 w-6 overflow-hidden rounded-full border bg-white">
                            {item.dapp.logoFileName ? (
                              <Image
                                src={`/dapp-logos/${item.dapp.logoFileName}`}
                                alt={`${item.dapp.name} logo`}
                                fill
                                className="object-contain"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gray-100 font-medium text-gray-500 text-xs">
                                {(item.dapp.name || 'DApp')
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-sm">
                            {item.dapp.name}
                          </span>
                        </div>

                        {item.dapp.website && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                          >
                            <a
                              href={item.dapp.website}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="mr-1 h-3 w-3" />
                              Visit {item.dapp.name}
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
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
