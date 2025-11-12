import { Card, CardContent } from '~/components/ui/card';
import type { RouterOutputs } from '~/trpc/react';

type CompetitionDetailsProps = {
  competition: RouterOutputs['competition']['getCompetitionById'];
};

export const CompetitionDetails = ({
  competition,
}: CompetitionDetailsProps) => {
  return (
    <Card>
      <CardContent>
        <div>
          <span>Start Date: </span>
          <span>{competition.startDate.toISOString()}</span>
        </div>
        <div>
          <span>End Date: </span>
          <span>{competition.endDate.toISOString()}</span>
        </div>
        <div>
          <span>Prize Count: </span>
          <span>{competition.prizeCount}</span>
        </div>
      </CardContent>
    </Card>
  );
};
