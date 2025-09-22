import { DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '~/components/ui/button';

type SortBy = 'earnedAP' | 'capitalAtWork';

type SortButtonsProps = {
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
  showAPSort?: boolean;
  showCapitalSort?: boolean;
};

export function SortButtons({
  sortBy,
  setSortBy,
  showAPSort = true,
  showCapitalSort = true,
}: SortButtonsProps) {
  return (
    <div className="flex flex-shrink-0 gap-1">
      {showAPSort && (
        <Button
          variant={sortBy === 'earnedAP' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('earnedAP')}
          className="!px-4 flex h-8 items-center gap-1 py-1 text-xs"
        >
          <TrendingUp className="h-3 w-3" />
          AP
        </Button>
      )}
      {showCapitalSort && (
        <Button
          variant={sortBy === 'capitalAtWork' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('capitalAtWork')}
          className="!px-4 flex h-8 items-center gap-1 py-1 text-xs"
        >
          <DollarSign className="h-3 w-3" />
          Capital
        </Button>
      )}
    </div>
  );
}

export type { SortBy };
