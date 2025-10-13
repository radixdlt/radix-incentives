'use client';

import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle } from '~/components/ui/card';

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
};

export type ResourceRewardListProps = {
  resourceRewards: ResourceReward[];
  onClaim: (input: { address: string }) => Promise<void>;
  isLoggedIn: boolean;
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
  claims,
  nfHoldings,
  iconUrl,
  isLoggedIn,
  onClaim,
}: ResourceReward & { onClaim: () => Promise<void>; isLoggedIn: boolean }) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const claimedPoints = claims.length * points;
  const unclaimedNfIds = nfHoldings.filter(
    (id) => !claims.some((claim) => claim.localId === id),
  );
  const unclaimedPoints = unclaimedNfIds.length * points;

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await onClaim();
    } finally {
      setIsClaiming(false);
    }
  };

  const buttonText = isLoggedIn
    ? isClaiming
      ? 'Claiming...'
      : `${unclaimedPoints} points to claim`
    : 'Connect to claim points';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex gap-2 text-md">
          <div className="flex grow items-center gap-2">
            <Image
              src={`https://image-service.radixdlt.com/?imageSize=1024x1024&imageOrigin=${iconUrl}`}
              alt={name}
              width={40}
              height={40}
              className="aspect-square rounded-lg"
            />
            <div className="self-center">
              <Link
                href={`https://dashboard.radixdlt.com/resource/${address}`}
                target="_blank"
                className="flex items-center gap-1 hover:underline"
              >
                {name}
                <ExternalLink className="h-3 w-3 self-center" />
              </Link>
            </div>
          </div>
          <Badge variant="outline" className="self-center">
            Owned: {nfHoldings.length}
          </Badge>
        </CardTitle>
        <div className="text-sm">
          <CardDataListItem label="Points per item" value={points} />
          <CardDataListItem
            label="Points claimed this week"
            value={claimedPoints}
          />
        </div>
        <Button
          variant="outline"
          onClick={handleClaim}
          disabled={isClaiming || unclaimedPoints === 0}
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
}: ResourceRewardListProps) => {
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
