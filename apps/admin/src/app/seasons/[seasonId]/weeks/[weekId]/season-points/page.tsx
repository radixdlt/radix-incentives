'use client';

import BigNumber from 'bignumber.js';
import {
  AlertCircle,
  ArrowLeft,
  Calculator,
  Download,
  Eye,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Separator } from '~/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { downloadCSV } from '~/lib/utils';
import type { RouterOutputs } from '~/trpc/react';
import { api } from '~/trpc/react';

type SeasonPointsData = RouterOutputs['admin']['user']['getSeasonPoints'][0] & {
  data?: Record<string, string>;
};

type AvailableCategory =
  RouterOutputs['leaderboard']['getAvailableCategories'][0];

const UserBreakdownDialog = ({
  user,
  categories,
  selectedCategories,
}: {
  user: SeasonPointsData;
  categories: AvailableCategory[];
  selectedCategories: string[];
}) => {
  if (!user.data || Object.keys(user.data).length === 0) {
    return null;
  }

  const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="mr-1 h-3 w-3" />
          View Breakdown
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] w-[480px] max-w-none">
        <DialogHeader>
          <DialogTitle>
            {user.label && user.label.length > 25
              ? `${user.label.substring(0, 25)}...`
              : user.label || 'User'}{' '}
            - Category Breakdown
          </DialogTitle>
          <DialogDescription>
            Season points by selected categories for this user
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-2 overflow-y-auto p-2">
          {Object.entries(user.data)
            .filter(
              ([categoryId, points]) =>
                selectedCategories.includes(categoryId) &&
                points &&
                Number(points) > 0,
            )
            .sort(([, a], [, b]) => Number(b) - Number(a))
            .map(([categoryId, points]) => (
              <div
                key={categoryId}
                className="flex items-center justify-between rounded border bg-muted/50 p-2 text-sm"
              >
                <span className="truncate pr-2 font-medium">
                  {categoryMap.get(categoryId) || categoryId}
                </span>
                <span className="whitespace-nowrap font-mono font-semibold">
                  {Number(points).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            ))}
          {Object.entries(user.data).filter(
            ([categoryId, points]) =>
              selectedCategories.includes(categoryId) &&
              points &&
              Number(points) > 0,
          ).length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No points in selected categories
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SeasonPointsTable = ({
  data,
  categories,
  selectedCategories,
}: {
  data: SeasonPointsData[];
  categories: AvailableCategory[];
  selectedCategories: string[];
}) => {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="border-r text-center">#</TableHead>
            <TableHead className="border-r">Username</TableHead>
            <TableHead className="border-r text-right">Multiplier</TableHead>
            <TableHead className="border-r text-right">Season Points</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data
              .filter((user) => user.points.gt(0))
              .sort((a, b) => b.points.minus(a.points).toNumber())
              .map((user, index) => (
                <TableRow key={user.userId} className="border-b">
                  <TableCell className="border-r text-center font-mono">
                    {index + 1}
                  </TableCell>
                  <TableCell className="border-r">
                    <Link
                      href={`/users/${user.userId}`}
                      className="text-white hover:text-gray-200 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {user.label || '-'}
                    </Link>
                  </TableCell>
                  <TableCell className="border-r text-right font-mono">
                    {Number(user.multiplier).toFixed(2)}x
                  </TableCell>
                  <TableCell className="border-r text-right font-mono">
                    {user.points.toFormat(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/users/${user.userId}/account-balance`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Balances
                        </Link>
                      </Button>
                      <UserBreakdownDialog
                        user={user}
                        categories={categories}
                        selectedCategories={selectedCategories}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No users with points found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const CategoryFilterSection = ({
  categories,
  selectedCategories,
  onCategoryToggle,
  setSelectedCategories,
}: {
  categories: AvailableCategory[];
  selectedCategories: string[];
  onCategoryToggle: (categoryId: string, checked: boolean) => void;
  setSelectedCategories: (categories: string[]) => void;
}) => {
  const allSelected =
    selectedCategories.length === categories.length && categories.length > 0;
  const noneSelected = selectedCategories.length === 0;

  const handleSelectAll = () => {
    console.log('handleSelectAll clicked', {
      allSelected,
      selectedLength: selectedCategories.length,
      categoriesLength: categories.length,
    });
    if (allSelected) {
      // Deselect all - directly set empty array
      console.log('Deselecting all categories');
      setSelectedCategories([]);
    } else {
      // Select all - set all category IDs
      console.log('Selecting all categories');
      setSelectedCategories(categories.map((cat) => cat.id));
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Category Filter</CardTitle>
        <CardDescription>
          Select which activity categories to include in the displayed results.
          Changes are applied instantly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
            <span className="text-muted-foreground text-sm">
              {selectedCategories.length} of {categories.length} categories
              selected
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) =>
                    onCategoryToggle(category.id, !!checked)
                  }
                />
                <label
                  htmlFor={category.id}
                  className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function SeasonPointsPage() {
  const params = useParams<{ seasonId: string; weekId: string }>();
  const [calculationResult, setCalculationResult] =
    useState<typeof seasonPoints>();
  const [fullCalculationResult, setFullCalculationResult] =
    useState<typeof seasonPoints>();
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const {
    data: seasonPoints,
    isLoading,
    error,
    refetch,
  } = api.admin.user.getSeasonPoints.useQuery({
    weekId: params.weekId,
  });

  // Get week data for activity category information
  const { data: weekData, isLoading: isWeekDataLoading } =
    api.week.getWeekDetails.useQuery({
      weekId: params.weekId,
    });

  // Get available categories for filtering
  const { data: availableCategories, isLoading: isCategoriesLoading } =
    api.leaderboard.getAvailableCategories.useQuery({
      weekId: params.weekId,
    });

  // Initialize selected categories when available categories are loaded (only once)
  const [hasInitialized, setHasInitialized] = React.useState(false);
  React.useEffect(() => {
    if (availableCategories && !hasInitialized) {
      setSelectedCategories(availableCategories.map((cat) => cat.id));
      setHasInitialized(true);
    }
  }, [availableCategories, hasInitialized]);

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, categoryId] : prev.filter((id) => id !== categoryId),
    );
  };

  // Function to filter and recalculate user points based on selected categories
  const filterAndRecalculateResults = React.useCallback(
    (fullResults: SeasonPointsData[] | undefined, selectedCats: string[]) => {
      if (!fullResults || selectedCats.length === 0) {
        return [];
      }

      return fullResults.map((user) => {
        if (!user.data || Object.keys(user.data).length === 0) {
          // User has no category breakdown, return with 0 points
          return {
            ...user,
            points: new BigNumber(0),
          };
        }

        // Calculate new total points from selected categories only
        const filteredPoints = Object.entries(user.data)
          .filter(([categoryId]) => selectedCats.includes(categoryId))
          .reduce((total, [, points]) => {
            return total.plus(new BigNumber(points || 0));
          }, new BigNumber(0));

        return {
          ...user,
          points: filteredPoints,
        };
      });
    },
    [],
  );

  // Update calculation result when selected categories change
  React.useEffect(() => {
    if (fullCalculationResult && selectedCategories.length > 0) {
      const filteredResults = filterAndRecalculateResults(
        fullCalculationResult,
        selectedCategories,
      );
      setCalculationResult(filteredResults);
    }
  }, [fullCalculationResult, selectedCategories, filterAndRecalculateResults]);

  const { mutate: calculateSeasonPoints } =
    api.admin.user.simulateCalculateSeasonPoints.useMutation({
      onMutate: () => {
        setIsCalculating(true);
      },
      onSuccess: (data) => {
        // Store the full calculation result
        setFullCalculationResult(data);
        // Apply current category filter
        const filteredResults = filterAndRecalculateResults(
          data,
          selectedCategories,
        );
        setCalculationResult(filteredResults);
        toast.success('Season points calculation completed');
        refetch();
      },
      onError: (error) => {
        toast.error('Failed to calculate season points', {
          description: error.message,
        });
      },
      onSettled: () => {
        setIsCalculating(false);
      },
    });

  const handleDownloadSeasonPoints = () => {
    if (!calculationResult || calculationResult.length === 0) {
      toast.error('No calculation results to download');
      return;
    }

    // Transform the data for CSV export
    const csvData = calculationResult
      .filter((user) => user.points.gt(0))
      .sort((a, b) => b.points.minus(a.points).toNumber())
      .map((user) => ({
        userId: user.userId,
        username: user.label || '-',
        multiplier: Number(user.multiplier).toFixed(2),
        seasonPoints: user.points.toFixed(2),
      }));

    downloadCSV(csvData, `season-points-calculation-week-${params.weekId}.csv`);
    toast.success('Season points calculation data downloaded successfully');
  };

  const handleDownloadActivityData = () => {
    if (
      !weekData?.activityCategories ||
      weekData.activityCategories.length === 0
    ) {
      toast.error('No activity category data to download');
      return;
    }

    // Transform the activity data for CSV export
    const csvData = weekData.activityCategories.flatMap((category) =>
      category.activities.map((activity) => ({
        categoryId: category.categoryId,
        activityId: activity.id,
        multiplier: activity.multiplier ? activity.multiplier.toString() : '1',
        pointsPool: category.pointsPool ? category.pointsPool.toString() : '0',
        lowerBoundsPercentage: category.lowerBoundsPercentage
          ? category.lowerBoundsPercentage.toString()
          : '0',
        outlierThresholdPercentage: category.outlierThresholdPercentage
          ? category.outlierThresholdPercentage.toString()
          : '0.95',
        enableOutlierDetection: category.enableOutlierDetection || false,
      })),
    );

    downloadCSV(csvData, `activity-categories-week-${params.weekId}.csv`);
    toast.success('Activity category data downloaded successfully');
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <h2 className="mb-2 font-semibold text-destructive">
            Error loading season points
          </h2>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading || isWeekDataLoading || isCategoriesLoading) {
    return (
      <div className="container mx-auto py-6 pr-6 pl-6">
        {/* Header Section Skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 animate-pulse rounded bg-gray-200" />
            <div className="space-y-2">
              <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
          <div className="h-10 w-36 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="my-6 h-px bg-gray-200" />

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <div className="mb-2 h-6 w-40 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">
                      <div className="mx-auto h-4 w-6 animate-pulse rounded bg-gray-200" />
                    </TableHead>
                    <TableHead>
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                    </TableHead>
                    <TableHead className="text-right">
                      <div className="ml-auto h-4 w-20 animate-pulse rounded bg-gray-200" />
                    </TableHead>
                    <TableHead className="text-right">
                      <div className="ml-auto h-4 w-28 animate-pulse rounded bg-gray-200" />
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="mx-auto h-4 w-20 animate-pulse rounded bg-gray-200" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }, (_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loading rows are temporary
                    <TableRow key={`skeleton-loading-${i}`}>
                      <TableCell className="text-center">
                        <div className="mx-auto h-4 w-6 animate-pulse rounded bg-gray-200" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="ml-auto h-4 w-24 animate-pulse rounded bg-gray-200" />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="mx-auto h-8 w-24 animate-pulse rounded bg-gray-200" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 pr-6 pl-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={`/seasons/${params.seasonId}/weeks/${params.weekId}`}
              aria-label="Back to week"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-bold text-3xl tracking-tight">Season Points</h1>
            <p className="text-muted-foreground">
              Season points for week {params.weekId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {calculationResult && calculationResult.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadSeasonPoints}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Calculation Results
            </Button>
          )}
          {calculationResult && calculationResult.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadActivityData}
              disabled={
                !weekData?.activityCategories ||
                weekData.activityCategories.length === 0
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Activity Data CSV
            </Button>
          )}
          <Button
            onClick={() => calculateSeasonPoints({ weekId: params.weekId })}
            disabled={isCalculating}
          >
            {isCalculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Points
              </>
            )}
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Info Alert */}
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          The "Calculate Points" button runs a simulation only. No data will be
          saved to the database. Use this to preview season points calculations
          before processing the week.
        </AlertDescription>
      </Alert>

      {/* Calculation Results */}
      {calculationResult && calculationResult.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Calculation Results (Simulation)</CardTitle>
            <CardDescription>
              This is a simulated calculation. No data will be stored in the
              database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Category Filter Section */}
              {availableCategories && availableCategories.length > 0 && (
                <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                  <div>
                    <h4 className="mb-2 font-medium text-sm">
                      Category Filter
                    </h4>
                    <p className="mb-4 text-muted-foreground text-xs">
                      Select which activity categories to include in the
                      displayed results. Changes are applied instantly.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const allSelected =
                            selectedCategories.length ===
                              availableCategories.length &&
                            availableCategories.length > 0;
                          console.log('Button clicked', {
                            allSelected,
                            selectedLength: selectedCategories.length,
                            categoriesLength: availableCategories.length,
                          });
                          if (allSelected) {
                            console.log('Deselecting all categories');
                            setSelectedCategories([]);
                          } else {
                            console.log('Selecting all categories');
                            setSelectedCategories(
                              availableCategories.map((cat) => cat.id),
                            );
                          }
                        }}
                        className="rounded border px-3 py-1 text-xs transition-colors hover:bg-muted"
                      >
                        {selectedCategories.length ===
                        availableCategories.length
                          ? 'Deselect All'
                          : 'Select All'}
                      </button>
                      <span className="text-muted-foreground text-xs">
                        {selectedCategories.length} of{' '}
                        {availableCategories.length} categories selected
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                      {availableCategories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={category.id}
                            checked={selectedCategories.includes(category.id)}
                            onChange={(e) =>
                              handleCategoryToggle(
                                category.id,
                                e.target.checked,
                              )
                            }
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={category.id}
                            className="cursor-pointer select-none font-medium text-sm leading-none"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-muted-foreground text-sm">
                  Total Distributed{' '}
                  {selectedCategories.length <
                  (availableCategories?.length || 0)
                    ? '(Filtered)'
                    : ''}
                </h4>
                <p className="font-mono text-lg">
                  {calculationResult
                    ?.reduce(
                      (sum, user) => sum.plus(user.points),
                      new BigNumber(0),
                    )
                    .toFormat(2)}
                </p>
                {selectedCategories.length <
                  (availableCategories?.length || 0) && (
                  <p className="text-muted-foreground text-xs">
                    Showing {selectedCategories.length} of{' '}
                    {availableCategories?.length || 0} categories
                  </p>
                )}
              </div>
              <div>
                <h4 className="font-medium text-muted-foreground text-sm">
                  Number of Users
                </h4>
                <p className="font-mono text-lg">
                  {calculationResult?.length.toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium text-muted-foreground text-sm">
                  All Users with Points
                </h4>
                <SeasonPointsTable
                  data={calculationResult || []}
                  categories={availableCategories || []}
                  selectedCategories={selectedCategories}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Season Points Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Season Points</CardTitle>
          <CardDescription>
            {seasonPoints?.length || 0} user
            {seasonPoints?.length !== 1 ? 's' : ''} with season points for this
            week
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <SeasonPointsTable
            data={seasonPoints || []}
            categories={availableCategories || []}
            selectedCategories={selectedCategories}
          />
        </CardContent>
      </Card>
    </div>
  );
}
