'use client';

import { Award, Medal, Star, Trophy } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { cn } from '~/lib/utils';

type Mission = {
  id: string;
  name: string;
  description: string;
  threshold: number;
  achieved: boolean;
  icon: 'star' | 'trophy' | 'medal' | 'award';
  color: string;
};

type MissionModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  userInvestment: number;
  missions: Mission[];
};

const getMissionIcon = (icon: Mission['icon'], _achieved: boolean) => {
  const iconClasses = 'h-5 w-5';

  switch (icon) {
    case 'star':
      return <Star className={iconClasses} />;
    case 'trophy':
      return <Trophy className={iconClasses} />;
    case 'medal':
      return <Medal className={iconClasses} />;
    case 'award':
      return <Award className={iconClasses} />;
    default:
      return <Star className={iconClasses} />;
  }
};

const formatCurrency = (value: number) => {
  if (value === 0) return '$0';
  if (value < 0.01) return '<$0.01';
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function MissionModal({
  isOpen,
  onOpenChange,
  categoryName,
  userInvestment,
  missions,
}: MissionModalProps) {
  const completedMissions = missions.filter((m) => m.achieved).length;
  const totalMissions = missions.length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[500px]">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <DialogTitle className="text-center font-bold text-xl">
            {categoryName}
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Complete missions to unlock achievements
          </DialogDescription>
          <div className="mt-3 flex items-center justify-center gap-1">
            {missions.map((mission) => (
              <Star
                key={mission.id}
                className={cn(
                  'h-5 w-5',
                  mission.achieved
                    ? 'fill-cyan-400 text-cyan-400'
                    : 'text-gray-300',
                )}
              />
            ))}
            <span className="ml-2 text-muted-foreground text-sm">
              {completedMissions} of {totalMissions}
            </span>
          </div>
        </DialogHeader>

        <div className="no-scrollbar flex-grow overflow-y-auto rounded-xl bg-transparent">
          {/* Mission List */}
          <div className="space-y-4 pt-2">
            {missions.map((mission) => (
              <Card
                key={mission.id}
                className={cn(
                  'border-white/10 bg-transparent backdrop-blur-none transition-none',
                  mission.achieved ? 'border-2 border-cyan-400/50' : 'border',
                )}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'rounded-lg p-2',
                        mission.achieved
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : 'bg-black/30 text-gray-300',
                      )}
                    >
                      {getMissionIcon(mission.icon, mission.achieved)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{mission.name}</CardTitle>
                      {mission.achieved && (
                        <Badge className="gradient-brand mt-1 border-0 text-white">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="mb-4 text-sm">
                    {mission.description}
                  </CardDescription>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Target:</span>
                      <span className="font-medium text-white">
                        {formatCurrency(mission.threshold)}
                      </span>
                    </div>
                    {!mission.achieved && userInvestment > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">
                            Progress:
                          </span>
                          <span className="font-medium text-white">
                            {Math.min(
                              100,
                              Math.round(
                                (userInvestment / mission.threshold) * 100,
                              ),
                            )}
                            %
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/20">
                          <div
                            className="gradient-brand h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (userInvestment / mission.threshold) * 100)}%`,
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
