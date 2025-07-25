"use client";

import { ChevronRight, Trophy } from "lucide-react";
import type { ReactNode } from "react";

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
    formattedValue: string
  ) => ReactNode;
  colors?: string[];
  showLegend?: boolean;
  showNavigationIndicators?: boolean;
  formatValue?: (value: number) => string;
  valueSuffix?: string;
  className?: string;
}

const defaultColors = [
  "bg-gradient-to-r from-pink-500 to-pink-400",
  "bg-gradient-to-r from-cyan-500 to-cyan-400", 
  "bg-gradient-to-r from-blue-500 to-blue-400",
  "bg-gradient-to-r from-purple-500 to-purple-400",
  "bg-gradient-to-r from-emerald-500 to-emerald-400",
  "bg-gradient-to-r from-orange-500 to-orange-400",
  "bg-gradient-to-r from-rose-500 to-rose-400",
  "bg-gradient-to-r from-violet-500 to-violet-400",
  "bg-gradient-to-r from-teal-500 to-teal-400",
  "bg-gradient-to-r from-amber-500 to-amber-400",
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
  valueSuffix = "",
  className = "",
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
    formattedValue: string
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
    <div className={`rounded-lg glass-card p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <h3 className="text-lg font-semibold text-white">
            Total: {formatValue(total)}
            {valueSuffix}
          </h3>
        </div>

        {onItemClick && (
          <div className="text-sm text-white/60 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-cyan-400" />
            Click any {title
              .toLowerCase()
              .replace(" categories", " category")}{" "}
            to view its leaderboard
            {title.includes("Categories") ? " and sub-activities" : ""}
          </div>
        )}

        <div className="space-y-1">
          {/* Stacked Bar */}
          <div className="pt-1">
            <div
              className={`w-full h-8 bg-white/10 rounded-lg relative ${onItemClick ? "cursor-pointer hover:shadow-md" : ""} transition-shadow duration-200`}
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

                  let roundingClass = "";
                  if (isFirst && isLast) {
                    roundingClass = "rounded-lg";
                  } else if (isFirst) {
                    roundingClass = "rounded-l-lg";
                  } else if (isLast) {
                    roundingClass = "rounded-r-lg";
                  }

                  const colorClass =
                    item.color || colors[index % colors.length];
                  const formattedValue = formatValue(item.value);

                  const segment = (
                    <div
                      key={item.id}
                      role={onItemClick ? "button" : undefined}
                      tabIndex={onItemClick ? 0 : undefined}
                      className={`absolute top-0 h-full ${colorClass} ${onItemClick ? "cursor-pointer" : ""} transition-all duration-300 hover:scale-y-110 hover:brightness-110 hover:shadow-md group ${roundingClass}`}
                      style={{
                        left: `${leftPercentage}%`,
                        width: `${widthPercentage}%`,
                        transformOrigin: "center",
                      }}
                      onClick={() => onItemClick?.(item)}
                      onKeyDown={(e) => {
                        if (
                          onItemClick &&
                          (e.key === "Enter" || e.key === " ")
                        ) {
                          e.preventDefault();
                          onItemClick(item);
                        }
                      }}
                    >
                      {/* Tooltip */}
                      <div
                        className="absolute bottom-full mb-3 px-3 py-2 bg-black border border-white/30 text-white text-xs rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none"
                        style={{
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      >
                        {renderTooltip
                          ? renderTooltip(item, widthPercentage, formattedValue)
                          : renderDefaultTooltip(
                              item,
                              widthPercentage,
                              formattedValue
                            )}
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black" />
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
                  <div
                    key={item.id}
                    role={onItemClick ? "button" : undefined}
                    tabIndex={onItemClick ? 0 : undefined}
                    className={`group flex items-center gap-3 ${onItemClick ? "cursor-pointer hover:bg-white/10 hover:shadow-sm" : ""} p-2 rounded-md transition-all duration-200 ${onItemClick ? "border border-transparent hover:border-white/20" : ""}`}
                    onClick={() => onItemClick?.(item)}
                    onKeyDown={(e) => {
                      if (onItemClick && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        onItemClick(item);
                      }
                    }}
                    title={onItemClick ? "Click to view details" : undefined}
                  >
                    <div
                      className={`w-4 h-4 rounded ${colorClass} flex-shrink-0`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate text-white">
                        {item.name}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 flex items-center gap-2">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {formattedValue}
                          {valueSuffix}
                        </div>
                        <div className="text-xs text-white/60">
                          {widthPercentage.toFixed(1)}%
                        </div>
                      </div>
                      {showNavigationIndicators && onItemClick && (
                        <ChevronRight className="h-4 w-4 text-white/60 group-hover:text-cyan-400 transition-colors" />
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
