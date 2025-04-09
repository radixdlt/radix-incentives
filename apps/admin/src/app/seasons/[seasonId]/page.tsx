"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation"; // Import useRouter
import { ArrowLeft, Edit, PlusCircle } from "lucide-react"; // Add PlusCircle
import { format } from "date-fns";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Table, // Import Table components
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";

// Mock Season type (ensure consistency)
type Season = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "upcoming" | "completed";
  description?: string; // Optional description
};

// Update Week type
type Week = {
  id: string;
  seasonId: string;
  weekNumber: number; // Keep for potential logic, but display name
  name: string; // Add name field
  startDate: Date;
  endDate: Date;
  status: "active" | "completed" | "upcoming";
  isProcessed: boolean;
};

// Mock function to fetch season data - replace with actual API call
const fetchSeasonById = (id: string): Season | null => {
  // Simulate fetching data
  const mockSeasons: Season[] = [
    {
      id: "s0",
      name: "Season 0",
      startDate: new Date(2025, 3, 1),
      endDate: new Date(2025, 5, 30),
      status: "completed",
      description: "The very first test season.",
    },
    {
      id: "s1",
      name: "Season 1",
      startDate: new Date(2025, 6, 1),
      endDate: new Date(2025, 8, 30),
      status: "active",
      description: "Second season, currently active.",
    },
    {
      id: "s2",
      name: "Season 2",
      startDate: new Date(2025, 9, 1),
      endDate: new Date(2025, 11, 31),
      status: "upcoming",
    },
  ];
  return mockSeasons.find((s) => s.id === id) || null;
};

// Update mock weeks data with names
const mockWeeksData: Week[] = [
  {
    id: "w1",
    seasonId: "s2",
    weekNumber: 1,
    name: "Beta Week 1",
    startDate: new Date(2024, 6, 1),
    endDate: new Date(2024, 6, 7),
    status: "completed",
    isProcessed: true,
  },
  {
    id: "w2",
    seasonId: "s2",
    weekNumber: 2,
    name: "Beta Week 2",
    startDate: new Date(2024, 6, 8),
    endDate: new Date(2024, 6, 14),
    status: "active",
    isProcessed: false,
  },
  {
    id: "w3",
    seasonId: "s2",
    weekNumber: 3,
    name: "Beta Week 3",
    startDate: new Date(2024, 6, 15),
    endDate: new Date(2024, 6, 21),
    status: "upcoming",
    isProcessed: false,
  },
  {
    id: "w4",
    seasonId: "s2",
    weekNumber: 4,
    name: "Beta Week 4",
    startDate: new Date(2024, 6, 22),
    endDate: new Date(2024, 6, 28),
    status: "upcoming",
    isProcessed: false,
  },
  {
    id: "w5",
    seasonId: "s2",
    weekNumber: 5,
    name: "Beta Week 5",
    startDate: new Date(2024, 6, 29),
    endDate: new Date(2024, 7, 4),
    status: "upcoming",
    isProcessed: false,
  },
  {
    id: "w6",
    seasonId: "s2",
    weekNumber: 6,
    name: "Beta Week 6",
    startDate: new Date(2024, 7, 5),
    endDate: new Date(2024, 7, 11),
    status: "upcoming",
    isProcessed: false,
  },
  {
    id: "w7",
    seasonId: "s2",
    weekNumber: 7,
    name: "Beta Week 7",
    startDate: new Date(2024, 7, 12),
    endDate: new Date(2024, 7, 18),
    status: "upcoming",
    isProcessed: false,
  },
  {
    id: "w8",
    seasonId: "s2",
    weekNumber: 8,
    name: "Beta Week 8",
    startDate: new Date(2024, 7, 19),
    endDate: new Date(2024, 7, 25),
    status: "upcoming",
    isProcessed: false,
  },
  {
    id: "w9",
    seasonId: "s2",
    weekNumber: 9,
    name: "Beta Week 9",
    startDate: new Date(2024, 7, 26),
    endDate: new Date(2024, 8, 1),
    status: "upcoming",
    isProcessed: false,
  },
  {
    id: "w10",
    seasonId: "s2",
    weekNumber: 10,
    name: "Beta Week 10",
    startDate: new Date(2024, 8, 2),
    endDate: new Date(2024, 8, 8),
    status: "upcoming",
    isProcessed: false,
  },
  {
    id: "w11",
    seasonId: "s2",
    weekNumber: 11,
    name: "Beta Week 11",
    startDate: new Date(2024, 8, 9),
    endDate: new Date(2024, 8, 15),
    status: "upcoming",
    isProcessed: false,
  },
  {
    id: "w12",
    seasonId: "s2",
    weekNumber: 12,
    name: "Beta Week 12",
    startDate: new Date(2024, 8, 16),
    endDate: new Date(2024, 8, 22),
    status: "upcoming",
    isProcessed: false,
  },
  {
    id: "w13",
    seasonId: "s1",
    weekNumber: 1,
    name: "Alpha Week 1",
    startDate: new Date(2024, 3, 1),
    endDate: new Date(2024, 3, 7),
    status: "completed",
    isProcessed: true,
  },
];

