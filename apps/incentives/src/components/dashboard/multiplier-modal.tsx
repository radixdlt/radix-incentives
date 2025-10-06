'use client';

import { Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { calculateXrdFromMultiplier } from '~/lib/utils';
import {
  MultiplierExplanation,
  MultiplierStats,
  SCurveVisualization,
} from './multiplier-modal/index';

type MultiplierModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  multiplierValue: string;
};

export const MultiplierModal = ({
  open,
  onOpenChange,
  multiplierValue,
}: MultiplierModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const multiplier = Number(multiplierValue || 0);
  const xrdAmount = calculateXrdFromMultiplier(multiplier);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <DialogTitle>Your SP Multiplier</DialogTitle>
          </div>
          <DialogDescription>
            Your multiplier is calculated based on your average XRD holdings
            during the week
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <MultiplierStats multiplier={multiplier} xrdAmount={xrdAmount} />
          <SCurveVisualization currentMultiplier={multiplier} />
          <MultiplierExplanation />
        </div>
      </DialogContent>
    </Dialog>
  );
};
