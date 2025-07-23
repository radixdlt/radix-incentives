"use client";

import { Calendar } from "lucide-react";

interface Week {
  id: string;
  seasonId: string;
  startDate: Date;
  endDate: Date;
  seasonName: string;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface CategoryInfoProps {
  week: Week;
  category: Category;
}

export function CategoryInfo({ week, category }: CategoryInfoProps) {
  const isActive = new Date() <= new Date(week.endDate);
  const statusColor = isActive ? "text-green-600" : "text-muted-foreground";
  const statusText = isActive ? "Active" : "Completed";

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = new Date(start).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endStr = new Date(end).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex-1">
        {/* Title and Status - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
          <h3 className="text-xl font-semibold">{category.name}</h3>
          <span className={`text-sm font-medium ${statusColor} sm:ml-auto`}>
            {statusText}
          </span>
        </div>

        {category.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {category.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDateRange(week.startDate, week.endDate)}</span>
          <span className="text-xs">•</span>
          <span>{week.seasonName}</span>
        </div>
      </div>
    </div>
  );
}
