import { Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';

type ArculusCompetitionCardProps = {
  isActive: boolean;
  prizeCount: number;
};

export const ArculusCompetitionCard: FC<ArculusCompetitionCardProps> = ({
  isActive,
  prizeCount,
}) => {
  return (
    <Card className="col-span-full overflow-hidden border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-cyan-500" />
            <h3 className="font-semibold text-lg">Arculus Card Competition</h3>
          </div>
          {isActive ? (
            <Badge className="bg-green-500/20 text-green-400">Active</Badge>
          ) : (
            <Badge className="bg-gray-500/20 text-gray-400">Ended</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/assets/arculuscard.webp"
              alt="Arculus Card"
              width={80}
              height={80}
              className="rounded-lg"
            />
            <div className="flex-1">
              <p className="text-muted-foreground text-sm">
                Win 1 of {prizeCount} exclusive Radix branded Arculus hardware
                wallet cards. Higher XRD holdings = better chances to win!
              </p>
            </div>
          </div>
          <Button type="button" asChild className="shrink-0">
            <Link href="/dashboard/competitions/arculus">View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
