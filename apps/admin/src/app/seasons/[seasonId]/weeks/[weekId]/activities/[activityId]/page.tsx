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

export default function ActivityPage() {
  const { activityId, weekId, seasonId } = useParams<{
    activityId: string;
    weekId: string;
    seasonId: string;
  }>();

  const {
    data: users,
    isLoading,
    error,
  } = api.admin.activity.getUsers.useQuery({
    activityId,
    weekId,
  });

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <h2 className="mb-2 font-semibold text-destructive">
            Error loading activity users
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
            <span>Loading activity users...</span>
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
            href={`/seasons/${seasonId}/weeks/${weekId}`}
            aria-label="Back to week"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Activity Users</h1>
          <p className="text-muted-foreground">
            Users and points for activity: {activityId}
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Activity Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Points by User</CardTitle>
          <CardDescription>
            {users?.length || 0} user{users?.length !== 1 ? 's' : ''} earned
            points for this activity
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Address</TableHead>

                  <TableHead className="text-right">Activity Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users
                    .sort(
                      (a, b) =>
                        Number(b.activityPoints) - Number(a.activityPoints),
                    )
                    .map((userPoint) => (
                      <TableRow key={userPoint.accountAddress}>
                        <TableCell className="font-mono text-sm">
                          <Button
                            variant="link"
                            className="h-auto p-0 font-mono text-sm"
                            asChild
                          >
                            <Link
                              href={`/users/${userPoint.account?.userId}/account/${userPoint.accountAddress}`}
                            >
                              {userPoint.accountAddress}
                            </Link>
                          </Button>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {Number(userPoint.activityPoints).toLocaleString(
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
                      No users found for this activity.
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
