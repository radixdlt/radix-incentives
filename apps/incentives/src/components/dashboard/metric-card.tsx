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
  iconColor = 'text-cyan-400',
}: MetricCardProps) => {
  return (
    <Card className="overflow-hidden group">
      <div className="p-6 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/80">{title}</span>
          {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
        </div>
        
        <div className="flex items-end gap-3">
          <span className="text-4xl font-bold tracking-tight text-white gradient-text">
            {value}
          </span>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 text-xs font-medium mb-1 ${
              trend.isPositive 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
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
