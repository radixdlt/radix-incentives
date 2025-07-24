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
import { Switch } from '~/components/ui/switch';
import { Separator } from '~/components/ui/separator';
import type {
  Activity,
  ActivityCategory,
  Dapp,
  UpdateActivityInput,
} from 'api/incentives';
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
  initialData: Activity;
  onSubmit: (data: UpdateActivityInput) => void;
  isSubmitting: boolean;
  submitButtonText: string;
  dapps: Dapp[];
  activityCategories?: ActivityCategory[];
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
        componentAddresses: formData.componentAddresses,
        data: {
          ...formData.data,
          showOnEarnPage: formData.data?.showOnEarnPage ?? true,
          multiplier: formData.data?.multiplier ?? false,
          ap: formData.data?.ap ?? false,
        },
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
        <Input
          id="category"
          name="category"
          value={
            activityCategories?.find((cat) => cat.id === formData.category)
              ?.name ||
            formData.category ||
            ''
          }
          disabled={true}
          readOnly={true}
          className="bg-muted cursor-not-allowed opacity-60"
          tabIndex={-1}
          onFocus={(e) => e.target.blur()}
          onClick={(e) => e.preventDefault()}
        />
      </div>

      {/* Dapp */}
      <div className="grid gap-2">
        <Label htmlFor="dapp">Dapp</Label>
        <Input
          id="dapp"
          name="dapp"
          value={
            dapps?.find((dapp) => dapp.id === formData.dapp)?.name ||
            formData.dapp ||
            '-'
          }
          disabled={true}
          readOnly={true}
          className="bg-muted cursor-not-allowed opacity-60"
          tabIndex={-1}
          onFocus={(e) => e.target.blur()}
          onClick={(e) => e.preventDefault()}
        />
      </div>

      {/* Component Addresses */}
      <div className="grid gap-2">
        <Label htmlFor="componentAddresses">Component Addresses</Label>
        <div className="space-y-2">
          {formData.componentAddresses &&
          formData.componentAddresses.length > 0 ? (
            formData.componentAddresses.map((address) => (
              <Input
                key={address}
                value={address}
                disabled={true}
                readOnly={true}
                className="bg-muted cursor-not-allowed opacity-60 font-mono text-xs"
                tabIndex={-1}
                onFocus={(e) => e.target.blur()}
                onClick={(e) => e.preventDefault()}
              />
            ))
          ) : (
            <Input
              value="No component addresses configured"
              disabled={true}
              readOnly={true}
              className="bg-muted cursor-not-allowed opacity-60 italic"
              tabIndex={-1}
              onFocus={(e) => e.target.blur()}
              onClick={(e) => e.preventDefault()}
            />
          )}
        </div>
      </div>

      {/* Show on earn page */}
      <div className="flex items-center space-x-2">
        <Switch
          id="showOnEarnPage"
          checked={formData.data?.showOnEarnPage ?? true}
          disabled={isSubmitting}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              data: { ...prev.data, showOnEarnPage: checked },
            }))
          }
        />
        <Label
          htmlFor="showOnEarnPage"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Show on earn page
        </Label>
      </div>

      {/* Activity Points (AP) */}
      <div className="flex items-center space-x-2">
        <Switch
          id="ap"
          checked={formData.data?.ap ?? false}
          disabled={isSubmitting}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              data: { ...prev.data, ap: checked },
            }))
          }
        />
        <Label
          htmlFor="ap"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Activity Points
        </Label>
      </div>

      {/* Multiplier */}
      <div className="flex items-center space-x-2">
        <Switch
          id="sp"
          checked={formData.data?.multiplier ?? false}
          disabled={isSubmitting}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              data: { ...prev.data, multiplier: checked },
            }))
          }
        />
        <Label
          htmlFor="sp"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Multiplier
        </Label>
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
  const router = useRouter();
  const utils = api.useUtils();
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
        utils.activity.invalidate();
        router.push('/activities');
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
              initialData={activity}
              onSubmit={handleUpdateActivity}
              isSubmitting={isSubmitting}
              submitButtonText="Save Changes"
              dapps={dapps ?? []}
              activityCategories={activityCategories ?? []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EditActivityPage;
