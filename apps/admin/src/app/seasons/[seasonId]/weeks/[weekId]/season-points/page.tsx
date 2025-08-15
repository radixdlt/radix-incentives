'use client';

import { AlertCircle, ArrowLeft, Calculator, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { BigNumber } from 'bignumber.js';
import { Button } from '~/components/ui/button';
import { Alert, AlertDescription } from '~/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { api } from '~/trpc/react';

export default function SeasonPointsPage() {
  const params = useParams<{ seasonId: string; weekId: string }>();
  const [calculationResult, setCalculationResult] = useState<
    {
      userId: string;
      seasonId: string;
      points: BigNumber;
      weekId: string;
    }[]
  >([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const {
    data: seasonPoints,
    isLoading,
    error,
    refetch,
  } = api.admin.user.getSeasonPoints.useQuery({
    weekId: params.weekId,
  });

  const { mutate: calculateSeasonPoints } =
    api.admin.user.simulateCalculateSeasonPoints.useMutation({
      onMutate: () => {
        setIsCalculating(true);
      },
      onSuccess: (data) => {
        setCalculationResult(data);
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

  if (isLoading) {
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
                    <TableHead>
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                    </TableHead>
                    <TableHead className="text-right">
                      <div className="ml-auto h-4 w-28 animate-pulse rounded bg-gray-200" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }, (_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loading rows are temporary
                    <TableRow key={`skeleton-loading-${i}`}>
                      <TableCell>
                        <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="ml-auto h-4 w-24 animate-pulse rounded bg-gray-200" />
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
      {calculationResult.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Calculation Results (Simulation)</CardTitle>
            <CardDescription>
              This is a simulated calculation. No data will be stored in the
              database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-muted-foreground text-sm">
                  Total Distributed
                </h4>
                <p className="font-mono text-lg">
                  {calculationResult
                    .reduce(
                      (sum, user) => sum.plus(user.points),
                      new BigNumber(0),
                    )
                    .toNumber()
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-muted-foreground text-sm">
                  Number of Users
                </h4>
                <p className="font-mono text-lg">
                  {calculationResult.length.toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="mb-2 font-medium text-muted-foreground text-sm">
                  All Users with Points
                </h4>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead className="text-right">
                          Season Points
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calculationResult
                        .filter((user) => user.points.gt(0))
                        .sort((a, b) => b.points.minus(a.points).toNumber())
                        .map((user) => (
                          <TableRow key={user.userId}>
                            <TableCell className="font-mono text-sm">
                              {user.userId}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {user.points
                                .toNumber()
                                .toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 6,
                                })}
                            </TableCell>
                          </TableRow>
                        ))}
                      {calculationResult.filter((user) => user.points.gt(0))
                        .length === 0 && (
                        <TableRow>
                          <TableCell colSpan={2} className="h-24 text-center">
                            No users with points found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
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
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead className="text-right">Season Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seasonPoints && seasonPoints.length > 0 ? (
                  seasonPoints.map((point) => (
                    <TableRow key={point.userId}>
                      <TableCell className="font-mono text-sm">
                        {point.userId}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {Number(point.points).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      No season points found for this week.
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
