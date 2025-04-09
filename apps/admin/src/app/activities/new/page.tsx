"use client";

import * as React from "react";
import Link from "next/link";
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

// Define Activity type based on previous definitions
type ActivityInput = {
  name: string;
  description: string;
  type: "Passive" | "Active";
  rewardType: "Points" | "Multiplier";
  priority: "High" | "Moderate" | "Low";
  category: string;
  rules: string; // Store rules as JSON string for now
};

function CreateActivityForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: ActivityInput) => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = React.useState<ActivityInput>({
    name: "",
    description: "",
    type: "Active",
    rewardType: "Points",
    priority: "Moderate",
    category: "",
    rules: "{}", // Default to empty JSON object
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Select component changes
  const handleSelectChange = (name: keyof ActivityInput) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add form validation (e.g., using zod)
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="grid gap-2">
        <Label htmlFor="name">Activity Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g., Hold XRD or Staking (LSUs)"
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
          placeholder="Describe the activity and its purpose."
          value={formData.description}
          onChange={handleChange}
          className="min-h-[100px]"
        />
      </div>

      {/* Type, Reward Type, Priority in a row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Type */}
        <div className="grid gap-2">
          <Label htmlFor="type">Type</Label>
          <Select
            name="type"
            value={formData.type}
            onValueChange={handleSelectChange("type")}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Passive">Passive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reward Type */}
        <div className="grid gap-2">
          <Label htmlFor="rewardType">Reward Type</Label>
          <Select
            name="rewardType"
            value={formData.rewardType}
            onValueChange={handleSelectChange("rewardType")}
            // Consider disabling if type is Active and reward can only be Points
          >
            <SelectTrigger id="rewardType">
              <SelectValue placeholder="Select reward type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Points">Points</SelectItem>
              <SelectItem value="Multiplier">Multiplier</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="grid gap-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            name="priority"
            value={formData.priority}
            onValueChange={handleSelectChange("priority")}
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
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
          placeholder="e.g., Holdings, Trading, Lending"
          value={formData.category}
          onChange={handleChange}
        />
        <p className="text-xs text-muted-foreground">
          Helps group activities (optional).
        </p>
      </div>

      {/* Rules (JSON) */}
      <div className="grid gap-2">
        <Label htmlFor="rules">Rules (JSON)</Label>
        <Textarea
          id="rules"
          name="rules"
          placeholder='Enter activity rules as JSON, e.g., { "minHoldingUSD": 50 }'
          value={formData.rules}
          onChange={handleChange}
          className="min-h-[150px] font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Define specific parameters like minimum values, token lists, etc.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Link href="/activities">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Activity"}
        </Button>
      </div>
    </form>
  );
}

function CreateActivityPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Placeholder submit handler
  const handleCreateActivity = (data: ActivityInput) => {
    setIsSubmitting(true);
    console.log("Creating activity with data:", data);
    // TODO: Add actual API call (tRPC mutation) to save the activity
    // TODO: Add validation for JSON rules before submitting
    try {
      const parsedRules = JSON.parse(data.rules);
      console.log("Parsed rules:", parsedRules);
      // Proceed with API call...
    } catch (error) {
      console.error("Invalid JSON in rules:", error);
      // TODO: Show validation error to the user
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      console.log("Activity creation simulated.");
      setIsSubmitting(false);
      // TODO: Show success toast/message
      // TODO: Redirect to activities list or activity detail page
      // router.push('/campaign/activities');
    }, 1500);
  };

  return (
    <div className="container mx-auto py-6 pl-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link href="/activities">
          <Button variant="ghost" size="icon" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Activity
          </h1>
          <p className="text-muted-foreground">
            Define a new activity for the incentive campaign.
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
              Fill in the details for the new activity. Rules should be valid
              JSON.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateActivityForm
              onSubmit={handleCreateActivity}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreateActivityPage;
