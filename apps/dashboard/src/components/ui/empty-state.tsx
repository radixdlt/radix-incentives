import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "bg-background border-border hover:border-border/80 text-center",
        "border-2 border-dashed rounded-xl p-14 w-full",
        "group hover:bg-muted/50 transition duration-500 hover:duration-200",
        className
      )}
    >
      {icon && (
        <div className="flex justify-center isolate mb-6">
          <div className="bg-background size-12 grid place-items-center rounded-xl shadow-lg ring-1 ring-border group-hover:-translate-y-0.5 transition duration-500 group-hover:duration-200">
            {React.createElement(icon, {
              className: "w-6 h-6 text-muted-foreground",
            })}
          </div>
        </div>
      )}
      <h2 className="text-foreground font-medium">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          className={cn("mt-4", "shadow-sm active:shadow-none")}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
