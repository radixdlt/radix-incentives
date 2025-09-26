'use client';

import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
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
  earnsActivityPoints,
  formatActivityName,
  formatActivityPoints,
  formatCurrency,
  hasCapitalAtWork,
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

interface ActivityBreakdownProps {
  categoryId: string;
  categoryData: CategoryCapitalData | undefined;
  weekId: string;
  isAnonymous?: boolean;
}

export function ActivityBreakdown({
  categoryId,
  categoryData,
  weekId,
  isAnonymous = false,
}: ActivityBreakdownProps) {
  // For maintainXrdBalance, default to capital sorting since AP is not relevant
  const [sortBy, setSortBy] = useState<SortBy>(
    categoryId === 'maintainXrdBalance' ? 'capitalAtWork' : 'earnedAP',
  );
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(
    new Set(),
  );
  const [selectedDapp, setSelectedDapp] = useState<string | null>(null);
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);

  // Get anonymous user data when no wallet is connected
  const { data: anonymousCapitalData } =
    api.user.getAnonymousCapitalAtWork.useQuery(
      { weekId },
      {
        enabled: isAnonymous && !!weekId,
      },
    );

  // Use anonymous data if user is not connected, otherwise use provided categoryData
  const relevantCategoryData = isAnonymous
    ? anonymousCapitalData?.find((data) => data.categoryId === categoryId)
    : categoryData;

  const activities = relevantCategoryData?.activities || [];

  // Get unique dApps for filtering
  const availableDapps = activities.reduce<
    { id: string; name: string; website: string }[]
  >((unique, activity) => {
    const dapp = activity.dapp;
    if (dapp && !unique.find((existing) => existing.id === dapp.id)) {
      unique.push(dapp);
    }
    return unique;
  }, []);

  // Filter activities by selected dApp
  const filteredActivities = selectedDapp
    ? activities.filter((activity) => activity.dapp?.id === selectedDapp)
    : activities;

  // Sort activities based on selected criteria
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    const valueA = parseFloat(a[sortBy]);
    const valueB = parseFloat(b[sortBy]);
    return valueB - valueA; // Descending order
  });

  // Calculate total for progress bar
  const totalValue = sortedActivities.reduce(
    (sum, activity) => sum + parseFloat(activity[sortBy]),
    0,
  );

  // Format activity name helper
  const getFormattedActivityName = (activity: ActivityBreakdownData) => {
    return formatActivityName(activity.activityId, activity.activityName);
  };

  const getSortLabel = () => {
    return sortBy === 'earnedAP' ? 'AP Earned' : 'Capital at Work';
  };

  const getSortValue = (activity: ActivityBreakdownData) => {
    if (isAnonymous) {
      return '-';
    }
    if (sortBy === 'earnedAP') {
      return formatActivityPoints(activity.earnedAP);
    }
    return formatCurrency(activity.capitalAtWork);
  };

  const toggleActivity = (activityId: string) => {
    setExpandedActivities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  if (activities.length === 0) {
    return (
      <Card noHover>
        <CardHeader>
          <CardTitle>Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-muted-foreground">
            No activity data available for this category.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card noHover>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="min-w-0 flex-shrink">Activities</CardTitle>

          <SortButtons
            sortBy={sortBy}
            setSortBy={setSortBy}
            showAPSort={earnsActivityPoints(categoryId)}
            showCapitalSort={hasCapitalAtWork(categoryId)}
          />
        </div>

        {/* dApp filter buttons */}
        {availableDapps.length > 1 && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              variant={selectedDapp === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDapp(null)}
              className="!px-4"
            >
              All dApps
            </Button>
            {availableDapps.map((dapp) => (
              <Button
                key={dapp.id}
                variant={selectedDapp === dapp.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDapp(dapp.id)}
                className="!px-4"
              >
                {dapp.name}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <BreakdownProgressBar
          items={sortedActivities}
          totalValue={totalValue}
          getSortLabel={getSortLabel}
          isAnonymous={isAnonymous}
          formatValue={(value) =>
            sortBy === 'earnedAP'
              ? formatActivityPoints(value)
              : formatCurrency(value.toString())
          }
          getItemValue={(activity) => parseFloat(activity[sortBy])}
          getItemId={(activity) => activity.activityId}
          getItemColor={(_, index) => {
            const hue = (index * 137.5) % 360;
            return `hsl(${hue}, 70%, 60%)`;
          }}
          hoveredItem={hoveredActivity}
          onItemHover={setHoveredActivity}
          onItemClick={toggleActivity}
          getItemTitle={getFormattedActivityName}
        />

        <ExpandableItemList
          items={sortedActivities}
          totalValue={totalValue}
          isAnonymous={isAnonymous}
          expandedItems={expandedActivities}
          hoveredItem={hoveredActivity}
          onToggleItem={toggleActivity}
          getItemId={(activity) => activity.activityId}
          getItemValue={(activity) => parseFloat(activity[sortBy])}
          getSortValue={getSortValue}
          renderIcon={(_, index) => {
            const hue = (index * 137.5) % 360;
            const color = `hsl(${hue}, 70%, 60%)`;
            return (
              <div
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
            );
          }}
          renderTitle={getFormattedActivityName}
          renderExpandedContent={(activity) => (
            <>
              <StatsGrid
                isAnonymous={isAnonymous}
                columns={3}
                stats={createActivityStats({
                  earnedAP: activity.earnedAP,
                  capitalAtWork: activity.capitalAtWork,
                  apPerHour: activity.apPerHour,
                  showEarnedAP: earnsActivityPoints(categoryId),
                  showCapitalAtWork: hasCapitalAtWork(categoryId),
                  showAPPerHour:
                    earnsActivityPoints(categoryId) &&
                    hasCapitalAtWork(categoryId),
                })}
              />
              {activity.dapp && (
                <div className="mt-3 border-muted border-t pt-3">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs">
                      Visit to earn:
                    </span>
                    <a
                      href={activity.dapp.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative"
                      title={activity.dapp.name}
                    >
                      <div className="relative h-8 w-8 overflow-hidden rounded-full border bg-white transition-transform duration-200 group-hover:scale-105">
                        <Image
                          src={`/dapp-logos/${activity.dapp.id}.png`}
                          alt={`${activity.dapp.name} logo`}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <ExternalLink className="-right-1 -top-1 absolute h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        />
      </CardContent>
    </Card>
  );
}
