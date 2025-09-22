import { ChevronDown, ChevronRight } from 'lucide-react';
import type * as React from 'react';
import { cn } from '~/lib/utils';

export type ExpandableItemListProps<T> = {
  items: T[];
  totalValue: number;
  isAnonymous?: boolean;
  expandedItems: Set<string>;
  hoveredItem: string | null;
  onToggleItem: (itemId: string) => void;
  getItemId: (item: T) => string;
  getItemValue: (item: T) => number;
  getSortValue: (item: T) => string;
  renderIcon: (item: T, index: number) => React.ReactNode;
  renderTitle: (item: T) => string;
  renderExpandedContent: (item: T) => React.ReactNode;
};

export function ExpandableItemList<T>({
  items,
  totalValue,
  isAnonymous = false,
  expandedItems,
  hoveredItem,
  onToggleItem,
  getItemId,
  getItemValue,
  getSortValue,
  renderIcon,
  renderTitle,
  renderExpandedContent,
}: ExpandableItemListProps<T>) {
  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const value = getItemValue(item);
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
        const itemId = getItemId(item);
        const isExpanded = expandedItems.has(itemId);
        const isHovered = hoveredItem === itemId;

        return (
          <div
            key={itemId}
            className={cn(
              'rounded-lg border transition-all duration-200',
              isHovered && 'border-primary/30 ring-2 ring-primary/20',
            )}
          >
            <button
              type="button"
              onClick={() => onToggleItem(itemId)}
              className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {renderIcon(item, index)}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    <span className="block text-sm sm:inline sm:text-base">
                      {renderTitle(item)}
                    </span>
                    {!isAnonymous && (
                      <span className="block text-muted-foreground text-xs sm:ml-2 sm:inline">
                        ({percentage.toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-4">
                <span className="font-semibold text-sm">
                  {getSortValue(item)}
                </span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </button>

            <div
              className={cn(
                'overflow-hidden border-t bg-muted/25 transition-all duration-300 ease-in-out',
                isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
              )}
            >
              <div className="p-4">{renderExpandedContent(item)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
