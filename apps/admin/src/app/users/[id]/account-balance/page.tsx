'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BubbleMap } from '~/components/account-balance/bubble-map';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Skeleton } from '~/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { api } from '~/trpc/react';

type AccountBalanceData = {
  accountAddress: string;
  timestamp: Date;
  data: Array<{
    activityId: string;
    usdValue: string;
    categoryId: string;
  }>;
};

export default function AccountBalancePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get timestamp from URL or default to current date
  const getInitialDateTime = () => {
    const timestampParam = searchParams.get('timestamp');
    if (timestampParam) {
      const date = new Date(timestampParam);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString().slice(0, 16);
      }
    }
    return new Date().toISOString().slice(0, 16);
  };

  const [selectedDateTime, setSelectedDateTime] = useState(getInitialDateTime);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');

  // Update URL when datetime changes
  const updateDateTime = (newDateTime: string) => {
    setSelectedDateTime(newDateTime);
    const url = new URL(window.location.href);
    url.searchParams.set('timestamp', new Date(newDateTime).toISOString());
    router.push(url.pathname + url.search, { scroll: false });
  };

  // Sync with URL changes
  useEffect(() => {
    const timestampParam = searchParams.get('timestamp');
    if (timestampParam) {
      const date = new Date(timestampParam);
      if (!Number.isNaN(date.getTime())) {
        const formattedDateTime = date.toISOString().slice(0, 16);
        if (formattedDateTime !== selectedDateTime) {
          setSelectedDateTime(formattedDateTime);
        }
      }
    }
  }, [searchParams, selectedDateTime]);

  // Get available weeks for the week selector
  const { data: weeks, isLoading: isWeeksLoading } =
    api.week.getWeeks.useQuery();

  // Auto-select the latest week when weeks data loads
  useEffect(() => {
    if (weeks && weeks.length > 0 && !selectedWeekId) {
      // Find the most recent week (highest end date)
      const latestWeek = weeks.reduce((latest, current) =>
        new Date(current.endDate) > new Date(latest.endDate) ? current : latest,
      );
      setSelectedWeekId(latestWeek.id);
    }
  }, [weeks, selectedWeekId]);

  const { data: accountBalances, isLoading: isBalancesLoading } =
    api.admin.user.getLatestAccountBalances.useQuery({
      userId: id,
      timestamp: new Date(selectedDateTime),
    });

  const { data: activityPoints, isLoading: isActivityPointsLoading } =
    api.user.getUserActivityPointsByWeek.useQuery(
      {
        userId: id,
        weekId: selectedWeekId,
      },
      {
        enabled: Boolean(selectedWeekId) && selectedWeekId !== 'none',
      },
    );

  const isLoading =
    isWeeksLoading || isBalancesLoading || isActivityPointsLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[400px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[600px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const balances = accountBalances as AccountBalanceData[] | undefined;

  const totalValue =
    balances?.reduce((sum, balance) => {
      const balanceTotal = balance.data.reduce(
        (itemSum, item) => itemSum + (parseFloat(item.usdValue) || 0),
        0,
      );
      return sum + balanceTotal;
    }, 0) || 0;

  // Prepare combined data for bubble map and table
  const balanceTableData =
    balances
      ?.flatMap((balance) =>
        balance.data.map((item) => ({
          accountAddress: balance.accountAddress,
          activityId: item.activityId,
          categoryId: item.categoryId,
          value: parseFloat(item.usdValue) || 0,
          timestamp: balance.timestamp,
          dataType: 'balance' as const,
        })),
      )
      .filter((item) => item.value > 0) || [];

  // Prepare activity points data (convert points to a comparable scale for visualization)
  const activityTableData =
    activityPoints
      ?.map((activity) => ({
        accountAddress: activity.accountAddress,
        activityId: activity.activityId,
        categoryId: activity.categoryId,
        value: Number(activity.activityPoints.toFixed(2)),
        timestamp: new Date(), // Activity points are for the selected week
        dataType: 'activity' as const,
        activityType: activity.activityId.includes('_tr_')
          ? 'trading'
          : activity.activityId === 'componentCalls'
            ? 'component'
            : activity.activityId === 'txFees'
              ? 'fees'
              : 'other',
      }))
      .filter((item) => item.value > 0) || [];

  // Filter activity points for the specific types we want
  const filteredActivityData = activityTableData.filter(
    (item) =>
      item.activityId.includes('_tr_') ||
      item.activityId === 'componentCalls' ||
      item.activityId === 'txFees',
  );

  // Combine balance and activity data
  const combinedTableData = [...balanceTableData, ...filteredActivityData].sort(
    (a, b) => b.value - a.value,
  );

  // Prepare data for bubble map (combine balance and activity data)
  const bubbleMapData =
    balances?.map((balance) => ({
      ...balance,
      data: [
        ...balance.data,
        ...filteredActivityData
          .filter(
            (activity) => activity.accountAddress === balance.accountAddress,
          )
          .map((activity) => ({
            activityId: activity.activityId,
            usdValue: activity.value.toString(),
            categoryId: activity.categoryId,
          })),
      ],
    })) || [];

  return (
    <div className="container mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Account Balance Visualization</CardTitle>
              <CardDescription>
                Interactive bubble map showing account balances by activity
                {totalValue > 0 && (
                  <span className="ml-2 font-semibold">
                    (Total: $
                    {totalValue.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    )
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="datetime-picker"
                  className="font-medium text-sm"
                >
                  View balances as of:
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="datetime-picker"
                    type="datetime-local"
                    value={selectedDateTime}
                    onChange={(e) => updateDateTime(e.target.value)}
                    className="w-auto"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const now = new Date();
                      updateDateTime(now.toISOString().slice(0, 16));
                    }}
                  >
                    Now
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="week-picker" className="font-medium text-sm">
                  Activity points for week:
                </Label>
                <Select
                  value={selectedWeekId}
                  onValueChange={setSelectedWeekId}
                >
                  <SelectTrigger className="w-auto min-w-[200px]">
                    <SelectValue placeholder="Select a week..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground">
                        None (balances only)
                      </span>
                    </SelectItem>
                    {weeks?.map((week) => (
                      <SelectItem key={week.id} value={week.id}>
                        {new Date(week.startDate).toLocaleDateString()} -{' '}
                        {new Date(week.endDate).toLocaleDateString()} (
                        {week.seasonName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <BubbleMap data={bubbleMapData} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Balance & Activity Details</CardTitle>
          <CardDescription>
            Detailed breakdown of account balances and activity points{' '}
            {selectedWeekId && selectedWeekId !== 'none'
              ? `for the selected week`
              : '(select a week to see activity points)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Address</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Activity ID</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinedTableData.length > 0 ? (
                  combinedTableData.map((item, index) => (
                    <TableRow
                      key={`${item.accountAddress}-${item.activityId}-${item.dataType}-${index}`}
                    >
                      <TableCell className="font-mono text-sm">
                        {item.accountAddress.slice(0, 8)}...
                        {item.accountAddress.slice(-6)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.dataType === 'balance' ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 font-medium text-green-800 text-xs dark:bg-green-900 dark:text-green-300">
                            Balance
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
                              item.activityType === 'trading'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                : item.activityType === 'component'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                  : item.activityType === 'fees'
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                            }`}
                          >
                            {item.activityType === 'trading'
                              ? 'Trading'
                              : item.activityType === 'component'
                                ? 'Component'
                                : item.activityType === 'fees'
                                  ? 'Fees'
                                  : 'Activity'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.categoryId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.activityId}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.dataType === 'balance' ? (
                          <>
                            $
                            {item.value.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </>
                        ) : (
                          <>
                            {item.value.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                            <span className="ml-1 text-muted-foreground text-xs">
                              pts
                            </span>
                          </>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {new Date(item.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No balance or activity data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
