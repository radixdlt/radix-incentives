'use client';

import BigNumber from 'bignumber.js';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
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

type SortField = 'label' | 'amount' | 'claimedAmount' | 'claimStatus';
type SortDirection = 'asc' | 'desc';

function formatAmount(amount: string): string {
  const bn = new BigNumber(amount);
  if (bn.gte(1_000_000)) {
    return `${bn.dividedBy(1_000_000).toFixed(2)}M`;
  }
  if (bn.gte(1_000)) {
    return `${bn.dividedBy(1_000).toFixed(2)}K`;
  }
  return bn.toFixed(2);
}

function ClaimStatusBadge({
  status,
}: {
  status: 'unclaimed' | 'partial' | 'claimed' | 'pending';
}) {
  const styles = {
    unclaimed: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    partial: 'bg-blue-100 text-blue-800',
    claimed: 'bg-green-100 text-green-800',
  };

  const labels = {
    unclaimed: 'Unclaimed',
    pending: 'Pending',
    partial: 'Partial',
    claimed: 'Claimed',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function SortableHeader({
  label,
  field,
  currentField,
  currentDirection,
  onSort,
  align = 'left',
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
  align?: 'left' | 'right';
}) {
  const isActive = currentField === field;

  return (
    <div className={align === 'right' ? 'flex justify-end' : ''}>
      <button
        type="button"
        className="flex items-center gap-1 font-medium hover:text-foreground"
        onClick={() => onSort(field)}
      >
        {label}
        {isActive ? (
          currentDirection === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-50" />
        )}
      </button>
    </div>
  );
}

export default function UserSeasonRewardsPage() {
  const [selectedSeasonId, setSelectedSeasonId] = React.useState<string>('');
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(50);
  const [sortField, setSortField] = React.useState<SortField>('amount');
  const [sortDirection, setSortDirection] =
    React.useState<SortDirection>('desc');

  // Get available seasons
  const { data: seasons, isLoading: isSeasonsLoading } =
    api.season.getSeasons.useQuery();

  // Auto-select the first season when data loads
  React.useEffect(() => {
    if (seasons && seasons.length > 0 && !selectedSeasonId) {
      const activeSeason = seasons.find((s) => s.status === 'active');
      const completedSeason = seasons.find((s) => s.status === 'completed');
      const selectedSeason = activeSeason || completedSeason || seasons[0];
      if (selectedSeason) {
        setSelectedSeasonId(selectedSeason.id);
      }
    }
  }, [seasons, selectedSeasonId]);

  // Get season reward stats
  const { data: stats, isLoading: isStatsLoading } =
    api.admin.seasonReward.getSeasonRewardStats.useQuery(
      { seasonId: selectedSeasonId },
      { enabled: !!selectedSeasonId },
    );

  // Get paginated rewards
  const {
    data: rewardsData,
    isLoading: isRewardsLoading,
    isFetching,
  } = api.admin.seasonReward.listUserSeasonRewards.useQuery(
    {
      seasonId: selectedSeasonId,
      page,
      limit,
      sortField,
      sortDirection,
    },
    { enabled: !!selectedSeasonId },
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setPage(1); // Reset to first page when sorting changes
  };

  const handleSeasonChange = (seasonId: string) => {
    setSelectedSeasonId(seasonId);
    setPage(1); // Reset to first page when season changes
  };

  const handleLimitChange = (newLimit: string) => {
    setLimit(Number(newLimit));
    setPage(1);
  };

  const totalPages = rewardsData?.totalPages ?? 1;

  return (
    <div className="container mx-auto py-6 pr-6 pl-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="font-bold text-3xl tracking-tight">
          User Season Rewards
        </h1>
        <p className="text-muted-foreground">
          View and manage user rewards for each season.
        </p>
      </div>

      <Separator className="my-6" />

      {/* Season Selector */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">Season:</span>
          {isSeasonsLoading ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <Select value={selectedSeasonId} onValueChange={handleSeasonChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select a season" />
              </SelectTrigger>
              <SelectContent>
                {seasons?.map((season) => (
                  <SelectItem key={season.id} value={season.id}>
                    {season.name} ({season.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {selectedSeasonId && (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-medium text-muted-foreground text-sm">
                Season
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="font-bold text-2xl">{stats?.seasonName}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-medium text-muted-foreground text-sm">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="font-bold text-2xl">
                  {stats?.totalUsers.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-medium text-muted-foreground text-sm">
                Total Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="font-bold text-2xl">
                  {formatAmount(stats?.totalRewardAmount ?? '0')} XRD
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-medium text-muted-foreground text-sm">
                Total Claimed
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="font-bold text-2xl">
                  {formatAmount(stats?.totalClaimedAmount ?? '0')} XRD
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Separator className="my-6" />

      {/* Table Controls */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {rewardsData
            ? `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, rewardsData.total)} of ${rewardsData.total} users`
            : 'Loading...'}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Show:</span>
          <Select value={limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Rewards Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableHeader
                    label="User"
                    field="label"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader
                    label="Reward Amount"
                    field="amount"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    align="right"
                  />
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader
                    label="Claimed Amount"
                    field="claimedAmount"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    align="right"
                  />
                </TableHead>
                <TableHead className="pl-6">
                  <SortableHeader
                    label="Status"
                    field="claimStatus"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                  />
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isRewardsLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading rewards...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : rewardsData && rewardsData.rewards.length > 0 ? (
                rewardsData.rewards.map((reward) => (
                  <TableRow key={reward.userId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {reward.userLabel || 'Unknown User'}
                        </p>
                        <p className="font-mono text-muted-foreground text-xs">
                          {reward.userId.slice(0, 8)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatAmount(reward.amount)} XRD
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatAmount(reward.claimedAmount)} XRD
                    </TableCell>
                    <TableCell className="pl-6">
                      <ClaimStatusBadge status={reward.claimStatus} />
                    </TableCell>
                    <TableCell>
                      <Link href={`/users/${reward.userId}`}>
                        <Button variant="ghost" size="sm">
                          View User
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    <div className="text-muted-foreground">
                      <p className="font-medium text-lg">No rewards found</p>
                      <p className="text-sm">
                        There are no user rewards for this season.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          Page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || isFetching}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages || isFetching}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
