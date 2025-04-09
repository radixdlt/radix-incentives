"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { format } from "date-fns"; // For date formatting

import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge"; // To display status nicely
import { Separator } from "~/components/ui/separator";

// Define Season type for mock data
type Season = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "upcoming" | "completed";
};

// Mock data for the seasons table
const mockSeasons: Season[] = [
  {
    id: "s0",
    name: "Season 0",
    startDate: new Date(2025, 3, 1),
    endDate: new Date(2025, 5, 30),
    status: "completed",
  },
  {
    id: "s1",
    name: "Season 1",
    startDate: new Date(2025, 6, 1),
    endDate: new Date(2025, 8, 30),
    status: "active",
  },
  {
    id: "s2",
    name: "Season 2",
    startDate: new Date(2025, 9, 1),
    endDate: new Date(2025, 11, 31),
    status: "upcoming",
  },
  {
    id: "s3",
    name: "Season 3",
    startDate: new Date(2025, 9, 1),
    endDate: new Date(2025, 11, 31),
    status: "upcoming",
  },
  {
    id: "s4",
    name: "Season 4",
    startDate: new Date(2025, 9, 1),
    endDate: new Date(2025, 11, 31),
    status: "upcoming",
  },
];

// Helper to get Badge variant based on status
const getStatusVariant = (
  status: Season["status"]
): "secondary" | "default" | "outline" => {
  switch (status) {
    case "active":
      return "default"; // Greenish or primary color
    case "upcoming":
      return "secondary"; // Greyish
    case "completed":
      return "outline"; // More subdued
    default:
      return "secondary";
  }
};

function ManageSeasonsPage() {
  const router = useRouter();
  // TODO: Replace mockSeasons with actual data fetching (e.g., tRPC query)

  const handleRowClick = (seasonId: string) => {
    router.push(`/seasons/${seasonId}`);
  };

  return (
    <div className="container mx-auto py-6 pl-6 pr-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/campaign">
            <Button variant="ghost" size="icon" aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Manage Seasons
            </h1>
            <p className="text-muted-foreground">
              View, create, and manage campaign seasons.
            </p>
          </div>
        </div>
        <Link href="/seasons/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Season
          </Button>
        </Link>
      </div>

      <Separator className="my-6" />

      {/* Seasons Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSeasons.length > 0 ? (
              mockSeasons.map((season) => (
                <TableRow
                  key={season.id}
                  onClick={() => handleRowClick(season.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{season.name}</TableCell>
                  <TableCell>{format(season.startDate, "PPP")}</TableCell>
                  <TableCell>{format(season.endDate, "PPP")}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(season.status)}
                      className="capitalize"
                    >
                      {season.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No seasons found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default ManageSeasonsPage;
