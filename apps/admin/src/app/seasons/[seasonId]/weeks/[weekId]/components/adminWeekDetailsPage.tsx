'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Trophy,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Search,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Input } from '~/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import type { Week } from 'db/incentives';

// Button Group Component
const buttonGroupVariants =
  'flex sm:items-center max-sm:gap-1 max-sm:flex-col [&>*:focus-within]:ring-1 [&>*:focus-within]:z-10 [&>*]:ring-offset-0 sm:[&>*:not(:first-child)]:rounded-l-none sm:[&>*:not(:last-child)]:rounded-r-none [&>*]:h-10 [&>*]:px-4 [&>*]:py-2';

const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div className={cn(buttonGroupVariants, className)} ref={ref} {...props}>
      {children}
    </div>
  );
});
ButtonGroup.displayName = 'ButtonGroup';

// Types
interface WeekActivity {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'active';
  rewardType: 'points' | 'multiplier';
  status: 'active' | 'inactive';
  pointsPool: number;
  participants: number;
  startDate: string;
  endDate: string;
  category: string;
}

interface WeekData {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  isProcessed: boolean;
  totalActivities: number;
  totalParticipants: number;
  totalPointsPool: number;
}

interface AdminWeekDetailsProps {
  weekData: WeekData;
  activities: WeekActivity[];
  onWeekAction?: (action: Week['status']) => void;
  onActivityAction?: (activityId: string, action: 'edit' | 'delete') => void;
  onRecalculatePoints?: () => void;
}

