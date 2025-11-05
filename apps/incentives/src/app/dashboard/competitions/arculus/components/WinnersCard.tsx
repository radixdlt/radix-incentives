import { Users } from 'lucide-react';
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

type WinnersCardProps = {
  prizeCount: number;
};

export const WinnersCard: FC<WinnersCardProps> = ({ prizeCount }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-cyan-400" />
          Winners
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-white/70">
            {prizeCount} winners will be randomly selected from all eligible
            participants. Selection is weighted by XRD holdings - the more XRD
            you hold, the higher your chance of winning.
          </p>
          <p className="text-sm text-white/70">
            Winners will be announced and contacted after the competition ends.
            All eligible participants with XRD holdings will automatically be
            entered into the draw.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
