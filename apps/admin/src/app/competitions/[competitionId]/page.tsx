'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageContainer, PageHeader } from '~/components/ui/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { api } from '~/trpc/react';
import { CompetitionActions } from './components/CompetitionActions';
import { CompetitionDetails } from './components/CompetitionDetails';
import { ParticipantsList } from './components/ParticipantsList';
import { WinnersList } from './components/WinnersList';

export default function CompetitionPage() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const router = useRouter();
  const utils = api.useUtils();

  const { data: competition, isLoading: isLoadingCompetition } =
    api.competition.getCompetitionById.useQuery({
      id: competitionId,
    });

  const drawWinners = api.competition.drawCompetitionWinners.useMutation({
    onSuccess: () => {
      toast.success('Winners drawn successfully!');
      utils.competition.getCompetitionById.invalidate({ id: competitionId });
      utils.competition.listCompetitionWinners.invalidate({ competitionId });
    },
    onError: (error) => {
      toast.error(`Failed to draw winners: ${error.message}`);
    },
  });

  const deleteCompetition = api.competition.deleteCompetition.useMutation({
    onSuccess: () => {
      toast.success('Competition deleted successfully!');
      router.push('/competitions');
      utils.competition.listCompetitions.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete competition: ${error.message}`);
    },
  });

  const expireParticipants =
    api.competition.expireCompetitionParticipants.useMutation({
      onSuccess: () => {
        toast.success('Participants expired successfully!');
        utils.competition.listParticipants.invalidate({ competitionId });
        utils.competition.listCompetitionWinners.invalidate({ competitionId });
      },
      onError: (error) => {
        toast.error(`Failed to expire participants: ${error.message}`);
      },
    });

  const { data: participants } = api.competition.listParticipants.useQuery({
    competitionId,
  });

  const { data: winners } = api.competition.listCompetitionWinners.useQuery({
    competitionId,
  });

  return (
    <PageContainer>
      <PageHeader
        loading={isLoadingCompetition}
        title={`${competition?.name}`}
        description={`${competition?.description}`}
        backButton
      >
        <CompetitionActions
          onEdit={() => router.push(`/competitions/${competitionId}/edit`)}
          onDrawWinners={() => drawWinners.mutate({ competitionId })}
          onDelete={() => deleteCompetition.mutate({ competitionId })}
          onExpireParticipants={() =>
            expireParticipants.mutate({ competitionId })
          }
        />
      </PageHeader>
      {competition && <CompetitionDetails competition={competition} />}

      <Tabs defaultValue="participants" className="mt-4">
        <TabsList>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="winners">Winners</TabsTrigger>
        </TabsList>
        <TabsContent value="participants">
          <ParticipantsList participants={participants ?? []} />
        </TabsContent>
        <TabsContent value="winners">
          <WinnersList winners={winners ?? []} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
