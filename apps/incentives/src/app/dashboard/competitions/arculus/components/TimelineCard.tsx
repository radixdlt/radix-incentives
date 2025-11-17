import { Award, Calendar, CheckCircle2, Gift } from 'lucide-react';
import type { FC } from 'react';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

type TimelineCardProps = {
  startDate: Date;
  endDate: Date;
  isActive: boolean;
};

export const TimelineCard: FC<TimelineCardProps> = ({
  startDate,
  endDate,
  isActive,
}) => {
  return (
    <Card noHover>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-400" />
          Timeline
        </CardTitle>
        {isActive ? (
          <Badge className="bg-green-500/20 px-4 py-2 font-semibold text-green-400">
            Active
          </Badge>
        ) : (
          <Badge className="bg-gray-500/20 px-4 py-2 font-semibold text-gray-400">
            Ended
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
            <div>
              <div className="font-semibold text-white">Competition Start</div>
              <div className="text-sm text-white/70">
                {startDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                isActive ? 'text-yellow-400' : 'text-green-400'
              }`}
            >
              {isActive ? (
                <Award className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="font-semibold text-white">Competition End</div>
              <div className="text-sm text-white/70">
                {endDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                isActive ? 'text-white/40' : 'text-cyan-400'
              }`}
            >
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-white">Prize Distribution</div>
              <div className="text-sm text-white/70">
                Winners will be announced after competition ends
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
