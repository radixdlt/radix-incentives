'use client';

import { CalendarIcon, PauseIcon, PlayIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useState } from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Separator } from '~/components/ui/separator';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/react';

const getStateVariant = (state: string | undefined) => {
  switch (state) {
    case 'RUNNING':
      return 'default';
    case 'PAUSED':
      return 'secondary';
    case 'STARTING':
    case 'PAUSING':
      return 'outline';
    default:
      return 'secondary';
  }
};

function DateTimePicker({
  date,
  setDate,
}: {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}) {
  const [timeInput, setTimeInput] = useState('');

  const handleDateTimeChange = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined);
      return;
    }

    const time = timeInput || '00:00';
    const [hours, minutes] = time.split(':').map(Number);

    const newDate = new Date(selectedDate);
    newDate.setUTCHours(hours || 0, minutes || 0, 0, 0);
    setDate(newDate);
  };

  const handleTimeChange = (time: string) => {
    setTimeInput(time);
    if (date && time) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setUTCHours(hours || 0, minutes || 0, 0, 0);
      setDate(newDate);
    }
  };

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              formatInTimeZone(date, 'UTC', 'PPP')
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <input
              type="date"
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
              value={date ? format(date, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const selectedDate = e.target.value
                  ? new Date(`${e.target.value}T00:00:00Z`)
                  : undefined;
                handleDateTimeChange(selectedDate);
              }}
              aria-label="Select date"
            />
          </div>
        </PopoverContent>
      </Popover>
      <div>
        <Label htmlFor="time-input" className="font-medium text-sm">
          Time (UTC)
        </Label>
        <Input
          id="time-input"
          type="time"
          value={
            timeInput ||
            (date ? formatInTimeZone(date, 'UTC', 'HH:mm') : '00:00')
          }
          onChange={(e) => handleTimeChange(e.target.value)}
          className="mt-1"
        />
      </div>
      {date && (
        <p className="text-muted-foreground text-sm">
          Selected: {formatInTimeZone(date, 'UTC', 'PPP HH:mm')} UTC
        </p>
      )}
    </div>
  );
}

export default function TransactionStreamPage() {
  const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>();

  const utils = api.useUtils();

  const { data: state, isLoading: stateLoading } =
    api.admin.transactionStream.getState.useQuery(undefined);
  const { data: stateVersion, isLoading: versionLoading } =
    api.admin.transactionStream.getStateVersion.useQuery(undefined, {
      refetchInterval: 3000, // Poll every 3 seconds
    });

  const { mutate: setState, isPending: setStatePending } =
    api.admin.transactionStream.setState.useMutation({
      onSuccess: () => {
        utils.admin.transactionStream.getState.invalidate();
      },
    });

  const { mutate: setStateVersion, isPending: setVersionPending } =
    api.admin.transactionStream.setStateVersion.useMutation({
      onSuccess: () => {
        utils.admin.transactionStream.getStateVersion.invalidate();
        setSelectedDateTime(undefined);
      },
    });

  const handleStateToggle = () => {
    if (!state) return;
    const newState = state === 'RUNNING' ? 'PAUSE' : 'START';
    setState({ state: newState });
  };

  const handleVersionUpdate = () => {
    if (!selectedDateTime) return;
    setStateVersion({ timestamp: selectedDateTime });
  };

  const isTransitioning = state === 'STARTING' || state === 'PAUSING';
  const isPaused = state === 'PAUSED';

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">
          Transaction Stream
        </h1>
        <p className="text-muted-foreground">
          Monitor and control the transaction stream processor
        </p>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current State */}
        <Card>
          <CardHeader>
            <CardTitle>Current State</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Badge variant={getStateVariant(state)} className="text-sm">
                {stateLoading ? 'Loading...' : state || 'Unknown'}
              </Badge>
            </div>

            <Button
              onClick={handleStateToggle}
              disabled={setStatePending || isTransitioning || !state}
              className="w-full"
              variant={isPaused ? 'default' : 'secondary'}
            >
              {setStatePending ? (
                'Updating...'
              ) : isPaused ? (
                <>
                  <PlayIcon className="mr-2 h-4 w-4" />
                  Resume Stream
                </>
              ) : (
                <>
                  <PauseIcon className="mr-2 h-4 w-4" />
                  Pause Stream
                </>
              )}
            </Button>

            {isTransitioning && (
              <p className="text-center text-muted-foreground text-sm">
                State change in progress...
              </p>
            )}
          </CardContent>
        </Card>

        {/* State Version */}
        <Card>
          <CardHeader>
            <CardTitle>State Version</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="font-medium text-sm">Current Version</Label>
              <p className="font-mono text-lg">
                {versionLoading
                  ? 'Loading...'
                  : stateVersion?.stateVersion?.toLocaleString() || 'N/A'}
              </p>
              {stateVersion?.timestamp && (
                <p className="text-muted-foreground text-sm">
                  {formatInTimeZone(
                    new Date(stateVersion.timestamp),
                    'UTC',
                    'PPP HH:mm',
                  )}{' '}
                  UTC
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label className="font-medium text-sm">
                Set New Version (by timestamp)
              </Label>
              <DateTimePicker
                date={selectedDateTime}
                setDate={setSelectedDateTime}
              />
              <Button
                onClick={handleVersionUpdate}
                disabled={!selectedDateTime || setVersionPending}
                className="w-full"
                variant="outline"
              >
                {setVersionPending ? 'Updating...' : 'Update Version'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-muted-foreground text-sm">
            • The transaction stream processes blockchain events from the Radix
            network
          </p>
          <p className="text-muted-foreground text-sm">
            • Pausing stops event processing temporarily
          </p>
          <p className="text-muted-foreground text-sm">
            • Setting a state version resets the stream to process from a
            specific timestamp
          </p>
          <p className="text-muted-foreground text-sm">
            • All timestamps are in UTC
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
