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
}

export const EarnPageHeader = ({
  selectedCategory,
  selectedType,
  onCategoryChange,
  onTypeChange,
  passiveCount,
  activeCount,
}: EarnPageHeaderProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-4xl font-bold text-foreground">Earn Points</h1>
        <p className="text-muted-foreground text-lg mt-2">
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
      />
    </div>
  );
};
