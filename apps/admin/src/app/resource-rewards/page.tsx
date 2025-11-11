'use client';

import { Pencil, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
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

interface ResourceRewardFormData {
  address: string;
  points: string;
  weeklyLimit?: number;
  url?: string;
}

function CreateResourceRewardDialog({
  weekId,
  onSuccess,
}: {
  weekId: string;
  onSuccess: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<ResourceRewardFormData>({
    address: '',
    points: '',
    weeklyLimit: undefined,
    url: '',
  });

  const createMutation =
    api.admin.resourceReward.createResourceReward.useMutation({
      onSuccess: () => {
        toast.success('Resource reward created successfully for this week');
        setOpen(false);
        setFormData({
          address: '',
          points: '',
          weeklyLimit: undefined,
          url: '',
        });
        onSuccess();
      },
      onError: (error) => {
        toast.error(`Failed to create resource reward: ${error.message}`);
      },
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      points: Number(formData.points),
      weekId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Resource Reward
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Resource Reward to Week</DialogTitle>
          <DialogDescription>
            Add a resource reward to the currently selected week. Users can
            claim points by holding specific NFTs during this week.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="address">Resource Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="resource_rdx..."
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              value={formData.points}
              onChange={(e) =>
                setFormData({ ...formData, points: e.target.value })
              }
              placeholder="e.g., 100"
              min="0"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="weeklyLimit">Weekly Limit (optional)</Label>
            <Input
              id="weeklyLimit"
              type="number"
              value={formData.weeklyLimit ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  weeklyLimit: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              placeholder="e.g., 500"
              min="0"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="url">URL (optional)</Label>
            <Input
              id="url"
              type="url"
              value={formData.url ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  url: e.target.value || undefined,
                })
              }
              placeholder="https://example.com/get-nft"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending
                ? 'Creating...'
                : 'Create Resource Reward'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditResourceRewardDialog({
  reward,
  weekId,
  onSuccess,
}: {
  reward: {
    address: string;
    name?: string | null;
    points: number;
    weeklyLimit?: number | null;
    url?: string | null;
  };
  weekId: string;
  onSuccess: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<ResourceRewardFormData>({
    address: reward.address,
    points: reward.points.toString(),
    weeklyLimit: reward.weeklyLimit ?? undefined,
    url: reward.url ?? '',
  });

  const updateMutation =
    api.admin.resourceReward.updateResourceReward.useMutation({
      onSuccess: () => {
        toast.success('Resource reward updated successfully for this week');
        setOpen(false);
        onSuccess();
      },
      onError: (error) => {
        toast.error(`Failed to update resource reward: ${error.message}`);
      },
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      address: formData.address,
      points: Number(formData.points),
      weeklyLimit: formData.weeklyLimit,
      url: formData.url || undefined,
      weekId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 w-8 p-0"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Resource Reward for Week</DialogTitle>
          <DialogDescription>
            Update the points or weekly limit for this resource reward in the
            currently selected week.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-address">Resource Address</Label>
            <Input
              id="edit-address"
              value={formData.address}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-points">Points</Label>
            <Input
              id="edit-points"
              type="number"
              value={formData.points}
              onChange={(e) =>
                setFormData({ ...formData, points: e.target.value })
              }
              placeholder="e.g., 100"
              min="0"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-weeklyLimit">Weekly Limit (optional)</Label>
            <Input
              id="edit-weeklyLimit"
              type="number"
              value={formData.weeklyLimit ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  weeklyLimit: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                })
              }
              placeholder="e.g., 500"
              min="0"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-url">URL (optional)</Label>
            <Input
              id="edit-url"
              type="url"
              value={formData.url ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  url: e.target.value || undefined,
                })
              }
              placeholder="https://example.com/get-nft"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending
                ? 'Updating...'
                : 'Update Resource Reward'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteResourceRewardDialog({
  address,
  name,
  weekId,
  onSuccess,
}: {
  address: string;
  name?: string | null;
  weekId: string;
  onSuccess: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  const deleteMutation =
    api.admin.resourceReward.deleteResourceReward.useMutation({
      onSuccess: () => {
        toast.success('Resource reward removed from this week');
        setOpen(false);
        onSuccess();
      },
      onError: (error) => {
        toast.error(`Failed to delete resource reward: ${error.message}`);
      },
    });

  const handleDelete = () => {
    deleteMutation.mutate({ address, weekId });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Resource Reward from Week</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove the resource reward for{' '}
            <strong>{name || address}</strong> from this week? This will only
            remove it from the currently selected week, not from other weeks.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function ResourceRewardsPage() {
  const [selectedSeasonId, setSelectedSeasonId] = React.useState<string>('');
  const [selectedWeekId, setSelectedWeekId] = React.useState<string>('');

  // Get available seasons
  const { data: seasons, isLoading: isSeasonsLoading } =
    api.season.getSeasons.useQuery();

  // Auto-select the latest season when seasons data loads
  React.useEffect(() => {
    if (seasons && seasons.length > 0 && !selectedSeasonId) {
      // Find the active season, or use the first season
      const activeSeason = seasons.find((s) => s.status === 'active');
      const selectedSeason = activeSeason || seasons[0];
      if (selectedSeason) {
        setSelectedSeasonId(selectedSeason.id);
      }
    }
  }, [seasons, selectedSeasonId]);

  // Get season details with all weeks (including future weeks)
  const { data: seasonDetails, isLoading: isWeeksLoading } =
    api.season.getSeasonById.useQuery(
      { id: selectedSeasonId },
      { enabled: !!selectedSeasonId },
    );

  // Get weeks from the season details, sorted by start date (newest first)
  const filteredWeeks = React.useMemo(() => {
    const weeks = seasonDetails?.weeks ?? [];
    return [...weeks].sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );
  }, [seasonDetails]);

  // Auto-select the current week
  React.useEffect(() => {
    if (filteredWeeks.length > 0) {
      const now = new Date();
      // Find the current week (where now is between start and end date)
      const currentWeek = filteredWeeks.find(
        (week) =>
          new Date(week.startDate) <= now && new Date(week.endDate) >= now,
      );
      // If no current week, default to the most recent week
      const selectedWeek =
        currentWeek ||
        filteredWeeks.reduce((latest, current) =>
          new Date(current.endDate) > new Date(latest.endDate)
            ? current
            : latest,
        );
      setSelectedWeekId(selectedWeek.id);
    } else {
      setSelectedWeekId('');
    }
  }, [filteredWeeks]);

  const {
    data: resourceRewards,
    isLoading,
    refetch,
  } = api.admin.resourceReward.listResourceRewards.useQuery(
    { weekId: selectedWeekId },
    { enabled: !!selectedWeekId },
  );

  const handleRefresh = () => {
    void refetch();
  };

  // Get the selected season and week details for display
  const selectedSeason = seasons?.find((s) => s.id === selectedSeasonId);
  const selectedWeek = filteredWeeks.find((w) => w.id === selectedWeekId);

  return (
    <div className="container mx-auto py-6 pr-6 pl-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Resource Rewards
          </h1>
          <p className="text-muted-foreground">
            Manage resource rewards that users can claim by holding specific
            tokens or NFTs.
          </p>
        </div>
        {selectedWeekId && (
          <CreateResourceRewardDialog
            weekId={selectedWeekId}
            onSuccess={handleRefresh}
          />
        )}
      </div>

      <Separator className="my-6" />

      {/* Season and Week Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Season and Week</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Season Selector */}
          <div className="flex items-center gap-4">
            <Label htmlFor="season-select" className="min-w-fit">
              Season:
            </Label>
            {isSeasonsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedSeasonId}
                onValueChange={setSelectedSeasonId}
              >
                <SelectTrigger id="season-select" className="w-full">
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

          {/* Week Selector */}
          <div className="flex items-center gap-4">
            <Label htmlFor="week-select" className="min-w-fit">
              Week:
            </Label>
            {isWeeksLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedWeekId} onValueChange={setSelectedWeekId}>
                <SelectTrigger
                  id="week-select"
                  className="w-full"
                  disabled={!selectedSeasonId || filteredWeeks.length === 0}
                >
                  <SelectValue placeholder="Select a week" />
                </SelectTrigger>
                <SelectContent>
                  {filteredWeeks.map((week) => (
                    <SelectItem key={week.id} value={week.id}>
                      Week {new Date(week.startDate).toLocaleDateString()} -{' '}
                      {new Date(week.endDate).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Display selected details */}
          {selectedSeason && selectedWeek && (
            <div className="rounded-md border bg-muted/50 p-3">
              <p className="text-muted-foreground text-sm">
                <span className="font-medium">
                  Managing resource rewards for:
                </span>
                <br />
                Season:{' '}
                <span className="font-medium">{selectedSeason.name}</span> (
                {selectedSeason.status})
                <br />
                Week: {new Date(selectedWeek.startDate).toLocaleDateString()} -{' '}
                {new Date(selectedWeek.endDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Resource Rewards List */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ) : resourceRewards && resourceRewards.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Resource Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Resource Address</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Weekly limit</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resourceRewards.map((reward) => (
                  <TableRow key={reward.address}>
                    <TableCell className="font-medium">
                      {reward.name || 'Loading...'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <Link
                        href={`https://dashboard.radixdlt.com/resource/${reward.address}`}
                        target="_blank"
                        className="hover:underline"
                      >
                        {reward.address}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono">{reward.points}</TableCell>
                    <TableCell className="font-mono">
                      {reward.weeklyLimit ?? 'No limit'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {reward.url ? (
                        <Link
                          href={reward.url}
                          target="_blank"
                          className="text-blue-600 hover:underline"
                        >
                          {reward.url}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <EditResourceRewardDialog
                          reward={reward}
                          weekId={selectedWeekId}
                          onSuccess={handleRefresh}
                        />
                        <DeleteResourceRewardDialog
                          address={reward.address}
                          name={reward.name}
                          weekId={selectedWeekId}
                          onSuccess={handleRefresh}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <h3 className="font-semibold text-lg">
                No resource rewards found
              </h3>
              <p className="text-muted-foreground">
                Create your first resource reward to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
