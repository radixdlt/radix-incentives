'use client';

import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import type { RouterOutputs } from '~/trpc/react';
import { api } from '~/trpc/react';

type Competition = RouterOutputs['competition']['listCompetitions'][number];

export const CompetitionList = ({
  competitions,
}: {
  competitions: Competition[];
}) => {
  const router = useRouter();
  const [_deletingId, setDeletingId] = useState<string | null>(null);
  const utils = api.useUtils();

  const deleteCompetition = api.competition.deleteCompetition.useMutation({
    onSuccess: () => {
      utils.competition.listCompetitions.invalidate();
      setDeletingId(null);
    },
  });

  const _handleDelete = (competitionId: string) => {
    deleteCompetition.mutate({ competitionId });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Prize Count</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {competitions.map((competition) => (
          <TableRow
            key={competition.id}
            onClick={() => router.push(`/competitions/${competition.id}`)}
          >
            <TableCell className="font-medium">{competition.name}</TableCell>
            <TableCell>{competition.description}</TableCell>
            <TableCell>
              {format(new Date(competition.startDate), 'PPP')}
            </TableCell>
            <TableCell>
              {format(new Date(competition.endDate), 'PPP')}
            </TableCell>
            <TableCell>{competition.prizeCount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
