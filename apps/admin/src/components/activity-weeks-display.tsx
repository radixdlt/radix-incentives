'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import type { ActivityWeek } from 'db/incentives';

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
      <div className="text-sm text-muted-foreground">
        No activities assigned
      </div>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="p-0 h-auto">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
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
              className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
            >
              <div className="flex-1">
                <div className="text-sm font-medium">
                  Activity {activityWeek.activityId}
                </div>
                <div className="text-xs text-muted-foreground">
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