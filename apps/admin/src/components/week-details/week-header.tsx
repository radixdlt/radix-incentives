'use client';

import Link from 'next/link';
import { Calendar, ArrowLeft } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import type { WeekDetailsData } from './types';

interface WeekHeaderProps {
  weekData: WeekDetailsData;
  seasonId?: string;
}

export const WeekHeader: React.FC<WeekHeaderProps> = ({
  weekData,
  seasonId,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div className="flex items-center gap-4">
        {seasonId && (
          <Link href={`/seasons/${seasonId}`}>
            <Button variant="ghost" size="icon" aria-label="Back to season">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        )}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4" />
            {weekData.startDate.toLocaleDateString()} - {weekData.endDate.toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {weekData.processed && (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-200"
          >
            Processed
          </Badge>
        )}
      </div>
    </div>
  );
};