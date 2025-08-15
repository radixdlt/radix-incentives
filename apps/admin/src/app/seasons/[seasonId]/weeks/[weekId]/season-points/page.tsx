'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { api } from '~/trpc/react';

export default function SeasonPointsPage() {
  const params = useParams<{ seasonId: string; weekId: string }>();
  const {
    data: seasonPoints,
    isLoading,
    error,
  } = api.admin.user.getSeasonPoints.useQuery({
    weekId: params.weekId,
  });

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <h2 className="mb-2 font-semibold text-destructive">
            Error loading season points
          </h2>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading season points...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 pr-6 pl-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link
            href={`/seasons/${params.seasonId}/weeks/${params.weekId}`}
            aria-label="Back to week"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Season Points</h1>
          <p className="text-muted-foreground">
            Season points for week {params.weekId}
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Season Points Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Season Points</CardTitle>
          <CardDescription>
            {seasonPoints?.length || 0} user
            {seasonPoints?.length !== 1 ? 's' : ''} with season points for this
            week
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead className="text-right">Season Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seasonPoints && seasonPoints.length > 0 ? (
                  seasonPoints.map((point) => (
                    <TableRow key={point.userId}>
                      <TableCell className="font-mono text-sm">
                        {point.userId}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {Number(point.points).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      No season points found for this week.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
