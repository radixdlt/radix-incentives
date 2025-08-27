import { ActivityFilters } from './ActivityFilters';

interface EarnPageHeaderProps {
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

export const EarnPageHeader = ({
  selectedCategory,
  selectedType,
  onCategoryChange,
  onTypeChange,
  passiveCount,
  activeCount,
  typeCounts,
}: EarnPageHeaderProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-bold text-4xl text-foreground">Earn Points</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Complete activities to earn season points and unlock rewards in the
          Radix Incentives Campaign
        </p>
      </div>

      <ActivityFilters
        selectedCategory={selectedCategory}
        selectedType={selectedType}
        onCategoryChange={onCategoryChange}
        onTypeChange={onTypeChange}
        passiveCount={passiveCount}
        activeCount={activeCount}
        typeCounts={typeCounts}
      />
    </div>
  );
};
