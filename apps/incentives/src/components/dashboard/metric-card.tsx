import type { LucideIcon } from 'lucide-react';
import { Card } from '~/components/ui/card';

interface MetricCardProps {
  title: string;
  subtitle?: string;
  value: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  description: string;
  iconColor?: string;
}

export const MetricCard = ({
  title,
  subtitle,
  value,
  trend,
  icon: Icon,
  description,
  iconColor = 'text-green-500',
}: MetricCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="p-6 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{title}</span>
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          {Icon && <Icon className={`h-4 w-4 ${iconColor} mb-1`} />}
          {trend && (
            <span
              className={`text-xs mb-1 ${
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </Card>
  );
};
