'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

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
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
import type { UpdateActivityInput } from 'api/incentives';
import type { Activity } from 'db/incentives';
import { api } from '~/trpc/react';

// Reusable form component (can be extracted later)
function ActivityForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitButtonText,
  dapps,
  activityCategories,
}: {
  initialData: Activity & { dapp?: string };
  onSubmit: (data: UpdateActivityInput) => void;
  isSubmitting: boolean;
  submitButtonText: string;
  dapps?: Array<{ id: string; name: string; website: string }>;
  activityCategories?: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
}) {
  const [formData, setFormData] = React.useState<Activity>(initialData);

  // Update state if initialData changes (e.g., after fetch)
  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: formData.id,
      activity: {
        name: formData.name ?? undefined,
        description: formData.description ?? undefined,
        category: formData.category ?? undefined,
        dapp: formData.dapp ?? undefined,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ID */}
      <div className="grid gap-2">
        <Label htmlFor="id">ID</Label>
        <Input
          id="id"
          name="id"
          value={formData.id}
          required
          readOnly
          disabled
        />
      </div>
      {/* Name */}
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name ?? ''}
          onChange={handleChange}
          required
        />
      </div>
      {/* Description */}
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description ?? ''}
          onChange={handleChange}
          className="min-h-[100px]"
        />
      </div>

      {/* Category */}
      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category || ''}
          onValueChange={(value) => handleSelectChange('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {activityCategories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dapp */}
      <div className="grid gap-2">
        <Label htmlFor="dapp">Dapp</Label>
        <Select
          value={formData.dapp || ''}
          onValueChange={(value) => handleSelectChange('dapp', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a dapp" />
          </SelectTrigger>
          <SelectContent>
            {dapps?.map((dapp) => (
              <SelectItem key={dapp.id} value={dapp.id}>
                {dapp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Actions */}
      <div className="flex justify-end space-x-2">
        {/* Link back to the activities list */}
        <Link href="/activities">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
}

// Main Page Component
function EditActivityPage() {
  const { id: activityId } = useParams<{ id: string }>();
  const { data, isLoading: loading } = api.activity.getActivityById.useQuery({
    id: activityId,
  });
  const { data: dapps } = api.dapps.getDapps.useQuery();
  const { data: activityCategories } =
    api.activity.getActivityCategories.useQuery();

  const { mutate: updateActivity, isPending: isSubmitting } =
    api.activity.updateActivity.useMutation();

  const activity = data?.activity;

  // Placeholder submit handler for updates
  const handleUpdateActivity = (data: UpdateActivityInput) => {
    updateActivity(data, {
      onSuccess: () => {
        toast.success('Activity updated successfully');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  if (loading) {
    return <div className="p-6">Loading activity details...</div>;
  }

  if (!activity) {
    // Render a not found message or redirect if activity couldn't be loaded
    return (
      <div className="container mx-auto py-6 pl-6 pr-6">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/activities">
            <Button variant="ghost" size="icon" aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Activity Not Found</h1>
        </div>
        <p>The requested activity could not be found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 pl-6 pr-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        {/* Link back to activity list page */}
        <Link href="/activities">
          <Button variant="ghost" size="icon" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Activity</h1>
          <p className="text-muted-foreground">
            Modify details for: {activity.id}
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Form Card */}
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Activity Details</CardTitle>
            <CardDescription>Update the activity configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityForm
              initialData={{
                id: activity.id,
                name: activity.name,
                description: activity.description,
                category: activity.category,
                dapp: activity.dapp ?? '',
              }}
              onSubmit={handleUpdateActivity}
              isSubmitting={isSubmitting}
              submitButtonText="Save Changes"
              dapps={dapps}
              activityCategories={activityCategories ?? []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EditActivityPage;
