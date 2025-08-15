'use client';

import { AlertCircle, Play, Plus, RefreshCw, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import { Skeleton } from '~/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Textarea } from '~/components/ui/textarea';
import { api } from '~/trpc/react';

type QueueCounts = {
  active: number;
  completed: number;
  delayed: number;
  failed: number;
  paused: number;
  prioritized: number;
  waiting: number;
  'waiting-children': number;
};

type QueuePagination = {
  pageCount: number;
  range: {
    start: number;
    end: number;
  };
};

type Queue = {
  name: string;
  statuses: string[];
  counts: QueueCounts;
  jobs: unknown[];
  pagination: QueuePagination;
  readOnlyMode: boolean;
  allowRetries: boolean;
  allowCompletedRetries: boolean;
  isPaused: boolean;
  type: string;
  delimiter: string;
};

type QueueApiResponse = {
  queues: Queue[];
};

const getStatusBadgeVariant = (
  count: number,
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (count === 0) return 'outline';

  switch (status) {
    case 'failed':
      return 'destructive';
    case 'active':
    case 'prioritized':
      return 'default';
    case 'completed':
      return 'secondary';
    default:
      return 'outline';
  }
};

export default function QueuesPage() {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fromTimestamp: '',
    toTimestamp: '',
    intervalInHours: 1,
    addDummyData: false,
    addresses: '',
    includeActivityIds: '',
    usdThreshold: '',
    batchSize: '',
  });

  const {
    data: apiResponse,
    isLoading,
    refetch,
    error,
  } = api.admin.queues.getQueues.useQuery();
  const { mutate: addDateRangeJob, isPending: isAddingJob } =
    api.admin.queues.addDateRangeJob.useMutation({
      onSuccess: () => {
        refetch();
        setIsModalOpen(false);
        // Reset form
        setFormData({
          fromTimestamp: '',
          toTimestamp: '',
          intervalInHours: 1,
          addDummyData: false,
          addresses: '',
          includeActivityIds: '',
          usdThreshold: '',
          batchSize: '',
        });
      },
    });

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse addresses and activity IDs from comma-separated strings
    const addresses = formData.addresses
      ? formData.addresses
          .split(',')
          .map((addr) => addr.trim())
          .filter(Boolean)
      : undefined;

    const includeActivityIds = formData.includeActivityIds
      ? formData.includeActivityIds
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      : undefined;

    // Convert datetime-local values to ISO strings (UTC)
    const fromTimestampISO = new Date(formData.fromTimestamp).toISOString();
    const toTimestampISO = new Date(formData.toTimestamp).toISOString();

    addDateRangeJob({
      fromTimestamp: fromTimestampISO,
      toTimestamp: toTimestampISO,
      intervalInHours: formData.intervalInHours,
      addDummyData: formData.addDummyData,
      ...(addresses && addresses.length > 0 && { addresses }),
      ...(includeActivityIds &&
        includeActivityIds.length > 0 && { includeActivityIds }),
      ...(formData.usdThreshold && { usdThreshold: formData.usdThreshold }),
      ...(formData.batchSize && { batchSize: Number(formData.batchSize) }),
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Set default timestamps when modal opens (using UTC)
  const handleModalOpen = () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    // Set start date to 00:00 (yesterday)
    yesterday.setUTCHours(0, 0, 0, 0);

    // Set end date to 23:59 (today)
    now.setUTCHours(23, 59, 0, 0);

    setFormData((prev) => ({
      ...prev,
      fromTimestamp: yesterday.toISOString().slice(0, 16), // Format for datetime-local input (UTC)
      toTimestamp: now.toISOString().slice(0, 16),
    }));
    setIsModalOpen(true);
  };

  // Extract queues from the nested response structure
  const queueList = (apiResponse as QueueApiResponse)?.queues || [];

  const totalJobs = queueList.reduce(
    (sum: number, queue: Queue) =>
      sum +
      queue.counts.waiting +
      queue.counts.active +
      queue.counts.completed +
      queue.counts.failed +
      queue.counts.delayed +
      queue.counts.prioritized +
      queue.counts.paused +
      queue.counts['waiting-children'],
    0,
  );

  const totalActive = queueList.reduce(
    (sum: number, queue: Queue) => sum + queue.counts.active,
    0,
  );
  const totalFailed = queueList.reduce(
    (sum: number, queue: Queue) => sum + queue.counts.failed,
    0,
  );
  const totalCompleted = queueList.reduce(
    (sum: number, queue: Queue) => sum + queue.counts.completed,
    0,
  );
  const totalWaiting = queueList.reduce(
    (sum: number, queue: Queue) => sum + queue.counts.waiting,
    0,
  );
  const totalPrioritized = queueList.reduce(
    (sum: number, queue: Queue) => sum + queue.counts.prioritized,
    0,
  );

  return (
    <div className="container mx-auto py-6 pr-6 pl-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">
              Queue Management
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage background job queues for data processing.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'animate-pulse' : ''}
          >
            {autoRefresh ? (
              <Square className="mr-2 h-4 w-4" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Manual Refresh
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleModalOpen} disabled={isAddingJob}>
                <Plus className="mr-2 h-4 w-4" />
                Add Date Range Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Snapshot Date Range Job</DialogTitle>
                <DialogDescription>
                  Configure and schedule a snapshot date range job for
                  processing account balances and activities.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromTimestamp">From Timestamp *</Label>
                    <Input
                      id="fromTimestamp"
                      name="fromTimestamp"
                      type="datetime-local"
                      value={formData.fromTimestamp}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toTimestamp">To Timestamp *</Label>
                    <Input
                      id="toTimestamp"
                      name="toTimestamp"
                      type="datetime-local"
                      value={formData.toTimestamp}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="intervalInHours">Interval (Hours)</Label>
                    <Input
                      id="intervalInHours"
                      name="intervalInHours"
                      type="number"
                      min="1"
                      value={formData.intervalInHours}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batchSize">Batch Size</Label>
                    <Input
                      id="batchSize"
                      name="batchSize"
                      type="number"
                      min="1"
                      value={formData.batchSize}
                      onChange={handleInputChange}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addresses">Addresses (comma-separated)</Label>
                  <Textarea
                    id="addresses"
                    name="addresses"
                    value={formData.addresses}
                    onChange={handleInputChange}
                    placeholder="Optional: address1, address2, address3..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="includeActivityIds">
                    Activity IDs (comma-separated)
                  </Label>
                  <Textarea
                    id="includeActivityIds"
                    name="includeActivityIds"
                    value={formData.includeActivityIds}
                    onChange={handleInputChange}
                    placeholder="Optional: activity1, activity2, activity3..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usdThreshold">USD Threshold</Label>
                  <Input
                    id="usdThreshold"
                    name="usdThreshold"
                    type="text"
                    value={formData.usdThreshold}
                    onChange={handleInputChange}
                    placeholder="Optional: minimum USD value"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="addDummyData"
                    name="addDummyData"
                    type="checkbox"
                    checked={formData.addDummyData}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300"
                    aria-label="Add dummy data for testing"
                  />
                  <Label htmlFor="addDummyData" className="text-sm">
                    Add dummy data for testing
                  </Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isAddingJob}>
                    {isAddingJob ? 'Adding...' : 'Add Job'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Queue Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Jobs</CardTitle>
            <div className="h-4 w-4 rounded bg-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {isLoading ? <Skeleton className="h-8 w-16" /> : totalJobs}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Waiting</CardTitle>
            <div className="h-2 w-2 rounded-full bg-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {isLoading ? <Skeleton className="h-8 w-16" /> : totalWaiting}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Active</CardTitle>
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {isLoading ? <Skeleton className="h-8 w-16" /> : totalActive}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Prioritized</CardTitle>
            <div className="h-2 w-2 rounded-full bg-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {isLoading ? <Skeleton className="h-8 w-16" /> : totalPrioritized}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Completed</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {isLoading ? <Skeleton className="h-8 w-16" /> : totalCompleted}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">
              {isLoading ? <Skeleton className="h-8 w-16" /> : totalFailed}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Table */}
      {error ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
              <p className="mb-2 font-medium text-destructive">
                Failed to load queue data
              </p>
              <p className="mb-4 text-muted-foreground text-sm">
                {error.message || 'Unable to connect to the worker service'}
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Queue Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waiting</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead>Delayed</TableHead>
                <TableHead>Prioritized</TableHead>
                <TableHead>Paused</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }, (_, i) => (
                <TableRow key={`skeleton-loading-row-${Date.now()}-${i}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : queueList.length > 0 ? (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Queue Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waiting</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead>Delayed</TableHead>
                <TableHead>Prioritized</TableHead>
                <TableHead>Paused</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queueList.map((queue: Queue) => (
                <TableRow key={queue.name}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{queue.name}</span>
                      {queue.isPaused && (
                        <Badge variant="secondary" className="text-xs">
                          Paused
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={queue.isPaused ? 'secondary' : 'default'}>
                      {queue.isPaused ? 'Paused' : 'Running'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(
                        queue.counts.waiting,
                        'waiting',
                      )}
                    >
                      {queue.counts.waiting}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(
                        queue.counts.active,
                        'active',
                      )}
                    >
                      {queue.counts.active}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(
                        queue.counts.completed,
                        'completed',
                      )}
                    >
                      {queue.counts.completed}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(
                        queue.counts.failed,
                        'failed',
                      )}
                    >
                      {queue.counts.failed}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(
                        queue.counts.delayed,
                        'delayed',
                      )}
                    >
                      {queue.counts.delayed}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(
                        queue.counts.prioritized,
                        'prioritized',
                      )}
                    >
                      {queue.counts.prioritized}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(
                        queue.counts.paused,
                        'paused',
                      )}
                    >
                      {queue.counts.paused}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No queues found. The worker service may not be running.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
