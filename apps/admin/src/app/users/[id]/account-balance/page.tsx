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

  const { data: accountBalances, isLoading } =
    api.admin.user.getLatestAccountBalances.useQuery({
      userId: id,
      timestamp: new Date(selectedDateTime),
    });

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

  // Prepare table data
  const tableData =
    balances
      ?.flatMap((balance) =>
        balance.data.map((item) => ({
          accountAddress: balance.accountAddress,
          activityId: item.activityId,
          categoryId: item.categoryId,
          usdValue: parseFloat(item.usdValue) || 0,
          timestamp: balance.timestamp,
        })),
      )
      .filter((item) => item.usdValue > 0)
      .sort((a, b) => b.usdValue - a.usdValue) || [];

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
            <div className="flex flex-col gap-2">
              <Label htmlFor="datetime-picker" className="font-medium text-sm">
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <BubbleMap data={balances} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Balance Details</CardTitle>
          <CardDescription>
            Detailed breakdown of all account balances by activity
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Address</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Activity ID</TableHead>
                  <TableHead className="text-right">USD Value</TableHead>
                  <TableHead className="text-right">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.length > 0 ? (
                  tableData.map((item, index) => (
                    <TableRow
                      key={`${item.accountAddress}-${item.activityId}-${index}`}
                    >
                      <TableCell className="font-mono text-sm">
                        {item.accountAddress.slice(0, 8)}...
                        {item.accountAddress.slice(-6)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.categoryId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.activityId}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        $
                        {item.usdValue.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {new Date(item.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No balance data available
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
