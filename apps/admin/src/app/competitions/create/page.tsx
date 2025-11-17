'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageContainer, PageHeader } from '~/components/ui/page';
import { api } from '~/trpc/react';
import { CompetitionForm } from '../components/CompetitionForm';

export default function CreateCompetitionPage() {
  const router = useRouter();
  const createCompetition = api.competition.createCompetition.useMutation({
    onSuccess: () => {
      toast.success('Competition created successfully!');
      router.push('/competitions');
    },
    onError: (error) => {
      toast.error(`Failed to create competition: ${error.message}`);
    },
  });

  return (
    <PageContainer>
      <PageHeader
        title="Create Competition"
        description="Create a new competition"
        backButton
      />
      <CompetitionForm onSubmit={createCompetition.mutate} />
    </PageContainer>
  );
}