// Add fetch weeks function
const fetchWeeksBySeasonId = (seasonId: string): Week[] => {
  console.log(`Mock fetching weeks for season: ${seasonId}`);
  return mockWeeksData.filter((w) => w.seasonId === seasonId);
};

// Helper to get Badge variant based on status
const getStatusVariant = (
  status: Season["status"]
): "secondary" | "default" | "outline" => {
  switch (status) {
    case "active":
      return "default";
    case "upcoming":
      return "secondary";
    case "completed":
      return "outline";
    default:
      return "secondary";
  }
};

// Add week status helper
const getWeekStatusVariant = (
  status: Week["status"]
): "secondary" | "default" | "outline" => {
  switch (status) {
    case "active":
      return "default";
    case "upcoming":
      return "secondary";
    case "completed":
      return "outline";
    default:
      return "secondary";
  }
};

function SeasonDetailPage() {
  const params = useParams();
  const router = useRouter(); // Use router for navigation
  const seasonId = params.seasonId as string; // Get seasonId from URL
  const [season, setSeason] = React.useState<Season | null>(null);
  const [weeks, setWeeks] = React.useState<Week[]>([]); // Add state for weeks
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (seasonId) {
      setLoading(true);
      // TODO: Replace with actual tRPC queries (fetch season AND weeks)
      const fetchedSeason = fetchSeasonById(seasonId);
      const fetchedWeeks = fetchWeeksBySeasonId(seasonId); // Fetch weeks
      setSeason(fetchedSeason);
      setWeeks(fetchedWeeks); // Set weeks state
      setLoading(false);
    }
  }, [seasonId]);

  const handleWeekRowClick = (weekId: string) => {
    // TODO: Link to actual week detail/manage page
    console.log(`Navigate to week: ${weekId} for season ${seasonId}`);
    // Uncomment and use router.push for navigation
    router.push(`/seasons/${seasonId}/weeks/${weekId}`);
  };

  if (loading) {
    // TODO: Replace with a proper loading skeleton component
    return <div className="p-6">Loading season details...</div>;
  }

  if (!season) {
    return <div className="p-6">Season not found.</div>;
  }

  return (
    <div className="container mx-auto py-6 pl-6 pr-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/seasons">
            {" "}
            {/* Link back to seasons list */}
            <Button variant="ghost" size="icon" aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Season Details
            </h1>
            <p className="text-muted-foreground">
              View details for {season.name}.
            </p>
          </div>
        </div>
        {/* Placeholder for Edit button */}
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" /> Edit Season
        </Button>
      </div>

      <Separator className="my-6" />

      {/* Season Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{season.name}</CardTitle>
          <CardDescription>
            {season.description || "No description provided."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Start Date
            </p>
            <p>{format(season.startDate, "PPP")}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              End Date
            </p>
            <p>{format(season.endDate, "PPP")}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge
              variant={getStatusVariant(season.status)}
              className="capitalize"
            >
              {season.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Weeks Section Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Weeks in this Season
        </h2>
        {/* Wrap Button in Link pointing to the new week page */}
        <Link href={`/seasons/${seasonId}/weeks/new`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Week
          </Button>
        </Link>
      </div>

      {/* Weeks Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {/* Change TableHead from Week to Name */}
                <TableHead>Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Processed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeks.length > 0 ? (
                weeks.map((week) => (
                  <TableRow
                    key={week.id}
                    onClick={() => handleWeekRowClick(week.id)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    {/* Display week.name instead of Week {week.weekNumber} */}
                    <TableCell className="font-medium">{week.name}</TableCell>
                    <TableCell>{format(week.startDate, "PPP")}</TableCell>
                    <TableCell>{format(week.endDate, "PPP")}</TableCell>
                    <TableCell>
                      {/* ... Status Badge ... */}
                      <Badge
                        variant={getWeekStatusVariant(week.status)}
                        className="capitalize"
                      >
                        {week.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {/* ... Processed Badge ... */}
                      <Badge variant={week.isProcessed ? "default" : "outline"}>
                        {week.isProcessed ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  {/* ColSpan remains 5 */}
                  <TableCell colSpan={5} className="h-24 text-center">
                    No weeks defined for this season yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default SeasonDetailPage;
