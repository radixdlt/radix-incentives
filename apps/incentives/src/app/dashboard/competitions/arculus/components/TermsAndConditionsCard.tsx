import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

type TermsAndConditionsCardProps = {
  prizeCount: number;
};

export const TermsAndConditionsCard: FC<TermsAndConditionsCardProps> = ({
  prizeCount,
}) => {
  return (
    <Card noHover>
      <CardHeader>
        <CardTitle>Terms and Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-inside list-disc space-y-2 text-sm text-white/70">
          <li>
            Winners are randomly selected with probability by time-weighted
            average of XRD holdings at the time of the draw.
          </li>
          <li>
            {prizeCount} winners will each receive one Radix branded Arculus
            card.
          </li>
          <li>
            Prizes are non-transferable and cannot be exchanged for cash or
            other rewards.
          </li>
          <li>
            Winners needs to provide an email address to receive the prize.
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};
