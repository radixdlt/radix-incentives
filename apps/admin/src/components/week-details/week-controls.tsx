'use client';

import { CheckCircle } from 'lucide-react';

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
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { ButtonGroup } from './button-group';
import type { WeekDetailsData } from './types';

interface WeekControlsProps {
  weekData: WeekDetailsData;
  onProcessWeek: () => void;
}

export const WeekControls: React.FC<WeekControlsProps> = ({
  weekData,
  onProcessWeek,
}) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-lg">Week Management</h3>
          <p className="text-muted-foreground text-sm">
            Control the week status and process end-of-week calculations
          </p>
        </div>
        <ButtonGroup>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="default">
                <CheckCircle className="mr-2 h-4 w-4" />
                {weekData.processed ? 'Recalculate Points' : 'Close Week'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Close Week</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will trigger a flow to finalize the week and mark
                  the week as processed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onProcessWeek}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </ButtonGroup>
      </div>
    </Card>
  );
};
