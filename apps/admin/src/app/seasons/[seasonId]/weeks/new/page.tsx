'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import { WeekPicker } from '~/components/ui/week-picker';
import { api } from '~/trpc/react';

// --- Form Component ---
function CreateWeekForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: {
    seasonId: string;
    startDate: Date;
    endDate: Date;
  }) => void;
  isSubmitting: boolean;
}) {
  const params = useParams<{ seasonId: string }>();
  const seasonId = params.seasonId;
  const [selectedWeek, setSelectedWeek] = React.useState<
    { start: Date; end: Date } | undefined
  >();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWeek) {
      alert('Please select a week.');
      return;
    }

    onSubmit({
      seasonId,
      startDate: selectedWeek.start,
      endDate: selectedWeek.end,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="weekPicker">Select Week</Label>
          <WeekPicker
            selectedWeek={selectedWeek}
            onWeekSelect={setSelectedWeek}
          />
        </div>

        {selectedWeek && (
          <div className="grid gap-2">
            <Label>Week Range (ISO Format)</Label>
            <div className="rounded-md bg-muted p-3">
              <div className="space-y-1 text-sm">
                <div>
                  <strong>Start:</strong> {selectedWeek.start.toISOString()}{' '}
                  (Monday)
                </div>
                <div>
                  <strong>End:</strong> {selectedWeek.end.toISOString()}{' '}
                  (Sunday)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Link href="..">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

// --- Page Component ---
function CreateWeekPage() {
  const params = useParams();
  const router = useRouter();
  const seasonId = params.seasonId as string;
  const utils = api.useUtils();

  const { data: seasonData, isLoading } = api.season.getSeasonById.useQuery({
    id: seasonId,
  });

  const createWeek = api.week.createWeek.useMutation();

  const handleCreateWeek = async (data: {
    seasonId: string;
    startDate: Date;
    endDate: Date;
  }) => {
    try {
      await createWeek.mutateAsync({
        seasonId: data.seasonId,
        startDate: data.startDate,
        endDate: data.endDate,
      });

      toast.success('Week created successfully!');
      await utils.season.getSeasonById.invalidate({ id: seasonId });
      router.push(`/seasons/${seasonId}`);
    } catch (error) {
      console.error('Failed to create week:', error);
      toast.error('Failed to create week. Please try again.');
    }
  };

  const seasonName = seasonData?.season?.name || '';

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 pr-6 pl-6">
        <div className="mb-6 flex items-center gap-4">
          <Link href={`/seasons/${seasonId}`}>
            <Button variant="ghost" size="icon" aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-3xl tracking-tight">
              Create New Week
            </h1>
            <p className="text-muted-foreground">Loading season data...</p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="mx-auto max-w-2xl">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 w-1/4 rounded bg-gray-200" />
                <div className="h-10 rounded bg-gray-200" />
                <div className="h-4 w-1/4 rounded bg-gray-200" />
                <div className="h-10 rounded bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!seasonData?.season) {
    return (
      <div className="container mx-auto py-6 pr-6 pl-6">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/seasons">
            <Button variant="ghost" size="icon" aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-3xl tracking-tight">
              Create New Week
            </h1>
            <p className="text-muted-foreground">Season not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 pr-6 pl-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/seasons/${seasonId}`}>
          <Button variant="ghost" size="icon" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Create New Week</h1>
          <p className="text-muted-foreground">
            Add a new week configuration to Season: {seasonName}
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Week Details</CardTitle>
            <CardDescription>
              Define the parameters and active activities for the new week.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateWeekForm
              onSubmit={handleCreateWeek}
              isSubmitting={createWeek.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreateWeekPage;
