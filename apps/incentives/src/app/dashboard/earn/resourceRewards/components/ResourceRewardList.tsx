'use client';

import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

type ResourceReward = {
  claims: {
    localId: string | null;
    claimedAt: Date;
  }[];
  nfHoldings: string[];
  name: string;
  iconUrl: string;
  address: string;
  points: number;
  weeklyLimit?: number;
  url?: string | null;
};

export type ResourceRewardListProps = {
  resourceRewards: ResourceReward[];
  onClaim: (input: { address: string }) => Promise<void>;
  isLoggedIn: boolean;
  isLoading?: boolean;
};

const ResourceRewardSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardHeader>
    </Card>
  );
};

const CardDataListItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => {
  return (
    <div className="mb-2 flex items-center justify-between rounded-lg bg-muted/50 p-3">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-semibold text-sm">{value}</span>
    </div>
  );
};

const ResourceRewardItem = ({
  name,
  address,
  points,
  weeklyLimit,
  claims,
  nfHoldings,
  iconUrl,
  url,
  isLoggedIn,
  onClaim,
}: ResourceReward & { onClaim: () => Promise<void>; isLoggedIn: boolean }) => {
  const [isClaiming, setIsClaiming] = useState(false);

  const unclaimedNfIds = nfHoldings.filter(
    (id) => !claims.some((claim) => claim.localId === id),
  );

  // Calculate points already earned this week (capped at weekly limit)
  const pointsAlreadyEarned = claims.length * points;
  const claimedPoints = weeklyLimit
    ? Math.min(pointsAlreadyEarned, weeklyLimit)
    : pointsAlreadyEarned;

  // Calculate how many points are still available under the weekly limit
  const remainingPointsCapacity = weeklyLimit
    ? Math.max(0, weeklyLimit - pointsAlreadyEarned)
    : Number.POSITIVE_INFINITY;

  // Calculate points that will actually count (capped by remaining capacity)
  const pointsThatWillCount = Math.min(
    unclaimedNfIds.length * points,
    remainingPointsCapacity,
  );

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await onClaim();
    } finally {
      setIsClaiming(false);
    }
  };

  // Determine quest state
  const hasReachedLimit = weeklyLimit && pointsAlreadyEarned >= weeklyLimit;
  const hasAnyClaims = claims.length > 0;
  const hasUnclaimedItems = unclaimedNfIds.length > 0;

  // Determine button variant and text based on quest state
  let buttonVariant: 'default' | 'destructive' | 'outline' | 'secondary' =
    'outline';
  let buttonText = 'Connect to claim points';
  let shouldLinkToUrl = false;

  if (isLoggedIn) {
    if (isClaiming) {
      buttonText = 'Claiming...';
    } else if (hasUnclaimedItems) {
      // Normal state: User has unclaimed items
      buttonVariant = 'outline';
      buttonText = `${pointsThatWillCount} Points To Claim`;
    } else if (hasReachedLimit) {
      // Green: Quest completed (reached limit)
      buttonVariant = 'default';
      buttonText = 'Quest Completed';
    } else if (hasAnyClaims) {
      // Orange: Has claims but not at limit, needs more resources
      buttonVariant = 'secondary';
      buttonText = 'Get More Resources';
      shouldLinkToUrl = true;
    } else {
      // Red: No claims yet, needs to get resource
      buttonVariant = 'outline';
      buttonText = 'Get Resources';
      shouldLinkToUrl = true;
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-4">
          <CardTitle className="flex items-center gap-2 text-md">
            <Image
              src={`https://image-service.radixdlt.com/?imageSize=1024x1024&imageOrigin=${iconUrl}`}
              alt={name}
              width={40}
              height={40}
              className="aspect-square rounded-lg"
            />
            <div className="flex items-center gap-2">
              <Link
                href={`https://dashboard.radixdlt.com/resource/${address}`}
                target="_blank"
                className="hover:underline"
              >
                {name}
              </Link>
              <Badge variant="outline" className="text-xs">
                Owned: {nfHoldings.length}
              </Badge>
            </div>
          </CardTitle>
        </div>
        <div className="text-sm">
          <CardDataListItem label="Points per item" value={points} />
          <CardDataListItem
            label="Weekly cap"
            value={weeklyLimit ?? 'No limit'}
          />
          <CardDataListItem
            label="Points claimed this week"
            value={claimedPoints}
          />
        </div>
        <Button
          variant={buttonVariant}
          onClick={() => {
            if (shouldLinkToUrl) {
              const urlToOpen =
                url || `https://dashboard.radixdlt.com/resource/${address}`;
              window.open(urlToOpen, '_blank');
            } else {
              handleClaim();
            }
          }}
          disabled={shouldLinkToUrl ? false : isClaiming || !hasUnclaimedItems}
          type="button"
          className={
            hasUnclaimedItems
              ? '!border-green-500 !border-2 shadow-[inset_0_0_12px_rgba(34,197,94,0.2)]'
              : !hasUnclaimedItems && buttonVariant === 'secondary'
                ? '!border-orange-500 !border-2 !text-white shadow-[inset_0_0_12px_rgba(249,115,22,0.2)]'
                : !hasUnclaimedItems &&
                    !hasAnyClaims &&
                    buttonVariant === 'outline'
                  ? '!border-red-500 !border-2 !text-white shadow-[inset_0_0_12px_rgba(239,68,68,0.2)]'
                  : ''
          }
        >
          {buttonText}
        </Button>
      </CardHeader>
    </Card>
  );
};

export const ResourceRewardList = ({
  resourceRewards,
  onClaim,
  isLoggedIn,
  isLoading,
}: ResourceRewardListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ResourceRewardSkeleton />
        <ResourceRewardSkeleton />
        <ResourceRewardSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {resourceRewards.map((resourceReward) => (
        <ResourceRewardItem
          key={resourceReward.address}
          {...resourceReward}
          isLoggedIn={isLoggedIn}
          onClaim={() =>
            onClaim({
              address: resourceReward.address,
            })
          }
        />
      ))}
    </div>
  );
};
