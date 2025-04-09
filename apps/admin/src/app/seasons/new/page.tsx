"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "~/lib/utils";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { Separator } from "~/components/ui/separator";
import { DatePicker } from "~/components/ui/date-picker"; // Assuming DatePicker exists

// Define Season type based on expected data
type Season = {
  name: string;
  startDate: Date;
  endDate: Date;
  description: string;
  status: "active" | "upcoming" | "completed";
};

interface CreateSeasonFormProps {
  onSubmit: (data: Season) => void;
  isSubmitting?: boolean;
}

function CreateSeasonForm({
  onSubmit,
  isSubmitting = false,
}: CreateSeasonFormProps) {
  const [name, setName] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<
    "active" | "upcoming" | "completed"
  >("upcoming");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && startDate && endDate) {
      onSubmit({
        name,
        startDate,
        endDate,
        description,
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="startDate">Start Date</Label>
            {/* Assuming DatePicker component exists and accepts these props */}
            <DatePicker date={startDate} setDate={setStartDate} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endDate">End Date</Label>
            {/* Assuming DatePicker component exists and accepts these props */}
            <DatePicker date={endDate} setDate={setEndDate} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value: "active" | "upcoming" | "completed") =>
              setStatus(value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter season description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Season"}
        </Button>
      </div>
    </form>
  );
}

function CreateSeasonPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Placeholder function for handling form submission
  // TODO: Replace with actual API call (e.g., tRPC mutation)
  const handleCreateSeason = (data: Season) => {
    setIsSubmitting(true);
    console.log("Creating season:", data); // Log data for now
    // Simulate API call latency
    setTimeout(() => {
      setIsSubmitting(false);
      console.log("Season creation simulated.");
      // TODO: Add success message/toast notification
      // TODO: Potentially redirect user after successful creation
    }, 1500);
  };

  return (
    <div className="container mx-auto py-6 pl-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/campaign">
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
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreateSeasonPage;
