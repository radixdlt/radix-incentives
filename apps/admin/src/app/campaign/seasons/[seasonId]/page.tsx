"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation"; // To get seasonId from URL
import { ArrowLeft, Edit } from "lucide-react";
import { format } from "date-fns";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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

// Mock function to fetch season data - replace with actual API call
const fetchSeasonById = (id: string): Season | null => {
  // Simulate fetching data
  const mockSeasons: Season[] = [
    {
      id: "s1",
      name: "Season Alpha",
      startDate: new Date(2024, 3, 1),
      endDate: new Date(2024, 5, 30),
      status: "completed",
      description: "The very first test season.",
    },
    {
      id: "s2",
      name: "Season Beta",
      startDate: new Date(2024, 6, 1),
      endDate: new Date(2024, 8, 30),
      status: "active",
      description: "Second season, currently active.",
    },
    {
      id: "s3",
      name: "Season Gamma",
      startDate: new Date(2024, 9, 1),
      endDate: new Date(2024, 11, 31),
      status: "upcoming",
    },
  ];
  return mockSeasons.find((s) => s.id === id) || null;
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

function SeasonDetailPage() {
  const params = useParams();
  const seasonId = params.seasonId as string; // Get seasonId from URL
  const [season, setSeason] = React.useState<Season | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (seasonId) {
      setLoading(true);
      // TODO: Replace mock fetch with actual tRPC query
      const fetchedSeason = fetchSeasonById(seasonId);
      setSeason(fetchedSeason);
      setLoading(false);
    }
  }, [seasonId]);

  if (loading) {
    // TODO: Replace with a proper loading skeleton component
    return <div className="p-6">Loading season details...</div>;
  }

  if (!season) {
    return <div className="p-6">Season not found.</div>;
  }

  return (
    <div className="container mx-auto py-6 pl-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/campaign/seasons">
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

      {/* Placeholder for related data (e.g., Weeks, Activities) */}
      <h2 className="mb-4 text-2xl font-semibold tracking-tight">
        Related Information
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Weeks & Activities</CardTitle>
          <CardDescription>
            Weeks and activities associated with this season will be displayed
            here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Add tables or lists for weeks and activities */}
          <p className="text-center text-muted-foreground">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default SeasonDetailPage;
