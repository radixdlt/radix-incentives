import { Trophy } from 'lucide-react';
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export const HowToWinCard: FC = () => {
  return (
    <Card noHover>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          How to Win
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="gradient-brand flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg font-bold text-sm text-white">
              1
            </div>
            <div>
              <div className="font-semibold text-white">
                Connect Your Wallet & Join
              </div>
              <div className="text-sm text-white/70">
                Link your Radix wallet and press the Join Competition button to
                participate
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="gradient-brand flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg font-bold text-sm text-white">
              2
            </div>
            <div>
              <div className="font-semibold text-white">
                Hold XRD to Increase Your Chances
              </div>
              <div className="text-sm text-white/70">
                The more XRD you hold, the higher your odds in the random draw
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="gradient-brand flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg font-bold text-sm text-white">
              3
            </div>
            <div>
              <div className="font-semibold text-white">
                Check Back After Competition
              </div>
              <div className="text-sm text-white/70">
                After the competition ends, check if you won and provide your
                email to claim your prize
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
