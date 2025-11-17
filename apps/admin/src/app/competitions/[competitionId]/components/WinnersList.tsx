'use client';

import { format } from 'date-fns';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import type { RouterOutputs } from '~/trpc/react';

type WinnersListProps = {
  winners: RouterOutputs['competition']['listCompetitionWinners'];
};

export const WinnersList = ({ winners }: WinnersListProps) => {
  const sortedWinners = [...winners].sort((a, b) => {
    if (!a.claimedAt && !b.claimedAt) return 0;
    if (!a.claimedAt) return 1;
    if (!b.claimedAt) return -1;
    return new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime();
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Claimed reward at</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedWinners.map((winner) => (
          <TableRow key={winner.userId}>
            <TableCell>
              <Link
                href={`/users/${winner.userId}`}
                className="text-primary hover:underline"
              >
                {winner.userId}
              </Link>
            </TableCell>
            <TableCell>
              {winner.claimedAt
                ? format(new Date(winner.claimedAt), 'PPP')
                : 'Not claimed'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
