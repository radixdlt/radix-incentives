'use client';

import { ChevronRight, Trophy } from 'lucide-react';
import type { ReactNode } from 'react';

export interface StackedProgressBarItem {
  id: string;
  name: string;
  value: number;
  color?: string;
}

interface StackedProgressBarProps {
  items: StackedProgressBarItem[];
  title: string;
  total?: number;
  onItemClick?: (item: StackedProgressBarItem) => void;
  renderTooltip?: (
    item: StackedProgressBarItem,
    percentage: number,
    formattedValue: string,
  ) => ReactNode;
  colors?: string[];
  showLegend?: boolean;
  showNavigationIndicators?: boolean;
  formatValue?: (value: number) => string;
  valueSuffix?: string;
  className?: string;
}

const defaultColors = [
  'bg-gradient-to-r from-pink-500 to-pink-400',
  'bg-gradient-to-r from-cyan-500 to-cyan-400',
  'bg-gradient-to-r from-blue-500 to-blue-400',
  'bg-gradient-to-r from-purple-500 to-purple-400',
  'bg-gradient-to-r from-emerald-500 to-emerald-400',
  'bg-gradient-to-r from-orange-500 to-orange-400',
  'bg-gradient-to-r from-rose-500 to-rose-400',
  'bg-gradient-to-r from-violet-500 to-violet-400',
  'bg-gradient-to-r from-teal-500 to-teal-400',
  'bg-gradient-to-r from-amber-500 to-amber-400',
];

export function StackedProgressBar({
  items,
  title,
  total: providedTotal,
  onItemClick,
  renderTooltip,
  colors = defaultColors,
  showLegend = true,
  showNavigationIndicators = false,
  formatValue = (value) =>
    value.toLocaleString(undefined, { maximumFractionDigits: 2 }),
  valueSuffix = '',
  className = '',
}: StackedProgressBarProps) {
  // Filter out zero values and sort by value descending
  const filteredItems = items
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const total =
    providedTotal ?? filteredItems.reduce((sum, item) => sum + item.value, 0);

  if (filteredItems.length === 0 || total === 0) {
    return null;
  }

  const renderDefaultTooltip = (
    item: StackedProgressBarItem,
    percentage: number,
    formattedValue: string,
  ) => (
    <>
      <div className="font-semibold text-white">{item.name}</div>
      <div className="text-white/80 text-xs">
        {formattedValue}
        {valueSuffix} • {percentage.toFixed(1)}%
      </div>
      {onItemClick && (
        <div className="text-white/60 text-xs">Click to view leaderboard</div>
      )}
    </>
  );

  return (
    <div className={`glass-card rounded-lg p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-white">{title}</h3>
          <h3 className="font-semibold text-lg text-white">
            Total: {formatValue(total)}
            {valueSuffix}
          </h3>
        </div>

        {onItemClick && (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Trophy className="h-4 w-4 text-cyan-400" />
            Click any {title.toLowerCase().replace(' categories', ' category')}{' '}
            to view its leaderboard
            {title.includes('Categories') ? ' and sub-activities' : ''}
          </div>
        )}

        <div className="space-y-1">
          {/* Stacked Bar */}
          <div className="pt-1">
            <div
              className={`relative h-8 w-full rounded-lg bg-white/10 ${onItemClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow duration-200`}
            >
              {(() => {
                let cumulativeValue = 0;
                return filteredItems.map((item, index) => {
                  const widthPercentage =
                    total > 0 ? (item.value / total) * 100 : 0;
                  const leftPercentage =
                    total > 0 ? (cumulativeValue / total) * 100 : 0;

                  const isFirst = index === 0;
                  const isLast = index === filteredItems.length - 1;

                  let roundingClass = '';
                  if (isFirst && isLast) {
                    roundingClass = 'rounded-lg';
                  } else if (isFirst) {
                    roundingClass = 'rounded-l-lg';
                  } else if (isLast) {
                    roundingClass = 'rounded-r-lg';
                  }

                  const colorClass =
                    item.color || colors[index % colors.length];
                  const formattedValue = formatValue(item.value);

                  const segment = (
                    // biome-ignore lint/a11y/noStaticElementInteractions: Role is conditionally applied based on interactivity
                    <div
                      key={item.id}
                      role={onItemClick ? 'button' : 'presentation'}
                      tabIndex={onItemClick ? 0 : undefined}
                      className={`absolute top-0 h-full ${colorClass} ${onItemClick ? 'cursor-pointer' : ''} group transition-all duration-300 hover:scale-y-110 hover:shadow-md hover:brightness-110 ${roundingClass}`}
                      style={{
                        left: `${leftPercentage}%`,
                        width: `${widthPercentage}%`,
                        transformOrigin: 'center',
                      }}
                      onClick={() => onItemClick?.(item)}
                      onKeyDown={(e) => {
                        if (
                          onItemClick &&
                          (e.key === 'Enter' || e.key === ' ')
                        ) {
                          e.preventDefault();
                          onItemClick(item);
                        }
                      }}
                    >
                      {/* Tooltip */}
                      <div
                        className="pointer-events-none absolute bottom-full z-50 mb-3 whitespace-nowrap rounded-md border border-white/30 bg-black px-3 py-2 text-white text-xs opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100"
                        style={{
                          left: '50%',
                          transform: 'translateX(-50%)',
                        }}
                      >
                        {renderTooltip
                          ? renderTooltip(item, widthPercentage, formattedValue)
                          : renderDefaultTooltip(
                              item,
                              widthPercentage,
                              formattedValue,
                            )}
                        {/* Arrow */}
                        <div className="-translate-x-1/2 absolute top-full left-1/2 h-0 w-0 transform border-transparent border-t-4 border-t-black border-r-4 border-l-4" />
                      </div>
                    </div>
                  );

                  cumulativeValue += item.value;
                  return segment;
                });
              })()}
            </div>
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="space-y-2 pt-2">
              {filteredItems.map((item, index) => {
                const widthPercentage =
                  total > 0 ? (item.value / total) * 100 : 0;
                const colorClass = item.color || colors[index % colors.length];
                const formattedValue = formatValue(item.value);

                return (
                  // biome-ignore lint/a11y/noStaticElementInteractions: Role is conditionally applied based on interactivity
                  <div
                    key={item.id}
                    role={onItemClick ? 'button' : 'listitem'}
                    tabIndex={onItemClick ? 0 : undefined}
                    className={`group flex items-center gap-3 ${onItemClick ? 'cursor-pointer hover:bg-white/10 hover:shadow-sm' : ''} rounded-md p-2 transition-all duration-200 ${onItemClick ? 'border border-transparent hover:border-white/20' : ''}`}
                    onClick={() => onItemClick?.(item)}
                    onKeyDown={(e) => {
                      if (onItemClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onItemClick(item);
                      }
                    }}
                    title={onItemClick ? 'Click to view details' : undefined}
                  >
                    <div
                      className={`h-4 w-4 rounded ${colorClass} flex-shrink-0`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-sm text-white">
                        {item.name}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2 text-right">
                      <div>
                        <div className="font-medium text-sm text-white">
                          {formattedValue}
                          {valueSuffix}
                        </div>
                        <div className="text-white/60 text-xs">
                          {widthPercentage.toFixed(1)}%
                        </div>
                      </div>
                      {showNavigationIndicators && onItemClick && (
                        <ChevronRight className="h-4 w-4 text-white/60 transition-colors group-hover:text-cyan-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
