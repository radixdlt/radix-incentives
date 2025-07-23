'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { use } from 'react';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { api } from '~/trpc/react';
import type { Season } from 'db/incentives';
import { toast } from 'sonner';

type EditSeasonPageProps = {
  params: Promise<{
    seasonId: string;
  }>;
};

interface EditSeasonFormProps {
  season: Season;
  onSubmit: (data: { id: string; name: string; status: 'active' | 'upcoming' | 'completed' }) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

function EditSeasonForm({
  season,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: EditSeasonFormProps) {
  const [name, setName] = React.useState(season.name);
  const [status, setStatus] = React.useState<
    'active' | 'upcoming' | 'completed'
  >(season.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      onSubmit({
        id: season.id,
        name,
        status,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Season Name</Label>
          <Input
            id="name"
            placeholder="Enter season name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value: 'active' | 'upcoming' | 'completed') => setStatus(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Season'}
        </Button>
      </div>
    </form>
  );
}

function EditSeasonPage({ params: paramsPromise }: EditSeasonPageProps) {
  const params = use(paramsPromise);
  const router = useRouter();
  const utils = api.useUtils();
  
  const { data: season, isLoading, error } = api.season.getSeasonById.useQuery({
    id: params.seasonId,
  });
  
  const editSeason = api.season.editSeason.useMutation();

  const handleEditSeason = async (data: { id: string; name: string; status: 'active' | 'upcoming' | 'completed' }) => {
    try {
      await editSeason.mutateAsync(data);
      toast.success('Season updated successfully!');
      await utils.season.getSeasons.invalidate();
      await utils.season.getSeasonById.invalidate({ id: params.seasonId });
      router.push('/seasons');
    } catch (error) {
      console.error('Failed to update season:', error);
      toast.error('Failed to update season. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/seasons');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 pl-6">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/seasons">
            <Button variant="ghost" size="icon" aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Season
            </h1>
            <p className="text-muted-foreground">
              Loading season details...
            </p>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-10 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !season?.season) {
    return (
      <div className="container mx-auto py-6 pl-6">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/seasons">
            <Button variant="ghost" size="icon" aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Season
            </h1>
            <p className="text-muted-foreground">
              Season not found or error loading season.
            </p>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                {error?.message || 'Season not found'}
              </p>
              <Button onClick={handleCancel} className="mt-4">
                Go Back to Seasons
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 pl-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/seasons">
          <Button variant="ghost" size="icon" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Season
          </h1>
          <p className="text-muted-foreground">
            Update the season name and status.
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Season Details</CardTitle>
            <CardDescription>
              Update the season name and status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditSeasonForm
              season={season.season}
              onSubmit={handleEditSeason}
              isSubmitting={editSeason.isPending}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EditSeasonPage;