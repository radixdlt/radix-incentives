'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {
  Trophy,
  Star,
  Target,
  Activity as ActivityIcon,
  Zap,
} from 'lucide-react';

import { api } from '~/trpc/react';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'passive':
      return <Target className="h-4 w-4" />;
    case 'active':
      return <ActivityIcon className="h-4 w-4" />;
    default:
      return <Target className="h-4 w-4" />;
  }
};

const getRewardIcon = (rewardType: string) => {
  switch (rewardType) {
    case 'points':
      return <Star className="h-4 w-4" />;
    case 'multiplier':
      return <Zap className="h-4 w-4" />;
    default:
      return <Star className="h-4 w-4" />;
  }
};

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'inactive':
      return 'secondary';
    default:
      return 'outline';
  }
};

export default function ActivitySettingsPage() {
  const { id: activityId } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading } = api.activity.getActivityById.useQuery({
    id: activityId,
  });

  const activity = data?.activity;
  const activityWeeks = data?.activityWeeks;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link href="/activities" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Loading Activity...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link href="/activities" className="mr-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Activity Not Found
            </h1>
            <p className="text-muted-foreground mt-1">
              The requested activity could not be found
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/activities">Back to Activities</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center mb-6">
        <Link href="/activities" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Activity Details
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage activity configuration
          </p>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1 min-w-0">
              <CardTitle className="text-2xl font-semibold leading-tight">
                {activity.name}
              </CardTitle>
              <CardDescription className="text-base">
                {activity.description}
              </CardDescription>
            </div>
            <Button size="sm" variant="outline">
              Edit Activity
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              {getTypeIcon(activity.type)}
              {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {getRewardIcon(activity.rewardType)}
              {activity.rewardType.charAt(0).toUpperCase() +
                activity.rewardType.slice(1)}
            </Badge>
            <Badge variant="outline">{activity.category}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Activity Type
                </p>
                <p className="text-sm font-medium">{activity.type}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Star className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Reward Type
                </p>
                <p className="text-sm font-medium">{activity.rewardType}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Category
                </p>
                <p className="text-sm font-medium">{activity.category}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Weeks Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Activity Weeks</CardTitle>
          <CardDescription>
            Weekly point allocations and status for this activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activityWeeks && activityWeeks.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week ID</TableHead>
                    <TableHead>Season ID</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Points Pool</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityWeeks.map((activityWeek, index) => (
                    <TableRow
                      key={`${activityWeek.activityId}-${activityWeek.weekId}`}
                    >
                      <TableCell className="font-mono text-sm">
                        {activityWeek.weekId.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {activityWeek.week.seasonId.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {new Date(
                              activityWeek.week.startDate,
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            to{' '}
                            {new Date(
                              activityWeek.week.endDate,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {activityWeek.pointsPool !== null ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">
                              {activityWeek.pointsPool.toLocaleString()}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              pts
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">
                            No allocation
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(activityWeek.status)}>
                          {activityWeek.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              router.push(
                                `/seasons/${activityWeek.week.seasonId}/weeks/${activityWeek.weekId}`,
                              );
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <p className="text-lg font-medium">No activity weeks found</p>
                <p className="text-sm">
                  This activity has not been assigned to any weeks yet.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
