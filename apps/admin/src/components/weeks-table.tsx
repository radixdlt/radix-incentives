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
import type { Week } from 'db/incentives';

interface WeeksTableProps {
  weeks: Week[] | undefined;
  onWeekRowClick: (weekId: string) => void;
}

export const WeeksTable: React.FC<WeeksTableProps> = ({
  weeks,
  onWeekRowClick,
}) => {
  return (
    <div className="border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="border-r">ID</TableHead>
            <TableHead className="border-r">Start Date</TableHead>
            <TableHead className="border-r">End Date</TableHead>
            <TableHead className="border-r">Processed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {weeks && weeks.length > 0 ? (
            weeks.map((week) => (
              <TableRow
                key={week.id}
                className="cursor-pointer hover:bg-muted/50 border-b"
              >
                <TableCell
                  className="font-medium border-r"
                  onClick={() => onWeekRowClick(week.id)}
                >
                  {week.id}
                </TableCell>

                <TableCell
                  className="border-r"
                  onClick={() => onWeekRowClick(week.id)}
                >
                  {format(week.startDate, 'PPP')}
                </TableCell>
                <TableCell
                  className="border-r"
                  onClick={() => onWeekRowClick(week.id)}
                >
                  {format(week.endDate, 'PPP')}
                </TableCell>
                <TableCell
                  className="border-r"
                  onClick={() => onWeekRowClick(week.id)}
                >
                  {week.processed ? 'Yes' : 'No'}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="border-b">
              <TableCell colSpan={5} className="h-24 text-center">
                No weeks defined for this season yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
