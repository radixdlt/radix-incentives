'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PlusCircle } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Separator } from '~/components/ui/separator';
import { api } from '~/trpc/react';

function ManageActivitiesPage() {
  const router = useRouter();
  const { data: activities } = api.activity.getActivities.useQuery();

  const handleRowClick = (activityId: string) => {
    router.push(`/activities/${activityId}`);
  };

  return (
    <div className="container mx-auto py-6 pl-6 pr-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Manage Activities
            </h1>
            <p className="text-muted-foreground">
              Configure activities that participants can earn points or
              multipliers for.
            </p>
          </div>
        </div>
        {/* Wrap Button in Link and remove disabled attribute */}
        <Link href="/activities/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Activity
          </Button>
        </Link>
      </div>

      <Separator className="my-6" />

      {/* Activities Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reward Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities && activities.length > 0 ? (
              activities.map((activity) => (
                <TableRow
                  key={activity.id}
                  onClick={() => handleRowClick(activity.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{activity.name}</TableCell>
                  <TableCell>{activity.type}</TableCell>
                  <TableCell>{activity.rewardType}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No activities defined yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default ManageActivitiesPage;
