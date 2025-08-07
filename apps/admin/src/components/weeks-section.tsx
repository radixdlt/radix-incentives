'use client';

import type { Week } from 'db/incentives';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { WeeksTable } from '~/components/weeks-table';

interface WeeksSectionProps {
  seasonId: string;
  weeks: Week[] | undefined;
  onWeekRowClick: (weekId: string) => void;
}

export const WeeksSection: React.FC<WeeksSectionProps> = ({
  seasonId,
  weeks,
  onWeekRowClick,
}) => {
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-semibold text-2xl tracking-tight">
          Weeks in this Season
        </h2>
        <Link href={`/seasons/${seasonId}/weeks/new`}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New Week
          </Button>
        </Link>
      </div>

      <WeeksTable weeks={weeks} onWeekRowClick={onWeekRowClick} />
    </>
  );
};
