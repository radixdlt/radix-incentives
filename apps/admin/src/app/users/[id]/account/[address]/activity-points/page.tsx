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

export default function AccountPage() {
  const { id: userId, address } = useParams<{ id: string; address: string }>();

  const {
    data: activityPoints,
    isLoading,
    error,
  } = api.admin.user.getActivityPoints.useQuery({
    address,
  });

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <h2 className="mb-2 font-semibold text-destructive">
            Error loading activity points
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
            <span>Loading activity points...</span>
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
          <Link href={`/users/${userId}`} aria-label="Back to user">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Account Activity Points
          </h1>
          <p className="text-muted-foreground">
            Activity points breakdown for account {address}
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Activity Points Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Points</CardTitle>
          <CardDescription>
            {activityPoints?.length || 0} activity point record
            {activityPoints?.length !== 1 ? 's' : ''} for this account
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week ID</TableHead>
                  <TableHead>Activity ID</TableHead>
                  <TableHead className="text-right">Activity Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityPoints && activityPoints.length > 0 ? (
                  activityPoints.map((point) => (
                    <TableRow key={`${point.weekId}-${point.activityId}`}>
                      <TableCell className="font-mono text-sm">
                        {point.weekId}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {point.activityId}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {Number(point.activityPoints).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6,
                          },
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No activity points found for this account.
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
