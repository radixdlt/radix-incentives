'use client';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';

interface SeasonInfoCardProps {
  season: {
    name: string;
    status: string;
  };
}

export const SeasonInfoCard: React.FC<SeasonInfoCardProps> = ({ season }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            {season.name}
            <Badge className="capitalize">{season.status}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};
