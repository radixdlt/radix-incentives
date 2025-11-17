'use client';

import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { PageContainer, PageHeader } from '~/components/ui/page';
import { api } from '~/trpc/react';
import { CompetitionList } from './components/CompetitionList';

export default function CompetitionsPage() {
  const { data: competitions } = api.competition.listCompetitions.useQuery();

  return (
    <PageContainer>
      <PageHeader title="Competitions" description="Manage competitions">
        <Button>
          <Link href="/competitions/create">Create Competition</Link>
        </Button>
      </PageHeader>
      <CompetitionList competitions={competitions ?? []} />
    </PageContainer>
  );
}
