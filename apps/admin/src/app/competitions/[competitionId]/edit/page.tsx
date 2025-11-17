'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageContainer, PageHeader } from '~/components/ui/page';
import { api } from '~/trpc/react';
import { CompetitionForm } from '../../components/CompetitionForm';

export default function EditCompetitionPage() {
  const { competitionId } = useParams<{ competitionId: string }>();
  const router = useRouter();
  const { data: competition } = api.competition.getCompetitionById.useQuery({
    id: competitionId,
  });

  const editCompetition = api.competition.editCompetition.useMutation({
    onSuccess: () => {
      toast.success('Competition updated successfully!');
      router.push(`/competitions/${competitionId}`);
    },
    onError: (error) => {
      toast.error(`Failed to update competition: ${error.message}`);
    },
  });

  return (
    <PageContainer>
      <PageHeader
        title="Edit Competition"
        description="Edit competition details"
        backButton
      />
      {competition && (
        <CompetitionForm
          onSubmit={(values) =>
            editCompetition.mutate({ ...values, id: competitionId })
          }
          defaultValues={competition}
        />
      )}
    </PageContainer>
  );
}