const AdminWeekDetails: React.FC<AdminWeekDetailsProps> = ({
  weekData,
  activities,
  onWeekAction = (action) => console.log(`Week ${action} action triggered`),
  onActivityAction = (activityId, action) =>
    console.log(`Activity ${activityId} ${action} action triggered`),
  onRecalculatePoints = () =>
    console.log('Recalculate points action triggered'),
}) => {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof WeekActivity | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    const filtered = activities.filter(
      (activity) =>
        activity.name.toLowerCase().includes(search.toLowerCase()) ||
        activity.description.toLowerCase().includes(search.toLowerCase()) ||
        activity.type.toLowerCase().includes(search.toLowerCase()) ||
        activity.category.toLowerCase().includes(search.toLowerCase()),
    );

    if (sortConfig.key) {
      const sortKey = sortConfig.key;
      filtered.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [activities, search, sortConfig]);

  const handleSort = (key: keyof WeekActivity) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-purple-100 text-purple-800 border-purple-200',
    };

    return (
      <Badge
        variant="outline"
        className={variants[status as keyof typeof variants]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: string, rewardType: string) => {
    if (type === 'passive') {
      return <Clock className="h-4 w-4" />;
    }
    if (rewardType === 'multiplier') {
      return <Trophy className="h-4 w-4" />;
    }
    return <CheckCircle className="h-4 w-4" />;
  };

  const formatRewardDisplay = (activity: WeekActivity) => {
    if (activity.rewardType === 'multiplier') {
      return 'Multiplier';
    }
    return activity.pointsPool.toLocaleString();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Week Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            Week {weekData.weekNumber} • {weekData.startDate} -{' '}
            {weekData.endDate}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(weekData.status)}
          {weekData.isProcessed && (
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-800 border-blue-200"
            >
              Processed
            </Badge>
          )}
        </div>
      </div>

      {/* Week Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Trophy className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Activities</p>
              <p className="text-2xl font-bold">{weekData.totalActivities}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Participants</p>
              <p className="text-2xl font-bold">
                {weekData.totalParticipants.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Trophy className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Points Pool</p>
              <p className="text-2xl font-bold">
                {weekData.totalPointsPool.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Week Controls */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Week Management</h3>
            <p className="text-sm text-muted-foreground">
              Control the week status and process end-of-week calculations
            </p>
          </div>
          <ButtonGroup>
            {weekData.status === 'upcoming' && (
              <Button variant="default" onClick={() => onWeekAction('active')}>
                <Play className="h-4 w-4 mr-2" />
                Start Week
              </Button>
            )}
            {weekData.status === 'active' && !weekData.isProcessed && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    End Week & Calculate Points
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      End Week & Calculate Points
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will finalize the week, calculate all user points,
                      apply multipliers, and convert weekly points to season
                      points. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onRecalculatePoints()}>
                      End Week & Calculate
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {weekData.status === 'completed' && !weekData.isProcessed && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Recalculate Points
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Recalculate Points</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will recalculate the points for all users in this
                      week. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onRecalculatePoints()}>
                      Recalculate Points
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </ButtonGroup>
        </div>
      </Card>

      {/* Activities Table */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold">Week Activities</h3>
            <p className="text-sm text-muted-foreground">
              Manage activities for this week
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Button variant="default">Add Activity</Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Activity
                    <div className="flex flex-col">
                      <ChevronUp
                        className={cn(
                          'h-3 w-3',
                          sortConfig.key === 'name' &&
                            sortConfig.direction === 'asc'
                            ? 'text-primary'
                            : 'text-muted-foreground/40',
                        )}
                      />
                      <ChevronDown
                        className={cn(
                          'h-3 w-3 -mt-1',
                          sortConfig.key === 'name' &&
                            sortConfig.direction === 'desc'
                            ? 'text-primary'
                            : 'text-muted-foreground/40',
                        )}
                      />
                    </div>
                  </div>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reward Type</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    <div className="flex flex-col">
                      <ChevronUp
                        className={cn(
                          'h-3 w-3',
                          sortConfig.key === 'status' &&
                            sortConfig.direction === 'asc'
                            ? 'text-primary'
                            : 'text-muted-foreground/40',
                        )}
                      />
                      <ChevronDown
                        className={cn(
                          'h-3 w-3 -mt-1',
                          sortConfig.key === 'status' &&
                            sortConfig.direction === 'desc'
                            ? 'text-primary'
                            : 'text-muted-foreground/40',
                        )}
                      />
                    </div>
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('participants')}
                >
                  <div className="flex items-center gap-2">
                    Participants
                    <div className="flex flex-col">
                      <ChevronUp
                        className={cn(
                          'h-3 w-3',
                          sortConfig.key === 'participants' &&
                            sortConfig.direction === 'asc'
                            ? 'text-primary'
                            : 'text-muted-foreground/40',
                        )}
                      />
                      <ChevronDown
                        className={cn(
                          'h-3 w-3 -mt-1',
                          sortConfig.key === 'participants' &&
                            sortConfig.direction === 'desc'
                            ? 'text-primary'
                            : 'text-muted-foreground/40',
                        )}
                      />
                    </div>
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('pointsPool')}
                >
                  <div className="flex items-center gap-2">
                    Points Pool
                    <div className="flex flex-col">
                      <ChevronUp
                        className={cn(
                          'h-3 w-3',
                          sortConfig.key === 'pointsPool' &&
                            sortConfig.direction === 'asc'
                            ? 'text-primary'
                            : 'text-muted-foreground/40',
                        )}
                      />
                      <ChevronDown
                        className={cn(
                          'h-3 w-3 -mt-1',
                          sortConfig.key === 'pointsPool' &&
                            sortConfig.direction === 'desc'
                            ? 'text-primary'
                            : 'text-muted-foreground/40',
                        )}
                      />
                    </div>
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{activity.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {activity.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Category: {activity.category}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(activity.type, activity.rewardType)}
                      <span className="capitalize">{activity.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        activity.rewardType === 'multiplier'
                          ? 'bg-orange-100 text-orange-800 border-orange-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }
                    >
                      {activity.rewardType}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(activity.status)}</TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {activity.participants.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatRewardDisplay(activity)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onActivityAction(activity.id, 'edit')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{activity.name}"?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                onActivityAction(activity.id, 'delete')
                              }
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default AdminWeekDetails;
