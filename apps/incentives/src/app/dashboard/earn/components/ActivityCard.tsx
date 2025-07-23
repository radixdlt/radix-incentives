import {
  ExternalLink,
  Banknote,
  Wallet,
  Zap,
  Waves,
  TrendingUp,
  HandCoins,
  CreditCard,
  Settings,
  FileText,
  Droplet,
  PiggyBank,
  Coins,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import type { IconName } from '../utils/getActivityIcon';
import type { Activity, ActivityCategory, Dapp } from 'api/incentives';

export const ActivityCard = ({
  activity,
  dappMap,
  activityCategoryMap,
}: {
  activity: Activity;
  dappMap: Record<string, Dapp>;
  activityCategoryMap: Record<string, ActivityCategory>;
}) => {
  const dapp = dappMap[activity.dapp];
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
        'h-full hover:shadow-lg transition-all duration-200',
        'border-2 hover:border-primary/50',
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'p-2 rounded-lg',
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
          {dapp && (
            <Badge variant="outline" className="text-xs">
              {dapp.name}
            </Badge>
          )}
        </div>
        <div className="flex gap-1 mt-2">
          {activity?.data?.ap && (
            <Badge variant="secondary" className="text-xs">
              AP
            </Badge>
          )}
          {activity?.data?.multiplier && (
            <Badge variant="default" className="text-xs">
              Multiplier
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm">
          {activity.description || 'No description available'}
        </CardDescription>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">
            Category:
          </h4>
          <p className="text-xs text-muted-foreground">
            {activityCategory?.name}
          </p>
        </div>
      </CardContent>

      {dapp && (
        <CardFooter className="pt-3">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a
              href={dapp.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Visit dApp
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
