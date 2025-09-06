import type { ActivityCategory } from 'api/incentives';
import {
  Coins,
  CreditCard,
  Droplet,
  ExternalLink,
  FileText,
  Settings,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import Image from 'next/image';
import { Badge } from '~/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { cn } from '~/lib/utils';
import type { EasyViewData } from '../advanced/data/easyViewData';

export const ActivityCardEasy = ({
  activity,
  activityCategoryMap,
}: {
  activity: EasyViewData;
  activityCategoryMap: Record<string, ActivityCategory>;
}) => {
  const activityCategory = activityCategoryMap[activity.category];
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lendingStables':
        return <Coins className="h-5 w-5" />;
      case 'maintainXrdBalance':
        return <Wallet className="h-5 w-5" />;
      case 'provideBlueChipLiquidityToDex':
        return <Droplet className="h-5 w-5" />;
      case 'provideNativeLiquidityToDex':
        return <Droplet className="h-5 w-5" />;
      case 'provideStablesLiquidityToDex':
        return <Droplet className="h-5 w-5" />;
      case 'tradingVolume':
        return <TrendingUp className="h-5 w-5" />;
      case 'transactionFees':
        return <CreditCard className="h-5 w-5" />;
      case 'componentCalls':
        return <Settings className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lendingStables':
        return 'bg-green-500/10 text-green-600';
      case 'maintainXrdBalance':
        return 'bg-blue-500/10 text-blue-600';
      case 'provideBlueChipLiquidityToDex':
        return 'bg-purple-500/10 text-purple-600';
      case 'provideNativeLiquidityToDex':
        return 'bg-cyan-500/10 text-cyan-600';
      case 'provideStablesLiquidityToDex':
        return 'bg-emerald-500/10 text-emerald-600';
      case 'tradingVolume':
        return 'bg-orange-500/10 text-orange-600';
      case 'transactionFees':
        return 'bg-red-500/10 text-red-600';
      case 'componentCalls':
        return 'bg-gray-500/10 text-gray-600';
      default:
        return 'bg-slate-500/10 text-slate-600';
    }
  };

  return (
    <Card
      className={cn(
        'h-full transition-all duration-200 hover:shadow-lg',
        'border-2 hover:border-primary/50',
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'rounded-lg p-2',
                getCategoryColor(activity.category),
              )}
            >
              {getCategoryIcon(activity.category)}
            </div>
            <div>
              <CardTitle className="text-lg">
                {activity.name || activity.id}
              </CardTitle>
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {activity.AP && (
            <Badge variant="secondary" className="text-xs">
              AP
            </Badge>
          )}
          {activity.multiplier && (
            <Badge variant="default" className="text-xs">
              Multiplier
            </Badge>
          )}
          {activity.seasonPointsPerWeek && (
            <Badge variant="outline" className="text-xs">
              {(activity.seasonPointsPerWeek / 1000).toLocaleString()}k SP/week
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm">
          {activity.description}
        </CardDescription>

        <div>
          <h4 className="mb-2 font-medium text-foreground text-sm">
            Category:
          </h4>
          <p className="text-muted-foreground text-xs">
            {activityCategory?.name}
          </p>
        </div>
      </CardContent>

      {activity.dappLogos && activity.dappLogos.length > 0 && (
        <CardFooter className="pt-3">
          <div className="flex w-full items-center justify-between">
            <span className="text-muted-foreground text-xs">Available on:</span>
            <div className="flex gap-2">
              {activity.dappLogos.map((dappLogo) => (
                <a
                  key={dappLogo.name}
                  href={dappLogo.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  title={dappLogo.name}
                >
                  <div className="relative h-8 w-8 overflow-hidden rounded-full border bg-white transition-transform duration-200 group-hover:scale-105">
                    <Image
                      src={dappLogo.logoPath}
                      alt={`${dappLogo.name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <ExternalLink className="-right-1 -top-1 absolute h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ))}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
