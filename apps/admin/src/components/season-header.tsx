'use client';

import { ArrowLeft, Calculator, Edit, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
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
import type { RouterInputs } from '~/trpc/react';
import { api } from '~/trpc/react';

interface SeasonHeaderProps {
  seasonName: string;
  seasonId: string;
  seasonStatus: 'active' | 'upcoming' | 'completed';
}

export const SeasonHeader: React.FC<SeasonHeaderProps> = ({
  seasonName,
  seasonId,
  seasonStatus,
}) => {
  const router = useRouter();
  const utils = api.useUtils();
  const [isOpen, setIsOpen] = useState(false);
  const [isCalculateRewardOpen, setIsCalculateRewardOpen] = useState(false);
  const [rewardBudget, setRewardBudget] = useState('');

  const editSeason = api.season.editSeason.useMutation({
    onSuccess: async () => {
      toast.success('Season ended successfully!');
      setIsOpen(false);
      await utils.season.getSeasons.invalidate();
      await utils.season.getSeasonById.invalidate({ id: seasonId });
      router.refresh();
    },
    onError: (error) => {
      console.error('Failed to end season:', error);
      toast.error('Failed to end season. Please try again.');
    },
  });

  const calculateRewards = api.season.calculateRewards.useMutation({
    onSuccess: async (data) => {
      toast.success(
        `Rewards calculated successfully for ${data.userCount} users!`,
      );
      setIsCalculateRewardOpen(false);
      setRewardBudget('');
      await utils.season.getSeasonById.invalidate({ id: seasonId });
      router.refresh();
    },
    onError: (error) => {
      console.error('Failed to calculate rewards:', error);
      toast.error('Failed to calculate rewards. Please try again.');
    },
  });

  const handleEndSeason = async () => {
    // Get the current season to preserve the name
    const currentSeason = await utils.season.getSeasonById.fetch({
      id: seasonId,
    });

    if (!currentSeason?.season) {
      toast.error('Failed to load season details.');
      return;
    }

    editSeason.mutate({
      id: seasonId,
      name: currentSeason.season.name,
      status: 'completed',
    });
  };

  const canEndSeason = seasonStatus !== 'completed';
  const canCalculateRewards = seasonStatus === 'completed';

  const handleCalculateRewards = () => {
    if (!rewardBudget.trim()) {
      toast.error('Please enter a reward budget.');
      return;
    }

    calculateRewards.mutate({
      seasonId,
      rewardBudget: rewardBudget.trim(),
    } as unknown as RouterInputs['season']['calculateRewards']);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsCalculateRewardOpen(open);
    if (!open) {
      setRewardBudget('');
    }
  };

  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Link href="/seasons">
          <Button variant="ghost" size="icon" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Season Details</h1>
          <p className="text-muted-foreground">
            View details for {seasonName}.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {canEndSeason && (
          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <XCircle className="mr-2 h-4 w-4" /> End Season
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End Season</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to end {seasonName}? This will change
                  the season status to completed. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleEndSeason}
                  disabled={editSeason.isPending}
                >
                  {editSeason.isPending ? 'Ending...' : 'End Season'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {canCalculateRewards && (
          <Dialog
            open={isCalculateRewardOpen}
            onOpenChange={handleDialogOpenChange}
          >
            <DialogTrigger asChild>
              <Button variant="default">
                <Calculator className="mr-2 h-4 w-4" /> Calculate Reward
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Calculate Season Rewards</DialogTitle>
                <DialogDescription>
                  Calculate and save rewards for all users in {seasonName}.
                  Enter the total reward budget (in XRD) to distribute. This
                  will overwrite any existing reward calculations for this
                  season.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="rewardBudget">Reward Budget (XRD)</Label>
                  <Input
                    id="rewardBudget"
                    type="text"
                    placeholder="e.g., 100000000"
                    value={rewardBudget}
                    onChange={(e) => setRewardBudget(e.target.value)}
                    disabled={calculateRewards.isPending}
                  />
                  <p className="text-muted-foreground text-xs">
                    Enter the total reward budget as a decimal number (e.g.,
                    100000000 for 100M XRD)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogOpenChange(false)}
                  disabled={calculateRewards.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCalculateRewards}
                  disabled={calculateRewards.isPending || !rewardBudget.trim()}
                >
                  {calculateRewards.isPending
                    ? 'Calculating...'
                    : 'Calculate Rewards'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <Link href={`/seasons/${seasonId}/edit`}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" /> Edit Season
          </Button>
        </Link>
      </div>
    </div>
  );
};
