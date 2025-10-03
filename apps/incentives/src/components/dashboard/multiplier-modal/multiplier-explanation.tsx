'use client';

import { Info } from 'lucide-react';

export const MultiplierExplanation = () => {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
        <div className="text-sm">
          <p>
            At the end of each week, your earned Season Points are multiplied by
            this multiplier value, giving you bonus points for holding XRD!
          </p>
        </div>
      </div>
    </div>
  );
};
