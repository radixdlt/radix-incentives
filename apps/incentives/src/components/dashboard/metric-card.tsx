import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
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
  onClick?: () => void;
  clickHint?: string;
  noHover?: boolean;
}

export const MetricCard = ({
  title,
  value,
  trend,
  icon: Icon,
  description,
  iconColor = 'text-cyan-400',
  onClick,
  clickHint,
  noHover = false,
}: MetricCardProps) => {
  return (
    <Card
      className={`group overflow-hidden ${onClick ? 'cursor-pointer border-primary/20 transition-all duration-500 ease-in-out hover:border-primary/50 hover:bg-muted/50 hover:shadow-lg' : ''}`}
      onClick={onClick}
      noHover={noHover}
    >
      <div className="flex flex-col space-y-4 p-6">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm text-white/80">{title}</span>
          <div className="flex items-center gap-2">
            {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
            {onClick && (
              <ChevronRight className="h-4 w-4 text-white/40 transition-colors duration-500 ease-in-out group-hover:text-white/70" />
            )}
          </div>
        </div>

        <div className="flex items-end gap-3">
          <span className="gradient-text font-bold text-4xl tracking-tight">
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

        <div className="flex items-center justify-between">
          <div className="text-sm text-white/60">{description}</div>
          {onClick && clickHint && (
            <div className="text-white/40 text-xs transition-colors duration-500 ease-in-out group-hover:text-white/60">
              {clickHint}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
