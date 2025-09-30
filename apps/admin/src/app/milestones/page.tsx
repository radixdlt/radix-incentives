'use client';

import {
  CheckCircle,
  Edit,
  Lock,
  PlusCircle,
  Trash2,
  Unlock,
} from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
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

type MilestoneType = 'tvl' | 'transactions' | 'dex_volume' | 'wallet_downloads';

const milestoneTypeLabels: Record<MilestoneType, string> = {
  tvl: 'Total Value Locked',
  transactions: 'Transactions',
  dex_volume: 'DEX Volume',
  wallet_downloads: 'Wallet Downloads',
};

const milestoneTypes: MilestoneType[] = [
  'tvl',
  'transactions',
  'dex_volume',
  'wallet_downloads',
];

interface MilestoneFormData {
  seasonId: string;
  type: MilestoneType;
  goal: string;
  rewardXrd: string;
  currentValue?: string;
}

interface EditMilestoneFormData extends MilestoneFormData {
  originalGoal: string;
  newGoal?: string;
  isAchieved: boolean;
}

function CreateMilestoneDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<MilestoneFormData>({
    seasonId: '',
    type: 'tvl',
    goal: '',
    rewardXrd: '',
  });

  const { data: seasons } = api.season.getSeasons.useQuery();
  const createMutation = api.milestones.createMilestone.useMutation({
    onSuccess: () => {
      toast.success('Milestone created successfully');
      setOpen(false);
      setFormData({
        seasonId: '',
        type: 'tvl',
        goal: '',
        rewardXrd: '',
      });
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to create milestone: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Milestone
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Milestone</DialogTitle>
          <DialogDescription>
            Create a new milestone for a season.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="season">Season</Label>
            <Select
              value={formData.seasonId}
              onValueChange={(value) =>
                setFormData({ ...formData, seasonId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a season" />
              </SelectTrigger>
              <SelectContent>
                {seasons?.map((season) => (
                  <SelectItem key={season.id} value={season.id}>
                    {season.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: MilestoneType) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {milestoneTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {milestoneTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="goal">Goal</Label>
            <Input
              id="goal"
              value={formData.goal}
              onChange={(e) =>
                setFormData({ ...formData, goal: e.target.value })
              }
              placeholder="e.g., 1000000"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rewardXrd">Reward XRD</Label>
            <Input
              id="rewardXrd"
              value={formData.rewardXrd}
              onChange={(e) =>
                setFormData({ ...formData, rewardXrd: e.target.value })
              }
              placeholder="e.g., 10000000"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Milestone'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditMilestoneDialog({
  milestone,
  onSuccess,
}: {
  milestone: any;
  onSuccess: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<EditMilestoneFormData>({
    seasonId: milestone.seasonId,
    type: milestone.type,
    goal: milestone.goal,
    originalGoal: milestone.goal,
    newGoal: milestone.goal,
    rewardXrd: milestone.rewardXrd,
    currentValue: milestone.currentValue,
    isAchieved: milestone.isAchieved,
  });

  const updateMutation = api.milestones.updateMilestone.useMutation({
    onSuccess: () => {
      toast.success('Milestone updated successfully');
      setOpen(false);
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to update milestone: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatePayload: any = {
      seasonId: formData.seasonId,
      type: formData.type,
      goal: formData.originalGoal,
    };

    // Only include changed values
    if (formData.newGoal !== formData.originalGoal) {
      updatePayload.newGoal = formData.newGoal;
    }

    if (formData.rewardXrd !== milestone.rewardXrd) {
      updatePayload.rewardXrd = formData.rewardXrd;
    }

    if (formData.currentValue !== milestone.currentValue) {
      updatePayload.currentValue = formData.currentValue;
    }

    if (formData.isAchieved !== milestone.isAchieved) {
      updatePayload.isAchieved = formData.isAchieved;
    }

    updateMutation.mutate(updatePayload);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Milestone</DialogTitle>
          <DialogDescription>Update milestone details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="newGoal">Goal</Label>
            <Input
              id="newGoal"
              value={formData.newGoal}
              onChange={(e) =>
                setFormData({ ...formData, newGoal: e.target.value })
              }
              placeholder="e.g., 1000000"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rewardXrd">Reward XRD</Label>
            <Input
              id="rewardXrd"
              value={formData.rewardXrd}
              onChange={(e) =>
                setFormData({ ...formData, rewardXrd: e.target.value })
              }
              placeholder="e.g., 10000000"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="currentValue">Current Value</Label>
            <Input
              id="currentValue"
              value={formData.currentValue}
              onChange={(e) =>
                setFormData({ ...formData, currentValue: e.target.value })
              }
              placeholder="e.g., 500000"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAchieved"
              checked={formData.isAchieved}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isAchieved: !!checked })
              }
            />
            <Label htmlFor="isAchieved">
              Mark as achieved (admin override)
            </Label>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update Milestone'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteMilestoneDialog({
  milestone,
  onSuccess,
}: {
  milestone: any;
  onSuccess: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  const deleteMutation = api.milestones.deleteMilestone.useMutation({
    onSuccess: () => {
      toast.success('Milestone deleted successfully');
      setOpen(false);
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to delete milestone: ${error.message}`);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate({
      seasonId: milestone.seasonId,
      type: milestone.type,
      goal: milestone.goal,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Milestone</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this milestone? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground text-sm">
            <strong>Type:</strong>{' '}
            {milestoneTypeLabels[milestone.type as MilestoneType]}
            <br />
            <strong>Goal:</strong> {milestone.goal}
            <br />
            <strong>Reward:</strong> {milestone.rewardXrd} XRD
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ManageMilestonesPage() {
  const {
    data: milestones,
    isLoading,
    refetch,
  } = api.milestones.getAllMilestonesGroupedBySeason.useQuery();
  const { data: seasons } = api.season.getSeasons.useQuery();

  const toggleAchievementMutation = api.milestones.updateMilestone.useMutation({
    onSuccess: () => {
      toast.success('Milestone achievement status updated');
      void refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update milestone: ${error.message}`);
    },
  });

  // Group milestones by season
  const milestonesByseason = React.useMemo(() => {
    if (!milestones || !seasons) return {};

    const grouped: Record<string, any[]> = {};

    for (const milestone of milestones) {
      if (!grouped[milestone.seasonId]) {
        grouped[milestone.seasonId] = [];
      }
      grouped[milestone.seasonId]?.push(milestone);
    }

    return grouped;
  }, [milestones, seasons]);

  const seasonNames = React.useMemo(() => {
    if (!seasons) return {};
    return Object.fromEntries(seasons.map((s) => [s.id, s.name]));
  }, [seasons]);

  const handleRefresh = () => {
    void refetch();
  };

  const handleToggleAchievement = (milestone: any, newStatus: boolean) => {
    toggleAchievementMutation.mutate({
      seasonId: milestone.seasonId,
      type: milestone.type,
      goal: milestone.goal,
      isAchieved: newStatus,
    });
  };

  return (
    <div className="container mx-auto py-6 pr-6 pl-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Manage Milestones
          </h1>
          <p className="text-muted-foreground">
            Create, edit, and manage campaign milestones grouped by season.
          </p>
        </div>
        <CreateMilestoneDialog onSuccess={handleRefresh} />
      </div>

      <Separator className="my-6" />

      {/* Milestones by Season */}
      {isLoading ? (
        <div className="space-y-6">
          {[0, 1, 2].map((skeletonId) => (
            <Card key={`skeleton-${skeletonId}`}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : Object.keys(milestonesByseason).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(milestonesByseason).map(
            ([seasonId, seasonMilestones]) => (
              <Card key={seasonId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{seasonNames[seasonId] || `Season ${seasonId}`}</span>
                    <Badge variant="secondary">
                      {seasonMilestones.length} milestone
                      {seasonMilestones.length !== 1 ? 's' : ''}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Goal</TableHead>
                        <TableHead>Current Value</TableHead>
                        <TableHead>Achieved</TableHead>
                        <TableHead>Reward XRD</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {seasonMilestones.map((milestone) => (
                        <TableRow
                          key={`${milestone.seasonId}-${milestone.type}-${milestone.goal}`}
                        >
                          <TableCell>
                            <Badge variant="outline">
                              {
                                milestoneTypeLabels[
                                  milestone.type as MilestoneType
                                ]
                              }
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">
                            {milestone.goal}
                          </TableCell>
                          <TableCell className="font-mono">
                            {milestone.currentValue}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {milestone.isAchieved ? (
                                <Badge
                                  variant="default"
                                  className="bg-green-500"
                                >
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Achieved
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Not Achieved</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">
                            {milestone.rewardXrd}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(milestone.lastUpdated).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {milestone.isAchieved ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleToggleAchievement(milestone, false)
                                  }
                                  disabled={toggleAchievementMutation.isPending}
                                  title="Unlock milestone"
                                >
                                  <Unlock className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleToggleAchievement(milestone, true)
                                  }
                                  disabled={toggleAchievementMutation.isPending}
                                  title="Force achieve milestone"
                                >
                                  <Lock className="h-4 w-4" />
                                </Button>
                              )}
                              <EditMilestoneDialog
                                milestone={milestone}
                                onSuccess={handleRefresh}
                              />
                              <DeleteMilestoneDialog
                                milestone={milestone}
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
            ),
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <h3 className="font-semibold text-lg">No milestones found</h3>
              <p className="text-muted-foreground">
                Create your first milestone to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ManageMilestonesPage;
