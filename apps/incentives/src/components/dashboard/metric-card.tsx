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
  value,
  trend,
  icon: Icon,
  description,
  iconColor = 'text-cyan-400',
}: MetricCardProps) => {
  return (
    <Card className="group overflow-hidden">
      <div className="flex flex-col space-y-4 p-6">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm text-white/80">{title}</span>
          {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
        </div>

        <div className="flex items-end gap-3">
          <span className="gradient-text font-bold text-4xl text-white tracking-tight">
            {value}
          </span>
          {trend && (
            <div
              className={`mb-1 flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 font-medium text-xs ${
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>

        <div className="text-sm text-white/60">{description}</div>
      </div>
    </Card>
  );
};
