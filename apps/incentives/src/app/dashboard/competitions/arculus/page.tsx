'use client';

import { toast } from 'sonner';
import { Spinner } from '~/components/ui/spinner';
import { usePersona } from '~/lib/hooks/usePersona';
import { api } from '~/trpc/react';
import {
  ClaimPrizeCard,
  CompetitionHero,
  EligibilityCard,
  HowToWinCard,
  PrizeDetailsCard,
  TermsAndConditionsCard,
  TimelineCard,
  WinnersCard,
} from './components';

export default function Page() {
  const { persona, isInitialized, isConnected } = usePersona();

  // Get competition details
  const { data: competition, isLoading: isCompetitionLoading } =
    api.competition.getCompetitionBySlug.useQuery({ slug: 'arculus' });

  const utils = api.useUtils();

  const { mutate: addCompetitionParticipant, isPending: isJoiningCompetition } =
    api.competition.addCompetitionParticipant.useMutation({
      onSuccess: () => {
        toast.success('You have joined the competition');
        utils.competition.getCompetitionParticipant.invalidate();
      },
      onError: () => {
        toast.error('Failed to join the competition');
      },
    });

  const { data: participantData, isLoading: isParticipantLoading } =
    api.competition.getCompetitionParticipant.useQuery(
      {
        competitionId: competition?.id ?? '',
      },
      {
        enabled: !!competition?.id && isConnected,
      },
    );

  if (isCompetitionLoading || !competition) return <Spinner />;

  // Competition details from API
  const competitionStartDate = competition.startDate;
  const competitionEndDate = competition.endDate;
  const isCompetitionActive = Date.now() < competitionEndDate.getTime();
  const prizeCount = competition.prizeCount;
  const isWinner = !!participantData?.isWinner;
  const hasClaimedPrice = !!participantData?.claimedAt;
  const isParticipant = !!participantData;

  const handleJoinCompetition = () => {
    if (!competition?.id) return;
    addCompetitionParticipant({ competitionId: competition.id });
  };

  return (
    <div className="space-y-6">
      <CompetitionHero prizeCount={prizeCount} isActive={isCompetitionActive} />

      {isInitialized && persona && !isParticipantLoading && (
        <EligibilityCard
          isParticipant={!!isParticipant}
          onJoin={handleJoinCompetition}
          isLoading={isJoiningCompetition}
          isCompetitionActive={isCompetitionActive}
        />
      )}

      {isInitialized && persona && !isParticipantLoading && (
        <ClaimPrizeCard isWinner={isWinner} hasClaimed={hasClaimedPrice} />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <HowToWinCard />
        <PrizeDetailsCard />
        <TimelineCard
          startDate={competitionStartDate}
          endDate={competitionEndDate}
          isActive={isCompetitionActive}
        />
        <WinnersCard prizeCount={prizeCount} />
      </div>

      <TermsAndConditionsCard prizeCount={prizeCount} />
    </div>
  );
}
