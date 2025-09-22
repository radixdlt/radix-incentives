type BreakdownProgressBarProps<T> = {
  items: T[];
  totalValue: number;
  getSortLabel: () => string;
  isAnonymous?: boolean;
  formatValue: (value: number) => string;
  getItemValue: (item: T) => number;
  getItemId: (item: T) => string;
  getItemColor?: (item: T, index: number) => string;
  getItemGradient?: (item: T, index: number) => string;
  hoveredItem: string | null;
  onItemHover: (itemId: string | null) => void;
  onItemClick: (itemId: string) => void;
  getItemTitle: (item: T) => string;
};

export function BreakdownProgressBar<T>({
  items,
  totalValue,
  getSortLabel,
  isAnonymous = false,
  formatValue,
  getItemValue,
  getItemId,
  getItemColor,
  getItemGradient,
  hoveredItem,
  onItemHover,
  onItemClick,
  getItemTitle,
}: BreakdownProgressBarProps<T>) {
  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium">Total {getSortLabel()}</span>
        <span className="font-semibold">
          {isAnonymous ? '-' : formatValue(totalValue)}
        </span>
      </div>
      {!isAnonymous && (
        <div className="space-y-2">
          <div className="relative h-6 overflow-hidden rounded-full bg-background">
            {items.map((item, index) => {
              const value = getItemValue(item);
              const percentage =
                totalValue > 0 ? (value / totalValue) * 100 : 0;
              const offset = items
                .slice(0, index)
                .reduce(
                  (sum, prev) =>
                    sum +
                    (totalValue > 0
                      ? (getItemValue(prev) / totalValue) * 100
                      : 0),
                  0,
                );

              const itemId = getItemId(item);
              const isHovered = hoveredItem === itemId;

              // Use provided color/gradient functions or defaults
              const gradientStyle = getItemGradient?.(item, index);
              const colorStyle = getItemColor?.(item, index);

              return (
                <button
                  type="button"
                  key={itemId}
                  className="absolute top-0 h-full cursor-pointer transition-all duration-300"
                  style={{
                    left: `${offset}%`,
                    width: `${percentage}%`,
                    // Use gradient if available, otherwise use solid color
                    ...(gradientStyle
                      ? { background: gradientStyle }
                      : { backgroundColor: colorStyle }),
                    opacity: hoveredItem && !isHovered ? 0.3 : 1,
                    transform: isHovered ? 'scaleY(1.1)' : 'scaleY(1)',
                  }}
                  onMouseEnter={() => onItemHover(itemId)}
                  onMouseLeave={() => onItemHover(null)}
                  onClick={() => onItemClick(itemId)}
                  title={getItemTitle(item)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
