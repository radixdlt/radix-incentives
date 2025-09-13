'use client';
import { api } from '~/trpc/react';
import { ActivityCardSkeleton } from './advanced/components';
import { ActivityCardDynamic } from './components/ActivityCardDynamic';

export default function EarnPage() {
  // Try to get authenticated user data first
  const {
    data: earnPageCategoriesWithUserData,
    isLoading: userDataLoading,
    error: userDataError,
  } = api.activity.getEarnPageCategoriesWithUserData.useQuery(undefined, {
    retry: false,
  });

  // Fallback to public categories if user is not authenticated
  const { data: earnPageCategories, isLoading: categoriesLoading } =
    api.activity.getEarnPageCategories.useQuery(undefined, {
      enabled: !!userDataError, // Only fetch if user query failed (not authenticated)
    });

  const isLoading = userDataLoading || (userDataError && categoriesLoading);
  const categories = earnPageCategoriesWithUserData || earnPageCategories;

  if (isLoading)
    return (
      <div className="space-y-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 font-bold text-3xl">Earn Activity Points</h1>
          <p className="mb-2 text-lg text-muted-foreground">
            Participate in various DeFi activities to earn Activity Points (AP)
            and compete for Season Points (SP).
          </p>
          <p className="text-muted-foreground">
            Each category below represents a different way to earn points. All
            categories are separate and independent - your participation in each
            one contributes to your overall rewards.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ActivityCardSkeleton key="skeleton-1" />
          <ActivityCardSkeleton key="skeleton-2" />
          <ActivityCardSkeleton key="skeleton-3" />
          <ActivityCardSkeleton key="skeleton-4" />
          <ActivityCardSkeleton key="skeleton-5" />
          <ActivityCardSkeleton key="skeleton-6" />
        </div>
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-4 font-bold text-3xl">Earn Activity Points</h1>
        <p className="mb-2 text-lg text-muted-foreground">
          Participate in various DeFi activities to earn Activity Points (AP)
          and compete for Season Points (SP).
        </p>
        <p className="text-muted-foreground">
          Each category below represents a different way to earn points. All
          categories are separate and independent - your participation in each
          one contributes to your overall rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories?.map((category) => (
          <ActivityCardDynamic key={category.id} category={category} />
        )) ?? []}
      </div>
    </div>
  );
}
