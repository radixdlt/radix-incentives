'use client';

import type { ActivityWeek } from 'db/incentives';
import { ChevronDown, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { Button } from '~/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';

interface ActivityWeeksDisplayProps {
  weekId: string;
  activityWeeks: ActivityWeek[];
}

export const ActivityWeeksDisplay: React.FC<ActivityWeeksDisplayProps> = ({
  weekId,
  activityWeeks,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const weekActivityWeeks = activityWeeks.filter((aw) => aw.weekId === weekId);

  if (weekActivityWeeks.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        No activities assigned
      </div>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-0">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="font-medium text-sm">
              {weekActivityWeeks.length}{' '}
              {weekActivityWeeks.length === 1 ? 'activity' : 'activities'}
            </span>
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2">
        <div className="space-y-2">
          {weekActivityWeeks.map((activityWeek) => (
            <div
              key={`${activityWeek.activityId}-${activityWeek.weekId}`}
              className="flex items-center justify-between rounded-md bg-muted/50 p-2"
            >
              <div className="flex-1">
                <div className="font-medium text-sm">
                  Activity {activityWeek.activityId}
                </div>
                <div className="text-muted-foreground text-xs">
                  ID: {activityWeek.activityId}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
