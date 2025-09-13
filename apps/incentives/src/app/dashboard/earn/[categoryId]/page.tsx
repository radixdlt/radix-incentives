'use client';

import {
  ArrowLeft,
  BarChart3,
  ExternalLink,
  Grid3X3,
  Star,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/react';
import { ActivityCategoryBreakdown } from './components/ActivityCategoryBreakdown';
import { MissionModal } from './components/MissionModal';

type CategoryDetailPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

export default function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const [categoryId, setCategoryId] = useState<string>('');
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [selectedDappFilter, setSelectedDappFilter] = useState<string | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<'cards' | 'breakdown'>('breakdown');

  useEffect(() => {
    params.then((resolvedParams) => {
      setCategoryId(resolvedParams.categoryId);
    });
  }, [params]);

  // Get category data with user information
  const {
    data: categoriesWithUserData,
    isLoading: userDataLoading,
    error: userDataError,
  } = api.activity.getEarnPageCategoriesWithUserData.useQuery(undefined, {
    retry: false,
  });

  // Fallback to public categories if user is not authenticated
  const { data: categories, isLoading: categoriesLoading } =
    api.activity.getEarnPageCategories.useQuery(undefined, {
      enabled: !!userDataError,
    });

  // Try to get activities with user data first
  const {
    data: categoryActivitiesWithUserData,
    isLoading: userActivitiesLoading,
    error: userActivitiesError,
  } = api.activity.getActivitiesByCategoryWithUserData.useQuery(
    { categoryId },
    { enabled: !!categoryId, retry: false },
  );

  // Fallback to public activities if user is not authenticated
  const { data: categoryActivitiesPublic, isLoading: publicActivitiesLoading } =
    api.activity.getActivitiesByCategory.useQuery(
      { categoryId },
      { enabled: !!categoryId && !!userActivitiesError },
    );

  const categoryActivities =
    categoryActivitiesWithUserData || categoryActivitiesPublic;
  const activitiesLoading =
    userActivitiesLoading || (userActivitiesError && publicActivitiesLoading);

  const isLoading =
    !categoryId ||
    userDataLoading ||
    (userDataError && categoriesLoading) ||
    activitiesLoading;
  const categoryData = (categoriesWithUserData || categories)?.find(
    (c) => c.id === categoryId,
  );

  // Debug logging
  console.log('Category ID:', categoryId);
  console.log('Category Activities:', categoryActivities);

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

  const getAchievementStars = (investment: number) => {
    const achievements = [
      { threshold: 10, achieved: investment >= 10, label: '$10' },
      { threshold: 100, achieved: investment >= 100, label: '$100' },
      { threshold: 1000, achieved: investment >= 1000, label: '$1000' },
    ];
    return achievements;
  };

  const getMissions = (investment: number) => {
    return [
      {
        id: 'starter',
        name: 'Getting Started',
        description: 'Make your first investment in this category',
        threshold: 10,
        achieved: investment >= 10,
        icon: 'star' as const,
        color: 'yellow',
      },
      {
        id: 'committed',
        name: 'Committed Investor',
        description: 'Show your commitment with a substantial investment',
        threshold: 100,
        achieved: investment >= 100,
        icon: 'medal' as const,
        color: 'blue',
      },
      {
        id: 'champion',
        name: 'Category Champion',
        description: 'Become a champion with a significant investment',
        threshold: 1000,
        achieved: investment >= 1000,
        icon: 'trophy' as const,
        color: 'gold',
      },
    ];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-1/4 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/earn">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Earn
          </Button>
        </Link>
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl text-gray-900">
            Category not found
          </h1>
          <p className="text-gray-600">
            The category you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const userInvestment = (categoryData as any)?.userInvestment || 0;
  const apPerHour = (categoryData as any)?.apPerHour || 0;
  const achievements = getAchievementStars(userInvestment);
  const missions = getMissions(userInvestment);

  // Extract unique dApps from activities
  const availableDapps = categoryActivities
    ? Array.from(
        new Set(
          categoryActivities
            .map((activity) => (activity as any).dapp)
            .filter((dapp) => dapp && typeof dapp === 'object' && dapp.name),
        ),
      )
    : [];

  // Filter activities by selected dApp
  const filteredActivities =
    categoryActivities?.filter((activity) => {
      if (!selectedDappFilter) return true;
      return (activity as any).dapp?.name === selectedDappFilter;
    }) || [];

  // Sort activities by user investment (highest first)
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    const aInvestment = (a as any).userInvestment || 0;
    const bInvestment = (b as any).userInvestment || 0;
    return bInvestment - aInvestment;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Link href="/dashboard/earn">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Earn
        </Button>
      </Link>

      {/* Category Overview */}
      <div className="mb-8">
        <h1 className="mb-4 font-bold text-3xl">{categoryData.name}</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          {categoryData.description}
        </p>

        {/* Category Stats */}
        <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
          {/* User Investment Card */}
          {(categoryData as any)?.userInvestment !== undefined && (
            <Card className="h-fit">
              <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-2">
                <CardTitle className="text-sm sm:text-base">
                  Your Investment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 sm:p-6">
                <div className="font-bold text-lg sm:text-xl">
                  {formatCurrency(userInvestment)}
                </div>
                <div className="text-muted-foreground text-xs sm:text-sm">
                  Earning {formatAPPerHour(apPerHour)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Season Points Card */}
          <Card className="h-fit">
            <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-2">
              <CardTitle className="text-sm sm:text-base">SP Pool</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6">
              <div className="font-bold text-lg sm:text-xl">
                {(
                  (categoryData.seasonPointsPerWeek || 0) / 1000
                ).toLocaleString()}
                k SP
              </div>
              <div className="text-muted-foreground text-xs sm:text-sm">
                per week
              </div>
            </CardContent>
          </Card>

          {/* Missions Card */}
          <Card
            className="group h-fit cursor-pointer transition-all hover:border-cyan-400/50 hover:shadow-lg"
            onClick={() => setIsMissionModalOpen(true)}
          >
            <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base">Missions</CardTitle>
                <div className="text-cyan-400 text-xs transition-colors group-hover:text-cyan-300">
                  View All →
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6">
              <div className="mb-1 flex items-center gap-0.5 sm:gap-1">
                {achievements.map((achievement) => (
                  <Star
                    key={achievement.threshold}
                    className={cn(
                      'h-4 w-4 sm:h-5 sm:w-5',
                      achievement.achieved
                        ? 'fill-cyan-400 text-cyan-400'
                        : 'text-gray-300',
                    )}
                  />
                ))}
              </div>
              <div className="text-muted-foreground text-xs sm:text-sm">
                {achievements.filter((a) => a.achieved).length} of{' '}
                {achievements.length} completed
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Activities */}
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-bold text-2xl">Activities</h2>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">View:</span>
            <div className="flex gap-1">
              <Button
                variant={viewMode === 'breakdown' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('breakdown')}
                className="h-8 px-3 text-xs"
              >
                <BarChart3 className="mr-1 h-3 w-3" />
                Breakdown
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="h-8 px-3 text-xs"
              >
                <Grid3X3 className="mr-1 h-3 w-3" />
                Cards
              </Button>
            </div>
          </div>
        </div>

        {/* Results Summary and dApp Filter */}
        {categoryActivities && categoryActivities.length > 0 && (
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-muted-foreground text-sm">
              Showing {sortedActivities.length} of {categoryActivities.length}{' '}
              activities
            </div>

            {/* dApp Filter */}
            {availableDapps.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedDappFilter === null ? 'gradient' : 'outline'}
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => setSelectedDappFilter(null)}
                >
                  All
                </Button>
                {availableDapps.map((dapp: any) => (
                  <Button
                    key={dapp.name}
                    variant={
                      selectedDappFilter === dapp.name ? 'gradient' : 'outline'
                    }
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => setSelectedDappFilter(dapp.name)}
                  >
                    {dapp.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {!categoryActivities || categoryActivities.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              No activities found for this category.
            </p>
          </div>
        ) : sortedActivities.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              No activities found for the selected filter.{' '}
              <button
                type="button"
                onClick={() => setSelectedDappFilter(null)}
                className="text-primary hover:underline"
              >
                Clear filter
              </button>
            </p>
          </div>
        ) : viewMode === 'breakdown' ? (
          <ActivityCategoryBreakdown
            items={sortedActivities.map((activity) => ({
              id: activity.id,
              name: activity.name || activity.id,
              description: activity.description || undefined,
              userInvestment: (activity as any).userInvestment || 0,
              apPerHour: (activity as any).apPerHour || 0,
              dapp: (activity as any).dapp
                ? {
                    name: (activity as any).dapp.name,
                    website: (activity as any).dapp.website,
                    logoFileName: (activity as any).dapp.logoFileName,
                  }
                : undefined,
            }))}
            title="Sub-Activities"
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedActivities.map((activity) => {
              const hasWebsite = (activity as any).dapp?.website;
              const CardWrapper = hasWebsite ? 'a' : 'div';
              const cardProps = hasWebsite
                ? {
                    href: (activity as any).dapp.website,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: 'block',
                  }
                : {};

              return (
                <CardWrapper key={activity.id} {...cardProps}>
                  <Card
                    className={cn(
                      'h-full transition-shadow hover:shadow-lg',
                      hasWebsite && 'cursor-pointer hover:border-primary/50',
                    )}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {activity.name || activity.id}
                        </CardTitle>
                        {hasWebsite && (
                          <div className="text-primary text-xs">
                            Visit dApp ↗
                          </div>
                        )}
                      </div>
                      <CardDescription>
                        {activity.description || 'No description available'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">
                            Your Contribution:
                          </span>
                          <span className="font-medium">
                            {(activity as any).userInvestment !== undefined
                              ? formatCurrency((activity as any).userInvestment)
                              : '$0'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">
                            AP/hour:
                          </span>
                          <span className="font-medium">
                            {(activity as any).apPerHour !== undefined
                              ? formatAPPerHour((activity as any).apPerHour)
                              : '0 AP/h'}
                          </span>
                        </div>
                      </div>
                      {(activity as any).dapp && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-xs">
                              Available on:
                            </span>
                            <div className="relative h-6 w-6 overflow-hidden rounded-full border bg-white">
                              {(activity as any).dapp.logoFileName ? (
                                <Image
                                  src={`/dapp-logos/${(activity as any).dapp.logoFileName}`}
                                  alt={`${(activity as any).dapp.name} logo`}
                                  fill
                                  className="object-contain"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-100 font-medium text-gray-500 text-xs">
                                  {((activity as any).dapp.name || 'DApp')
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-xs">
                              {(activity as any).dapp.name || activity.dapp}
                            </span>
                            {hasWebsite && (
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </CardWrapper>
              );
            })}
          </div>
        )}
      </div>

      {/* Mission Modal */}
      <MissionModal
        isOpen={isMissionModalOpen}
        onOpenChange={setIsMissionModalOpen}
        categoryName={categoryData?.name || 'Category'}
        userInvestment={userInvestment}
        missions={missions}
      />
    </div>
  );
}
