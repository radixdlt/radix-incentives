import { Clock, DollarSign, TrendingUp } from 'lucide-react';
import type * as React from 'react';
import {
  cn,
  formatActivityPoints,
  formatAPPerHour,
  formatCurrency,
} from '~/lib/utils';

type StatItem = {
  label: string;
  value: string | number;
  show?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: string;
};

type StatsGridProps = {
  stats: StatItem[];
  isAnonymous?: boolean;
  columns?: number;
  cardStyle?: 'default' | 'compact';
};

export function StatsGrid({
  stats,
  isAnonymous = false,
  columns = 4,
  cardStyle = 'default',
}: StatsGridProps) {
  const visibleStats = stats.filter((stat) => stat.show !== false);

  if (visibleStats.length === 0) return null;

  const getGridCols = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <div className={cn('grid gap-3', getGridCols())}>
      {visibleStats.map((stat, index) => {
        const IconComponent = stat.icon;

        return (
          <div
            key={`${stat.label}-${index}`}
            className={cn(
              'rounded-lg border border-border bg-card p-3 transition-all duration-200 hover:shadow-sm',
              cardStyle === 'compact' && 'p-2',
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {IconComponent && (
                  <IconComponent className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                )}
                <span
                  className={cn('font-medium text-muted-foreground text-xs')}
                >
                  {stat.label}
                </span>
              </div>

              <span
                className={cn(
                  'font-semibold text-foreground text-sm',
                  cardStyle === 'compact' && 'text-xs',
                )}
              >
                {isAnonymous ? '-' : stat.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Helper function to create common stats with icons and variants
export function createActivityStats(data: {
  earnedAP?: string;
  capitalAtWork?: string;
  apPerHour?: string | null;
  showEarnedAP?: boolean;
  showCapitalAtWork?: boolean;
  showAPPerHour?: boolean;
}): StatItem[] {
  return [
    {
      label: 'AP Earned',
      value: data.earnedAP ? formatActivityPoints(data.earnedAP) : '0',
      show: data.showEarnedAP !== false && !!data.earnedAP,
      icon: TrendingUp,
      variant: 'positive',
    },
    {
      label: 'Capital at Work',
      value: data.capitalAtWork ? formatCurrency(data.capitalAtWork) : '$0.00',
      show: data.showCapitalAtWork !== false && !!data.capitalAtWork,
      icon: DollarSign,
      variant: 'neutral',
    },
    {
      label: 'AP/hour',
      value: data.apPerHour ? formatAPPerHour(data.apPerHour) || '0' : '0',
      show: data.showAPPerHour !== false && data.apPerHour !== null,
      icon: Clock,
      variant: 'accent',
    },
  ];
}
