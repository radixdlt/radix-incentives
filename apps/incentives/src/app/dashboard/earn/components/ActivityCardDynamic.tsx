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

export const ActivityCardDynamic = ({
  category,
}: {
  category: ActivityCategory & {
    dapps?: Array<{
      id: string;
      name: string;
      website: string;
      logoFileName: string | null;
    }>;
    seasonPointsPerWeek?: number;
    multiplier?: boolean;
  };
}) => {
  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
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
      case 'provideXrdDerivativeLiquidityToDex':
        return <Droplet className="h-5 w-5" />;
      case 'lendingBlueChips':
        return <Coins className="h-5 w-5" />;
      case 'lendingXrdDerivative':
        return <Coins className="h-5 w-5" />;
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

  const getCategoryColor = (categoryId: string) => {
    switch (categoryId) {
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
      case 'provideXrdDerivativeLiquidityToDex':
        return 'bg-cyan-500/10 text-cyan-600';
      case 'lendingBlueChips':
        return 'bg-green-500/10 text-green-600';
      case 'lendingXrdDerivative':
        return 'bg-green-500/10 text-green-600';
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

  // Check if this category has activities that earn AP
  const hasAP = true; // TODO: Implement logic to check if category has activities with AP

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
              className={cn('rounded-lg p-2', getCategoryColor(category.id))}
            >
              {getCategoryIcon(category.id)}
            </div>
            <div>
              <CardTitle className="text-lg">{category.name}</CardTitle>
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {hasAP && (
            <Badge variant="secondary" className="text-xs">
              AP
            </Badge>
          )}
          {category.multiplier && (
            <Badge variant="default" className="text-xs">
              Multiplier
            </Badge>
          )}
          {typeof category.seasonPointsPerWeek === 'number' &&
            category.seasonPointsPerWeek > 0 && (
              <Badge variant="outline" className="text-xs">
                {(category.seasonPointsPerWeek / 1000).toLocaleString()}k
                SP/week
              </Badge>
            )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm">
          {category.description || 'No description available'}
        </CardDescription>
      </CardContent>

      {category.dapps && category.dapps.length > 0 && (
        <CardFooter className="pt-3">
          <div className="flex w-full items-center justify-between">
            <span className="text-muted-foreground text-xs">Available on:</span>
            <div className="flex gap-2">
              {category.dapps.map((dapp) => (
                <a
                  key={dapp.id}
                  href={dapp.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  title={dapp.name}
                >
                  <div className="relative h-8 w-8 overflow-hidden rounded-full border bg-white transition-transform duration-200 group-hover:scale-105">
                    {dapp.logoFileName ? (
                      <Image
                        src={`/dapp-logos/${dapp.logoFileName}`}
                        alt={`${dapp.name} logo`}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100 font-medium text-gray-500 text-xs">
                        {dapp.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
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
