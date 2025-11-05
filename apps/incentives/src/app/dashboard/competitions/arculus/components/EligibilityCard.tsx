import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardHeader, CardTitle } from '~/components/ui/card';

type EligibilityCardProps = {
  isParticipant: boolean;
  onJoin: () => void;
  isLoading?: boolean;
  isCompetitionActive: boolean;
};

export const EligibilityCard: FC<EligibilityCardProps> = ({
  isParticipant,
  onJoin,
  isLoading = false,
  isCompetitionActive,
}) => {
  const getButtonText = () => {
    if (!isCompetitionActive) return 'Competition has ended';
    if (isParticipant) return 'Participating';
    return 'Join the competition';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex-grow self-center">
            <div>Increase your chances by adding more XRD to activities</div>
            <Button variant="link" asChild>
              <Link href="/dashboard/earn/maintainXrdBalance">
                Check your XRD holdings here
              </Link>
            </Button>
          </div>
          <Button
            type="button"
            disabled={isParticipant || isLoading || !isCompetitionActive}
            onClick={onJoin}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {getButtonText()}
          </Button>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};
