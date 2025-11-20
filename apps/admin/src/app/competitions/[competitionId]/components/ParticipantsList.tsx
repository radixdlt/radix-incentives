'use client';

import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import type { RouterOutputs } from '~/trpc/react';

type ParticipantsListProps = {
  participants: RouterOutputs['competition']['listParticipants'];
};

export const ParticipantsList = ({ participants }: ParticipantsListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Entered at</TableHead>
          <TableHead>Expired</TableHead>
          <TableHead>Claimed at</TableHead>
          <TableHead>Is winner</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map((participant) => (
          <TableRow key={participant.userId}>
            <TableCell>{participant.userId}</TableCell>
            <TableCell>
              {format(new Date(participant.createdAt), 'PPP')}
            </TableCell>
            <TableCell>{participant.expired ? 'Yes' : 'No'}</TableCell>
            <TableCell>
              {participant.claimedAt
                ? format(new Date(participant.claimedAt), 'PPP')
                : 'Not claimed'}
            </TableCell>
            <TableCell>{participant.isWinner ? 'Yes' : 'No'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
