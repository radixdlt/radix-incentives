'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

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
import { Textarea } from '~/components/ui/textarea';
import { Separator } from '~/components/ui/separator';
import { api } from '~/trpc/react';
import type { Season } from 'db/incentives';
import { toast } from 'sonner';

interface CreateSeasonFormProps {
  onSubmit: (data: Omit<Season, 'id'>) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

function CreateSeasonForm({
  onSubmit,
  isSubmitting = false,
  onCancel,
}: CreateSeasonFormProps) {
  const [name, setName] = React.useState('');
  const [status, setStatus] = React.useState<
    'active' | 'upcoming' | 'completed'
  >('upcoming');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      onSubmit({
        name,
        status: 'upcoming',
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
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Season'}
        </Button>
      </div>
    </form>
  );
}

function CreateSeasonPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const createSeason = api.season.createSeason.useMutation();

  const handleCreateSeason = async (data: Omit<Season, 'id'>) => {
    try {
      const newSeason = await createSeason.mutateAsync(data);
      toast.success('Season created successfully!');
      await utils.season.getSeasons.invalidate();
      router.push('/seasons');
    } catch (error) {
      console.error('Failed to create season:', error);
      toast.error('Failed to create season. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/seasons');
  };

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
            Create New Season
          </h1>
          <p className="text-muted-foreground">
            Add a new season to the campaign configuration.
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Season Details</CardTitle>
            <CardDescription>
              Provide the name, start date, end date, status, and an optional
              description for the new season.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateSeasonForm
              onSubmit={handleCreateSeason}
              isSubmitting={createSeason.isPending}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreateSeasonPage;
