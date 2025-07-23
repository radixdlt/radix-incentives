'use client';

import { CheckCircle } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
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
import { ButtonGroup } from './button-group';
import type { WeekDetailsData } from './types';

interface WeekControlsProps {
  weekData: WeekDetailsData;
  onRecalculatePoints: () => void;
}

export const WeekControls: React.FC<WeekControlsProps> = ({
  weekData,
  onRecalculatePoints,
}) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Week Management</h3>
          <p className="text-sm text-muted-foreground">
            Control the week status and process end-of-week calculations
          </p>
        </div>
        <ButtonGroup>
          {!weekData.processed && (
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
                  <AlertDialogAction onClick={onRecalculatePoints}>
                    End Week & Calculate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {!weekData.processed && (
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
                  <AlertDialogAction onClick={onRecalculatePoints}>
                    Recalculate Points
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </ButtonGroup>
      </div>
    </Card>
  );
};