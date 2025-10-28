import {
  CheckCircle,
  Clock,
  ExternalLink,
  Info,
  type LucideIcon,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '~/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { MobileTooltip } from '~/components/ui/mobile-tooltip';
import {
  cn,
  formatActivityPoints,
  formatAPPerHour,
  formatCurrency,
  formatMultiplier,
  formatSeasonPointsPerWeek,
  getIcon,
  isMaintainXrdBalance,
  isVolumeFeeCategory,
} from '~/lib/utils';

// Component-specific types
type ActivityStatus = 'earning' | 'partial' | 'idle';

type StatusBadgeInfo = {
  icon: LucideIcon;
  text: string;
  className: string;
  tooltip: string;
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

type CapitalData = {
  categoryId: string;
  capitalAtWork: string;
  earnedAP: string;
  apPerHour: string | null;
};

type MultiplierData = {
  value: string;
};

// Component-specific utility functions
const getActivityStatus = (
  capitalData: CapitalData | undefined,
  categoryId: string,
): ActivityStatus | null => {
  if (!capitalData) return null;

  const hasCapitalAtWorkValue = parseFloat(capitalData.capitalAtWork) > 0;
  const hasEarnedAP = parseFloat(capitalData.earnedAP) > 0;
  const hasAPPerHour = capitalData.apPerHour !== null;
  const isCurrentlyEarning =
    hasAPPerHour && parseFloat(capitalData.apPerHour || '0') > 0;

  // Special case for maintainXrdBalance - based on capital contribution, not AP
  if (isMaintainXrdBalance(categoryId)) {
    return hasCapitalAtWorkValue ? 'earning' : 'idle';
  }

  // Volume/fee categories: binary logic (no capital at work, only AP matters)
  if (isVolumeFeeCategory(categoryId)) {
    return hasEarnedAP ? 'earning' : 'idle';
  }

  // Categories that don't have AP/hour (but are not maintainXrdBalance or volume/fee)
  if (!hasAPPerHour) {
    return hasEarnedAP ? 'earning' : 'idle';
  }

  // Categories that should have AP/hour (capital-based categories)
  if (hasEarnedAP && isCurrentlyEarning) {
    return 'earning'; // Normal earning state - has AP and actively earning
  }

  if (hasEarnedAP && !isCurrentlyEarning) {
    return 'partial'; // Has AP but not currently earning (0 AP/hour)
  }

  if (!hasEarnedAP && isCurrentlyEarning) {
    return 'partial'; // Currently earning but no AP yet (no snapshot taken)
  }

  return 'idle'; // No AP and no earning potential
};

const getStatusBadge = (
  status: ActivityStatus | null,
): StatusBadgeInfo | null => {
  if (!status) return null;

  switch (status) {
    case 'earning':
      return {
        icon: CheckCircle,
        text: 'Earning',
        className: 'bg-green-500/20 text-green-200 border-green-500/30',
        tooltip: 'You are actively earning points in this category',
      };
    case 'partial':
      return {
        icon: Clock,
        text: 'Partial',
        className: 'bg-orange-500/20 text-orange-200 border-orange-500/30',
        tooltip: 'You are only partially participating in this category',
      };
    case 'idle':
      return {
        icon: XCircle,
        text: 'Idle',
        className: 'bg-red-500/20 text-red-200 border-red-500/30',
        tooltip: 'You are not currently participating in this category',
      };
    default:
      return null;
  }
};

const getCardStyling = (status: ActivityStatus | null): string => {
  if (!status) return '';

  switch (status) {
    case 'earning':
      return 'hover:!border-green-500/80 shadow-green-500/10 hover:shadow-green-500/20';
    case 'partial':
      return 'hover:!border-orange-500/80 shadow-orange-500/10 hover:shadow-orange-500/20';
    case 'idle':
      return 'hover:!border-red-500/80 shadow-red-500/10 hover:shadow-red-500/20';
    default:
      return '';
  }
};

export const ActivityCardEasy = ({
  activity,
  capitalData,
  multiplierData,
}: {
  activity: EasyViewData;
  capitalData?: CapitalData;
  multiplierData?: MultiplierData;
}) => {
  const IconComponent = getIcon(activity.icon);
  const colorClasses = activity.color || 'bg-primary/10 text-white';

  // Check if user has capital at work (positive USD value)
  const hasCapitalAtWork =
    capitalData && parseFloat(capitalData.capitalAtWork) > 0;

  // Get activity status using shared utility
  const status = getActivityStatus(capitalData, activity.id);

  // Get status badge info using shared utility
  const statusBadge = getStatusBadge(status);

  return (
    <Link href={`/dashboard/earn/${activity.id}`} className="block h-full">
      <Card
        className={cn(
          'relative h-full cursor-pointer overflow-hidden transition-all duration-200',
          getCardStyling(status),
        )}
      >
        {status && (
          <div
            className="glow-overlay pointer-events-none absolute top-0 right-0 opacity-25"
            style={{
              width: '500px',
              height: '500px',
              background: `radial-gradient(circle at center, ${
                status === 'earning'
                  ? 'rgba(34, 197, 94, 0.7)'
                  : status === 'partial'
                    ? 'rgba(249, 115, 22, 0.7)'
                    : 'rgba(239, 68, 68, 0.7)'
              } 0%, rgba(0, 0, 0, 0) 45%)`,
              transform: 'translate(50%, -50%)',
            }}
          />
        )}
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
            {statusBadge && (
              <MobileTooltip content={<p>{statusBadge.tooltip}</p>}>
                <Badge
                  variant="outline"
                  className={cn(
                    'flex cursor-help items-center gap-1 font-medium text-xs transition-opacity hover:opacity-80',
                    statusBadge.className,
                  )}
                >
                  <statusBadge.icon className="h-3 w-3" />
                  {statusBadge.text}
                </Badge>
              </MobileTooltip>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {activity.AP && (
              <MobileTooltip
                content={
                  <p>
                    Participation in this category is rewarded with activity
                    points
                  </p>
                }
              >
                <Badge
                  variant="secondary"
                  className="flex cursor-help items-center gap-1 text-xs transition-opacity hover:opacity-80"
                >
                  AP
                  <Info className="h-3 w-3 opacity-60" />
                </Badge>
              </MobileTooltip>
            )}
            {activity.multiplier && (
              <MobileTooltip
                content={
                  <p>
                    XRD or derivatives put to work in this category count toward
                    your SP multiplier!
                  </p>
                }
              >
                <Badge
                  variant="default"
                  className="flex cursor-help items-center gap-1 text-xs transition-opacity hover:opacity-80"
                >
                  Multiplier
                  <Info className="h-3 w-3 opacity-60" />
                </Badge>
              </MobileTooltip>
            )}
            {activity.seasonPointsPerWeek != null &&
              activity.seasonPointsPerWeek > 0 && (
                <MobileTooltip
                  content={
                    <p>
                      Amount of Season Points distributed to participants of
                      this category weekly
                    </p>
                  }
                >
                  <Badge
                    variant="outline"
                    className="flex cursor-help items-center gap-1 text-xs transition-opacity hover:opacity-80"
                  >
                    {formatSeasonPointsPerWeek(activity.seasonPointsPerWeek)}
                    <Info className="h-3 w-3 opacity-60" />
                  </Badge>
                </MobileTooltip>
              )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <CardDescription className="text-sm">
            {activity.description}
          </CardDescription>
          {((capitalData &&
            (parseFloat(capitalData.earnedAP) > 0 ||
              capitalData.apPerHour ||
              hasCapitalAtWork ||
              !isMaintainXrdBalance(activity.id))) ||
            (isMaintainXrdBalance(activity.id) && multiplierData)) && (
            <div className="space-y-2">
              {isMaintainXrdBalance(activity.id) && multiplierData && (
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <span className="text-muted-foreground text-sm">
                    Current multiplier:
                  </span>
                  <span className="font-semibold text-sm">
                    {formatMultiplier(multiplierData.value)}
                  </span>
                </div>
              )}
              {capitalData &&
                !isMaintainXrdBalance(activity.id) &&
                (parseFloat(capitalData.earnedAP) > 0 ||
                  capitalData.earnedAP !== undefined) && (
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <span className="text-muted-foreground text-sm">
                      AP earned:
                    </span>
                    <span className="font-semibold text-sm">
                      {formatActivityPoints(capitalData.earnedAP)}
                      {capitalData.apPerHour &&
                        !isVolumeFeeCategory(activity.id) && (
                          <span className="ml-1 font-normal text-muted-foreground">
                            ({formatAPPerHour(capitalData.apPerHour)}/hour)
                          </span>
                        )}
                    </span>
                  </div>
                )}
              {capitalData && !isVolumeFeeCategory(activity.id) && (
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <span className="text-muted-foreground text-sm">
                    Capital at work:
                  </span>
                  <span className="font-semibold text-sm">
                    {formatCurrency(capitalData.capitalAtWork)}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>

        {activity.dappLogos && activity.dappLogos.length > 0 && (
          <CardFooter className="pt-3">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground text-xs">
                Visit to earn:
              </span>
              <div className="flex gap-2">
                {activity.dappLogos.map((dappLogo) => (
                  <button
                    key={dappLogo.name}
                    type="button"
                    className="group relative cursor-pointer"
                    title={dappLogo.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        dappLogo.websiteUrl,
                        '_blank',
                        'noopener,noreferrer',
                      );
                    }}
                  >
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white transition-transform duration-200 group-hover:scale-105">
                      <Image
                        src={dappLogo.logoPath}
                        alt={`${dappLogo.name} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <ExternalLink className="-right-1 -top-1 absolute h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
};
