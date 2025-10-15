'use client';

import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { toast } from 'sonner';
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
}

function CreateResourceRewardDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<ResourceRewardFormData>({
    address: '',
    points: '',
    weeklyLimit: undefined,
  });

  const createMutation =
    api.admin.resourceReward.createResourceReward.useMutation({
      onSuccess: () => {
        toast.success('Resource reward created successfully');
        setOpen(false);
        setFormData({
          address: '',
          points: '',
          weeklyLimit: undefined,
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
          <DialogTitle>Create New Resource Reward</DialogTitle>
          <DialogDescription>
            Create a new resource reward that users can claim by holding
            specific resources.
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

export default function ResourceRewardsPage() {
  const {
    data: resourceRewards,
    isLoading,
    refetch,
  } = api.admin.resourceReward.listResourceRewards.useQuery();

  const handleRefresh = () => {
    void refetch();
  };

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
        <CreateResourceRewardDialog onSuccess={handleRefresh} />
      </div>

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
                  <TableHead>Weekly limit</TableHead>
                  <TableHead>Points</TableHead>
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
                      >
                        {reward.address}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono">
                      {reward.weeklyLimit ?? 'No limit'}
                    </TableCell>

                    <TableCell className="font-mono">{reward.points}</TableCell>
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
