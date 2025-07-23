'use client';

import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';

import { Button } from '~/components/ui/button';

interface SeasonHeaderProps {
  seasonName: string;
}

export const SeasonHeader: React.FC<SeasonHeaderProps> = ({ seasonName }) => {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Link href="/seasons">
          <Button variant="ghost" size="icon" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Season Details</h1>
          <p className="text-muted-foreground">View details for {seasonName}.</p>
        </div>
      </div>
      <Button variant="outline">
        <Edit className="mr-2 h-4 w-4" /> Edit Season
      </Button>
    </div>
  );
};