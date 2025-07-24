'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { format } from 'date-fns'; // For date formatting

import { Button } from '~/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Badge } from '~/components/ui/badge'; // To display status nicely
import { Separator } from '~/components/ui/separator';
import { api } from '~/trpc/react';
import type { Season } from 'db/incentives';

// Helper to get Badge variant based on status
const getStatusVariant = (
  status: Season['status'],
): 'secondary' | 'default' | 'outline' => {
  switch (status) {
    case 'active':
      return 'default'; // Greenish or primary color
    case 'upcoming':
      return 'secondary'; // Greyish
    case 'completed':
      return 'outline'; // More subdued
    default:
      return 'secondary';
  }
};

function ManageSeasonsPage() {
  const router = useRouter();
  const { data: seasons } = api.season.getSeasons.useQuery();

  // Sort seasons in ascending order by name
  const sortedSeasons = React.useMemo(() => {
    if (!seasons) return [];
    return [...seasons].sort((a, b) => a.name.localeCompare(b.name));
  }, [seasons]);

  const handleRowClick = (seasonId: string) => {
    router.push(`/seasons/${seasonId}`);
  };

  return (
    <div className="container mx-auto py-6 pl-6 pr-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
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

              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSeasons && sortedSeasons.length > 0 ? (
              sortedSeasons.map((season) => (
                <TableRow
                  key={season.id}
                  onClick={() => handleRowClick(season.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{season.name}</TableCell>

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
