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

const iconMap = {
  Coins,
  CreditCard,
  Droplet,
  FileText,
  Settings,
  TrendingUp,
  Wallet,
} as const;

const getIcon = (iconName?: string) => {
  if (!iconName) return FileText;
  return iconMap[iconName as keyof typeof iconMap] || FileText;
};

type EasyViewData = {
  id: string;
  name: string;
  description: string;
  dapp: string;
  component_addresses: string;
  AP: boolean;
  multiplier: boolean;
  seasonPointsPerWeek?: number;
  icon?: string;
  color?: string;
  dappLogos?: {
    name: string;
    logoPath: string;
    websiteUrl: string;
  }[];
};

export const ActivityCardEasy = ({ activity }: { activity: EasyViewData }) => {
  const IconComponent = getIcon(activity.icon);
  const colorClasses = activity.color || 'bg-primary/10 text-primary';

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
            <div className={cn('rounded-lg p-2', colorClasses)}>
              <IconComponent className="h-5 w-5" />
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
          {activity.seasonPointsPerWeek != null &&
            activity.seasonPointsPerWeek > 0 && (
              <Badge variant="outline" className="text-xs">
                {(activity.seasonPointsPerWeek / 1000).toLocaleString()}k
                SP/week
              </Badge>
            )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm">
          {activity.description}
        </CardDescription>
      </CardContent>

      {activity.dappLogos && activity.dappLogos.length > 0 && (
        <CardFooter className="pt-3">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-xs">
              Visit to earn:
            </span>
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
