"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Separator } from "~/components/ui/separator";

// Define Activity type (reuse from create/list page)
type ActivityInput = {
  id?: string;
  name: string;
  description: string;
  type: "Passive" | "Active";
  rewardType: "Points" | "Multiplier";
  priority: "High" | "Moderate" | "Low";
  category: string;
  rules: string;
};

// Mock data - Add descriptions
const mockActivitiesData: ActivityInput[] = [
  {
    id: "a1",
    name: "Holding XRD or Staking (LSUs)",
    type: "Passive",
    rewardType: "Multiplier",
    priority: "High",
    category: "Holding",
    description: "Multiplier for holding XRD/LSU",
    rules: '{ "minHoldingUSD": 50, "durationDays": 1 }',
  },
  {
    id: "a2",
    name: "Bridging/holding stable assets (xUSDC, xUSDT)",
    type: "Passive",
    rewardType: "Points",
    priority: "High",
    category: "Holding",
    description: "Points for holding stables",
    rules: '{ "minHoldingUSD": 100 }',
  },
  {
    id: "a3",
    name: "Trading volume in bluechip volatiles (xBTC, xETH)",
    type: "Active",
    rewardType: "Points",
    priority: "High",
    category: "Trading",
    description: "Points for trading BTC/ETH",
    rules: '{ "minTradeValueUSD": 10 }',
  },
  // ... add other mock activities if needed for testing specific IDs
];

// Mock fetch function
const fetchActivityById = (id: string): ActivityInput | null => {
  console.log(`Mock fetching activity with ID: ${id}`);
  return mockActivitiesData.find((a) => a.id === id) || null;
};

// Reusable form component (can be extracted later)
function ActivityForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitButtonText,
}: {
  initialData: ActivityInput;
  onSubmit: (data: ActivityInput) => void;
  isSubmitting: boolean;
  submitButtonText: string;
}) {
  const [formData, setFormData] = React.useState<ActivityInput>(initialData);

  // Update state if initialData changes (e.g., after fetch)
  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof ActivityInput) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form fields are identical to CreateActivityForm... */}
      {/* Name */}
      <div className="grid gap-2">
        <Label htmlFor="name">Activity Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
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
          value={formData.description}
          onChange={handleChange}
          className="min-h-[100px]"
        />
      </div>
      {/* Type, Reward Type, Priority */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Type Select */}
        <div className="grid gap-2">
          <Label htmlFor="type">Type</Label>
          <Select
            name="type"
            value={formData.type}
            onValueChange={handleSelectChange("type")}
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Passive">Passive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Reward Type Select */}
        <div className="grid gap-2">
          <Label htmlFor="rewardType">Reward Type</Label>
          <Select
            name="rewardType"
            value={formData.rewardType}
            onValueChange={handleSelectChange("rewardType")}
          >
            <SelectTrigger id="rewardType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Points">Points</SelectItem>
              <SelectItem value="Multiplier">Multiplier</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Priority Select */}
        <div className="grid gap-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            name="priority"
            value={formData.priority}
            onValueChange={handleSelectChange("priority")}
          >
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Moderate">Moderate</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Category */}
      <div className="grid gap-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
        />
        <p className="text-xs text-muted-foreground">
          Helps group activities (optional).
        </p>
      </div>
      {/* Rules */}
      <div className="grid gap-2">
        <Label htmlFor="rules">Rules (JSON)</Label>
        <Textarea
          id="rules"
          name="rules"
          value={formData.rules}
          onChange={handleChange}
          className="min-h-[150px] font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Define specific parameters.
        </p>
      </div>
      {/* Actions */}
      <div className="flex justify-end space-x-2">
        {/* Link back to the activities list */}
        <Link href="/campaign/activities">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitButtonText}
        </Button>
      </div>
    </form>
  );
}

// Main Page Component
function EditActivityPage() {
  const router = useRouter();
  const params = useParams();
  // Use params.id instead of params.activityId
  const activityId = params.id as string;

  const [activity, setActivity] = React.useState<ActivityInput | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (activityId) {
      setLoading(true);
      // TODO: Replace with actual tRPC query
      const fetchedActivity = fetchActivityById(activityId);
      if (fetchedActivity) {
        setActivity(fetchedActivity);
      } else {
        console.error("Activity not found");
      }
      setLoading(false);
    }
  }, [activityId]);

  // Placeholder submit handler for updates
  const handleUpdateActivity = (data: ActivityInput) => {
    setIsSubmitting(true);
    console.log(`Updating activity ${activityId} with data:`, data);
    // TODO: Add actual API call (tRPC mutation) to update the activity
    // TODO: Add validation
    try {
      JSON.parse(data.rules);
    } catch (error) {
      console.error("Invalid JSON in rules:", error);
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      console.log("Activity update simulated.");
      setIsSubmitting(false);
      // TODO: Show success toast/message
      router.push("/activities"); // Redirect back to list after update
    }, 1500);
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
            Modify details for: {activity.name}
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Form Card */}
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Activity Details</CardTitle>
            <CardDescription>
              Update the activity configuration. Ensure rules are valid JSON.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityForm
              initialData={activity}
              onSubmit={handleUpdateActivity}
              isSubmitting={isSubmitting}
              submitButtonText="Save Changes"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EditActivityPage;
