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
import { DatePicker } from "~/components/ui/date-picker";
import { Switch } from "~/components/ui/switch"; // Assuming Switch exists
import { Separator } from "~/components/ui/separator";
import { MultiSelect } from "~/components/ui/multi-select"; // Import MultiSelect
import type { OptionType } from "~/components/ui/multi-select"; // Import OptionType as type

// --- Types ---
type Season = {
  // For fetching season name
  id: string;
  name: string;
};

type WeekInput = {
  name: string; // Renamed from weekNumber
  startDate: Date | undefined;
  endDate: Date | undefined;
  status: "active" | "completed" | "upcoming";
  isProcessed: boolean;
  activityIds: string[]; // Added activityIds
};

// Add Activity type for options
type ActivityOption = {
  id: string;
  name: string;
};

// --- Mock Fetch ---
const fetchSeasonNameById = (id: string): Season | null => {
  console.log(`Mock fetching season: ${id}`);
  const mockSeasons = [
    { id: "s1", name: "Season Alpha" },
    { id: "s2", name: "Season Beta" },
    { id: "s3", name: "Season Gamma" },
  ];
  return mockSeasons.find((s) => s.id === id) || null;
};

// Mock function to fetch available activities - replace with actual API call
const fetchActivities = (): ActivityOption[] => {
  console.log("Mock fetching activities");
  return [
    { id: "a1", name: "Holding XRD or Staking (LSUs)" },
    { id: "a2", name: "Bridging/holding stable assets (xUSDC, xUSDT)" },
    { id: "a3", name: "Trading volume in bluechip volatiles (xBTC, xETH)" },
    { id: "a4", name: "Trading volume in stables (USDC, USDT)" },
    { id: "a5", name: "Trading volume in XRD" },
    { id: "a6", name: "Liquidity in bluechip volatiles" },
    { id: "a7", name: "Liquidity in stables" },
    // Add more as needed
  ];
};

// --- Form Component ---
function CreateWeekForm({
  onSubmit,
  isSubmitting,
  activityOptions, // Pass activity options
}: {
  onSubmit: (data: WeekInput) => void;
  isSubmitting: boolean;
  activityOptions: OptionType[];
}) {
  const [formData, setFormData] = React.useState<WeekInput>({
    name: "", // Use name instead of weekNumber
    startDate: undefined,
    endDate: undefined,
    status: "upcoming",
    isProcessed: false,
    activityIds: [], // Initialize activityIds
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value as WeekInput["status"] }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isProcessed: checked }));
  };

  const handleDateChange =
    (name: "startDate" | "endDate") => (date: Date | undefined) => {
      setFormData((prev) => ({ ...prev, [name]: date }));
    };

  // Handler for MultiSelect change
  const handleActivitiesChange = (selectedIds: string[]) => {
    setFormData((prev) => ({ ...prev, activityIds: selectedIds }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weekData = { ...formData };

    if (!weekData.startDate || !weekData.endDate) {
      alert("Start Date and End Date are required.");
      return;
    }
    onSubmit(weekData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="name">Week Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g., Week 1 Launch Week"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="startDate">Start Date</Label>
          <DatePicker
            date={formData.startDate}
            setDate={handleDateChange("startDate")}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="endDate">End Date</Label>
          <DatePicker
            date={formData.endDate}
            setDate={handleDateChange("endDate")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            name="status"
            value={formData.status}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="isProcessed">Processed Status</Label>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="isProcessed"
              checked={formData.isProcessed}
              onCheckedChange={handleSwitchChange}
            />
            <span>
              {formData.isProcessed
                ? "Marked as Processed"
                : "Mark as Processed"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Indicates if weekly point calculations are complete.
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="activities">Activities for this Week</Label>
        <MultiSelect
          options={activityOptions}
          selected={formData.activityIds}
          onChange={handleActivitiesChange}
          placeholder="Select activities..."
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Choose which activities will be active during this week.
        </p>
      </div>

      <div className="flex justify-end space-x-2">
        <Link href="..">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Week"}
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

  const [seasonName, setSeasonName] = React.useState<string>("");
  const [activityOptions, setActivityOptions] = React.useState<OptionType[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [loadingPage, setLoadingPage] = React.useState(true); // Loading state for page data

  React.useEffect(() => {
    setLoadingPage(true);
    if (seasonId) {
      // Fetch season and activities data
      const fetchedSeason = fetchSeasonNameById(seasonId);
      const fetchedActivities = fetchActivities();

      setSeasonName(fetchedSeason?.name || "Unknown Season");
      // Map activities to OptionType format
      setActivityOptions(
        fetchedActivities.map((a) => ({ value: a.id, label: a.name }))
      );
    }
    setLoadingPage(false);
  }, [seasonId]);

  const handleCreateWeek = (data: WeekInput) => {
    setIsSubmitting(true);
    // Log data including selected activityIds
    console.log(`Creating week for season ${seasonId} with data:`, data);

    setTimeout(() => {
      console.log("Week creation simulated.");
      setIsSubmitting(false);
      router.push(`/seasons/${seasonId}`);
    }, 1500);
  };

  if (loadingPage) {
    return <div className="p-6">Loading page data...</div>;
  }

  return (
    <div className="container mx-auto py-6 pl-6 pr-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/seasons/${seasonId}`}>
          <Button variant="ghost" size="icon" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Week</h1>
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
              isSubmitting={isSubmitting}
              activityOptions={activityOptions}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreateWeekPage;
