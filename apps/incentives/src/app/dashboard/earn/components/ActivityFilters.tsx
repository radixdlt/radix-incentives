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
  typeCounts: {
    all: number;
    holding: number;
    trading: number;
    liquidity: number;
    lending: number;
    network: number;
  };
}

const _categoryDescriptions = {
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
  selectedType,
  onTypeChange,
  typeCounts,
}: ActivityFiltersProps) => {
  // Filter out types with no activities (except 'all')
  const availableTypes = (
    ['all', 'holding', 'trading', 'liquidity', 'lending', 'network'] as const
  ).filter((type) => type === 'all' || typeCounts[type] > 0);

  return (
    <div className="space-y-6">
      {/* Types */}
      <div className="space-y-3">
        <div>
          <h3 className="mb-1 font-medium text-foreground">Activity Types</h3>
          <p className="text-muted-foreground">
            {typeDescriptions[selectedType]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {availableTypes.map((type) => (
            <div key={type} className="flex flex-col items-start">
              <Button
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTypeChange(type)}
                className="capitalize"
              >
                {type}
                {type !== 'all' && ` (${typeCounts[type]})`}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
