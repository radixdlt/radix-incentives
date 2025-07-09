import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';

interface ActivityFiltersProps {
  selectedCategory: 'all' | 'passive' | 'active';
  selectedType:
    | 'all'
    | 'holding'
    | 'trading'
    | 'liquidity'
    | 'lending'
    | 'network';
  onCategoryChange: (category: 'all' | 'passive' | 'active') => void;
  onTypeChange: (
    type: 'all' | 'holding' | 'trading' | 'liquidity' | 'lending' | 'network',
  ) => void;
  passiveCount: number;
  activeCount: number;
}

const categoryDescriptions = {
  all: 'View all available activities',
  passive: 'Automatic rewards from holding assets',
  active: 'Engage with protocols to earn points',
} as const;

const typeDescriptions = {
  all: 'All activity types',
  holding: 'Get a multiplier by maintaining asset balances',
  trading: 'Generate volume on DEXes and markets',
  liquidity: 'Provide liquidity to trading pools',
  lending: 'Lend assets to earn yield and points',
  network: 'General network participation activities',
} as const;

export const ActivityFilters = ({
  selectedCategory,
  selectedType,
  onCategoryChange,
  onTypeChange,
  passiveCount,
  activeCount,
}: ActivityFiltersProps) => {
  return (
    <div className="space-y-6">
      {/* Types */}
      <div className="space-y-3">
        <div>
          <h3 className=" font-medium text-foreground mb-1">Activity Types</h3>
          <p className=" text-muted-foreground">
            {typeDescriptions[selectedType]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              'all',
              'holding',
              'trading',
              'liquidity',
              'lending',
              'network',
            ] as const
          ).map((type) => (
            <div key={type} className="flex flex-col items-start">
              <Button
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTypeChange(type)}
                className="capitalize"
              >
                {type}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
