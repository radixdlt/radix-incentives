import type { LucideIcon } from 'lucide-react';
import * as React from 'react';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-border bg-background text-center hover:border-border/80',
        'w-full rounded-xl border-2 border-dashed p-14',
        'group transition duration-500 hover:bg-muted/50 hover:duration-200',
        className,
      )}
    >
      {icon && (
        <div className="isolate mb-6 flex justify-center">
          <div className="group-hover:-translate-y-0.5 grid size-12 place-items-center rounded-xl bg-background shadow-lg ring-1 ring-border transition duration-500 group-hover:duration-200">
            {React.createElement(icon, {
              className: 'w-6 h-6 text-muted-foreground',
            })}
          </div>
        </div>
      )}
      <h2
        className="font-medium text-foreground"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Title content is controlled by the application
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <p className="mt-1 whitespace-pre-line text-muted-foreground text-sm">
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          className={cn('mt-4', 'shadow-sm active:shadow-none')}
        >
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}
