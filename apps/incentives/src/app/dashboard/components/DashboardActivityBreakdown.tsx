'use client';

import { List, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  BreakdownProgressBar,
  createActivityStats,
  ExpandableItemList,
  SortButtons,
  type SortBy,
  StatsGrid,
} from '~/components/breakdown';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  cn,
  EXCLUDED_CATEGORIES,
  earnsActivityPoints,
  formatActivityPoints,
  formatCurrency,
  getIcon,
  hasCapitalAtWork,
  isMaintainXrdBalance,
} from '~/lib/utils';
import { api } from '~/trpc/react';

type ActivityBreakdownData = {
  activityId: string;
  activityName?: string | null;
  capitalAtWork: string;
  earnedAP: string;
  apPerHour: string | null;
  dapp: {
    id: string;
    name: string;
    website: string;
  } | null;
};

type CategoryCapitalData = {
  categoryId: string;
  capitalAtWork: string;
  earnedAP: string;
  apPerHour: string | null;
  activities: ActivityBreakdownData[];
};

interface DashboardActivityBreakdownProps {
  weekId: string;
  isAnonymous?: boolean;
  multiplierData?: { value: string } | null;
}

export function DashboardActivityBreakdown({
  weekId,
  isAnonymous = false,
  multiplierData,
}: DashboardActivityBreakdownProps) {
  const [sortBy, setSortBy] = useState<SortBy>('earnedAP');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);

  // Get capital at work data for all categories (authenticated or anonymous)
  const { data: userCapitalData } = isAnonymous
    ? api.user.getAnonymousCapitalAtWork.useQuery(
        { weekId },
        {
          enabled: !!weekId,
        },
      )
    : api.user.getUserCapitalAtWork.useQuery(
        { weekId },
        {
          enabled: !!weekId,
        },
      );

  // Get category names from earn page data
  const { data: earnPageData } = api.activityCategory.getEarnPageData.useQuery(
    { weekId },
    { enabled: !!weekId },
  );

  // Filter out unwanted categories
  const filteredCategories = (userCapitalData || []).filter(
    (category) =>
      !EXCLUDED_CATEGORIES.includes(
        category.categoryId as (typeof EXCLUDED_CATEGORIES)[number],
      ),
  );

  const categories = filteredCategories;

  // Create mapping from category ID to category info
  const categoryInfoMap = new Map(
    earnPageData?.map((cat) => [cat.id, cat]) || [],
  );

  // Get category data (color and icon) from earn page data
  const getCategoryData = (categoryId: string) => {
    const categoryInfo = categoryInfoMap.get(categoryId);
    return {
      colorClasses: categoryInfo?.color || 'bg-primary/10 text-white',
      icon: categoryInfo?.icon,
      name: categoryInfo?.name || categoryId,
    };
  };

  // Extract actual colors from CSS classes for progress bar
  const getProgressBarColor = (categoryId: string) => {
    const { colorClasses } = getCategoryData(categoryId);

    // Map common Tailwind background colors to HSL values
    const colorMap: Record<string, string> = {
      'bg-primary': 'hsl(222.2, 84%, 4.9%)',
      'bg-green': 'hsl(142.1, 76.2%, 36.3%)',
      'bg-blue': 'hsl(221.2, 83.2%, 53.3%)',
      'bg-amber': 'hsl(32.6, 95.8%, 58%)',
      'bg-purple': 'hsl(271.5, 81.3%, 55.9%)',
      'bg-red': 'hsl(346.8, 77.2%, 49.8%)',
      'bg-orange': 'hsl(24.6, 95%, 53.1%)',
      'bg-pink': 'hsl(300, 76%, 72%)',
      'bg-cyan': 'hsl(188.7, 94.5%, 42.7%)',
      'bg-yellow': 'hsl(47.9, 95.8%, 53.1%)',
      'bg-lime': 'hsl(83.7, 80.5%, 44.3%)',
      'bg-emerald': 'hsl(156.2, 81.5%, 46.9%)',
      'bg-teal': 'hsl(170.6, 76.2%, 42.2%)',
      'bg-sky': 'hsl(198.4, 93.2%, 59.6%)',
      'bg-indigo': 'hsl(239.4, 84.2%, 67.1%)',
      'bg-violet': 'hsl(262.1, 83.3%, 57.8%)',
      'bg-fuchsia': 'hsl(292.2, 84.1%, 60.6%)',
      'bg-rose': 'hsl(351.3, 82.7%, 67.1%)',
    };

    // Extract the base color from the classes
    for (const [bgClass, color] of Object.entries(colorMap)) {
      if (colorClasses.includes(bgClass)) {
        return color;
      }
    }

    // Fallback to a default color
    return 'hsl(222.2, 84%, 4.9%)'; // primary color
  };

  // Create gradient for progress bar segments
  const getProgressBarGradient = (categoryId: string) => {
    const baseColor = getProgressBarColor(categoryId);

    // Parse HSL values to create a darker version
    const hslMatch = baseColor.match(
      /hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/,
    );
    if (hslMatch) {
      const [, h, s, l] = hslMatch;
      if (h && s && l) {
        const darkerColor = `hsl(${h}, ${s}%, ${Math.max(parseFloat(l) - 10, 15)}%)`;
        return `linear-gradient(to right, ${baseColor}, ${darkerColor})`;
      }
    }

    // Fallback if parsing fails
    return baseColor;
  };

  const getSortLabel = () => {
    return sortBy === 'earnedAP' ? 'AP Earned' : 'Capital at Work';
  };

  const getSortValue = (category: CategoryCapitalData) => {
    if (isAnonymous) {
      return '-';
    }
    if (sortBy === 'earnedAP') {
      return formatActivityPoints(category.earnedAP);
    }
    return formatCurrency(category.capitalAtWork);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Filter categories based on sorting type
  const categoriesToSort =
    sortBy === 'capitalAtWork'
      ? categories.filter((category) => hasCapitalAtWork(category.categoryId))
      : categories.filter((category) =>
          earnsActivityPoints(category.categoryId),
        );

  // Sort categories based on selected criteria
  const sortedCategories = [...categoriesToSort].sort((a, b) => {
    const valueA = parseFloat(a[sortBy]);
    const valueB = parseFloat(b[sortBy]);
    return valueB - valueA; // Descending order
  });

  // Calculate total for progress bar
  const totalValue = sortedCategories.reduce(
    (sum, category) => sum + parseFloat(category[sortBy]),
    0,
  );

  if (categories.length === 0) {
    return (
      <Card noHover>
        <CardHeader>
          <CardTitle>Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            No activity data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card noHover>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="min-w-0 flex-shrink">
            My Activity &nbsp;&nbsp;&nbsp;&nbsp;
            <span className="text-white/50">/ Categories</span>
          </CardTitle>

          <SortButtons sortBy={sortBy} setSortBy={setSortBy} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <BreakdownProgressBar
          items={sortedCategories}
          totalValue={totalValue}
          getSortLabel={getSortLabel}
          isAnonymous={isAnonymous}
          formatValue={(value) =>
            sortBy === 'earnedAP'
              ? formatActivityPoints(value)
              : formatCurrency(value.toString())
          }
          getItemValue={(category) => parseFloat(category[sortBy])}
          getItemId={(category) => category.categoryId}
          getItemGradient={(category) =>
            getProgressBarGradient(category.categoryId)
          }
          hoveredItem={hoveredActivity}
          onItemHover={setHoveredActivity}
          onItemClick={toggleCategory}
          getItemTitle={(category) =>
            categoryInfoMap.get(category.categoryId)?.name ||
            category.categoryId
          }
        />

        <ExpandableItemList
          items={sortedCategories}
          totalValue={totalValue}
          isAnonymous={isAnonymous}
          expandedItems={expandedCategories}
          hoveredItem={hoveredActivity}
          onToggleItem={toggleCategory}
          getItemId={(category) => category.categoryId}
          getItemValue={(category) => parseFloat(category[sortBy])}
          getSortValue={getSortValue}
          renderIcon={(category) => {
            const { colorClasses, icon } = getCategoryData(category.categoryId);
            const IconComponent = getIcon(icon || undefined);
            return (
              <div className={cn('flex-shrink-0 rounded-lg p-2', colorClasses)}>
                <IconComponent className="h-4 w-4" />
              </div>
            );
          }}
          renderTitle={(category) =>
            categoryInfoMap.get(category.categoryId)?.name ||
            category.categoryId
          }
          renderExpandedContent={(category) => (
            <>
              <StatsGrid
                isAnonymous={isAnonymous}
                stats={[
                  ...createActivityStats({
                    earnedAP: category.earnedAP,
                    capitalAtWork: category.capitalAtWork,
                    apPerHour: category.apPerHour,
                    showEarnedAP: earnsActivityPoints(category.categoryId),
                    showCapitalAtWork: hasCapitalAtWork(category.categoryId),
                    showAPPerHour:
                      earnsActivityPoints(category.categoryId) &&
                      hasCapitalAtWork(category.categoryId),
                  }),
                  {
                    label: 'SP Multiplier',
                    value: multiplierData?.value
                      ? `${Number(multiplierData.value).toLocaleString()}x`
                      : '0x',
                    show: isMaintainXrdBalance(category.categoryId),
                    icon: Zap,
                    variant: 'accent',
                  },
                ]}
              />
              {/* Action buttons */}
              <div className="mt-3 flex gap-3 border-muted border-t pt-3">
                <Link href={`/dashboard/earn/${category.categoryId}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Target className="h-4 w-4" />
                    Earn
                  </Button>
                </Link>
                {earnsActivityPoints(category.categoryId) && (
                  <Link
                    href={`/dashboard/leaderboard?category=${category.categoryId}&week=${weekId}`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <List className="h-4 w-4" />
                      Leaderboard
                    </Button>
                  </Link>
                )}
              </div>
            </>
          )}
        />
      </CardContent>
    </Card>
  );
}
