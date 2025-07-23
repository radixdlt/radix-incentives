'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import type { Week } from 'db/incentives';

type SortField = 'startDate' | 'endDate' | 'processed';
type SortOrder = 'asc' | 'desc';

interface WeeksTableProps {
  weeks: Week[] | undefined;
  onWeekRowClick: (weekId: string) => void;
}

export const WeeksTable: React.FC<WeeksTableProps> = ({
  weeks,
  onWeekRowClick,
}) => {
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedWeeks = useMemo(() => {
    if (!weeks) return [];
    
    return [...weeks].sort((a, b) => {
      let aValue: Date | number;
      let bValue: Date | number;
      
      switch (sortField) {
        case 'startDate':
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        case 'endDate':
          aValue = new Date(a.endDate);
          bValue = new Date(b.endDate);
          break;
        case 'processed':
          aValue = a.processed ? 1 : 0;
          bValue = b.processed ? 1 : 0;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [weeks, sortField, sortOrder]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };
  return (
    <div className="border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="border-r p-0">
              <Button
                variant="ghost"
                className="w-full h-full justify-between rounded-none font-semibold hover:bg-muted/50"
                onClick={() => handleSort('startDate')}
              >
                Start Date
                {getSortIcon('startDate')}
              </Button>
            </TableHead>
            <TableHead className="border-r p-0">
              <Button
                variant="ghost"
                className="w-full h-full justify-between rounded-none font-semibold hover:bg-muted/50"
                onClick={() => handleSort('endDate')}
              >
                End Date
                {getSortIcon('endDate')}
              </Button>
            </TableHead>
            <TableHead className="border-r p-0">
              <Button
                variant="ghost"
                className="w-full h-full justify-between rounded-none font-semibold hover:bg-muted/50"
                onClick={() => handleSort('processed')}
              >
                Processed
                {getSortIcon('processed')}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedWeeks && sortedWeeks.length > 0 ? (
            sortedWeeks.map((week) => (
              <TableRow
                key={week.id}
                className="cursor-pointer hover:bg-muted/50 border-b"
              >
                <TableCell
                  className="border-r"
                  onClick={() => onWeekRowClick(week.id)}
                >
                  {new Date(week.startDate).toISOString()}
                </TableCell>
                <TableCell
                  className="border-r"
                  onClick={() => onWeekRowClick(week.id)}
                >
                  {new Date(week.endDate).toISOString()}
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
