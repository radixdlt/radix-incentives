'use client';

import { toast } from 'sonner';
import { Spinner } from '~/components/ui/spinner';
import { usePersona } from '~/lib/hooks/usePersona';
import { api } from '~/trpc/react';
import {
  ClaimPrizeCard,
  CompetitionHero,
  HowToWinCard,
  PrizeDetailsCard,
  TermsAndConditionsCard,
  TimelineCard,
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

  // Get current week for user's XRD balance
  const { data: weeks } = api.week.getWeeks.useQuery(undefined, {
    enabled: isConnected,
  });

  const currentWeek = weeks?.[0]; // Most recent week

  // Get user's capital at work for maintainXrdBalance
  const { data: capitalAtWork, isLoading: isCapitalLoading } =
    api.user.getUserCapitalAtWork.useQuery(
      {
        weekId: currentWeek?.id ?? '',
      },
      {
        enabled: !!currentWeek?.id && isConnected && isInitialized,
      },
    );

  if (isCompetitionLoading || !competition) return <Spinner />;

  // Competition details from API
  const competitionStartDate = competition.startDate;
  const competitionEndDate = competition.endDate;
  const isCompetitionActive = Date.now() < competitionEndDate.getTime();
  const prizeCount = competition.prizeCount;
  const isWinner = !!participantData?.isWinner;
  const hasClaimedPrize = !!participantData?.claimedAt;
  const isParticipant = !!participantData;

  // Extract maintainXrdBalance value from capital at work
  const xrdBalanceData = capitalAtWork?.find(
    (cat) => cat.categoryId === 'maintainXrdBalance',
  );
  const xrdBalance = xrdBalanceData
    ? `$${Number.parseFloat(xrdBalanceData.capitalAtWork).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '$0.00';

  const handleJoinCompetition = () => {
    if (!competition?.id) return;
    addCompetitionParticipant({ competitionId: competition.id });
  };

  return (
    <div className="space-y-6">
      <CompetitionHero
        prizeCount={prizeCount}
        isActive={isCompetitionActive}
        xrdBalance={xrdBalance}
        showXrdHoldings={isConnected && isInitialized}
        onParticipate={
          isInitialized && persona && isCompetitionActive
            ? handleJoinCompetition
            : undefined
        }
        isParticipating={isJoiningCompetition}
        isParticipant={isParticipant}
        isLoading={isParticipantLoading || isCapitalLoading}
      />

      {isInitialized &&
        persona &&
        !isParticipantLoading &&
        !isCompetitionActive && (
          <ClaimPrizeCard isWinner={isWinner} hasClaimed={hasClaimedPrize} />
        )}

      {/* Timeline and How to Win side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TimelineCard
          startDate={competitionStartDate}
          endDate={competitionEndDate}
          isActive={isCompetitionActive}
        />
        <HowToWinCard />
      </div>

      {/* About the Prize - Full Width */}
      <PrizeDetailsCard />

      {/* Terms and Conditions - Full Width */}
      <TermsAndConditionsCard prizeCount={prizeCount} />
    </div>
  );
}
