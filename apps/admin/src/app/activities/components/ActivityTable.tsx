'use client';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type * as React from 'react';
import { Badge } from '~/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { InlineNameEdit } from './InlineNameEdit';

type Activity = {
  id: string;
  name?: string | null;
  description?: string | null;
  category: string;
  dapp?: string | null;
  componentAddresses: unknown;
  data: unknown;
};

type SortField =
  | 'id'
  | 'name'
  | 'description'
  | 'category'
  | 'dapp'
  | 'componentAddresses'
  | 'showOnEarnPage'
  | 'ap'
  | 'multiplier';

type SortDirection = 'asc' | 'desc';

type ActivityTableProps = {
  activities: Activity[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onRowClick: (activityId: string, e?: React.MouseEvent) => void;
  editingId: string | null;
  editingName: string;
  onStartEdit: (activity: Activity, e: React.MouseEvent) => void;
  onSaveEdit: (activity: Activity) => void;
  onCancelEdit: () => void;
  onNameChange: (name: string) => void;
  searchTerm: string;
};

export function ActivityTable({
  activities,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  editingId,
  editingName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onNameChange,
  searchTerm,
}: ActivityTableProps) {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer border-r hover:bg-muted/50"
              onClick={() => onSort('id')}
            >
              <div className="flex items-center">
                ID
                {getSortIcon('id')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer border-r hover:bg-muted/50"
              onClick={() => onSort('name')}
            >
              <div className="flex items-center">
                Name
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer border-r hover:bg-muted/50"
              onClick={() => onSort('description')}
            >
              <div className="flex items-center">
                Description
                {getSortIcon('description')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer border-r hover:bg-muted/50"
              onClick={() => onSort('category')}
            >
              <div className="flex items-center">
                Category
                {getSortIcon('category')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer border-r hover:bg-muted/50"
              onClick={() => onSort('dapp')}
            >
              <div className="flex items-center">
                Dapp
                {getSortIcon('dapp')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer border-r hover:bg-muted/50"
              onClick={() => onSort('componentAddresses')}
            >
              <div className="flex items-center">
                Component Addresses
                {getSortIcon('componentAddresses')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer border-r hover:bg-muted/50"
              onClick={() => onSort('showOnEarnPage')}
            >
              <div className="flex items-center">
                Show on Earn Page
                {getSortIcon('showOnEarnPage')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer border-r hover:bg-muted/50"
              onClick={() => onSort('ap')}
            >
              <div className="flex items-center">
                AP
                {getSortIcon('ap')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onSort('multiplier')}
            >
              <div className="flex items-center">
                Multiplier
                {getSortIcon('multiplier')}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.length > 0 ? (
            activities.map((activity) => (
              <TableRow
                key={activity.id}
                onClick={(e) => onRowClick(activity.id, e)}
                className="cursor-pointer hover:bg-muted/50"
              >
                <TableCell className="w-1 border-r font-medium">
                  {activity.id}
                </TableCell>
                <TableCell className="border-r font-medium">
                  <InlineNameEdit
                    activity={activity}
                    isEditing={editingId === activity.id}
                    editingName={editingName}
                    onStartEdit={(e) => onStartEdit(activity, e)}
                    onSave={() => onSaveEdit(activity)}
                    onCancel={onCancelEdit}
                    onNameChange={onNameChange}
                  />
                </TableCell>
                <TableCell className="max-w-md border-r">
                  <div className="truncate">{activity.description}</div>
                </TableCell>
                <TableCell className="border-r">
                  <Badge variant="outline">{activity.category}</Badge>
                </TableCell>
                <TableCell className="border-r">
                  {activity.dapp || '-'}
                </TableCell>
                <TableCell className="max-w-xs border-r">
                  <div className="space-y-1">
                    {(activity.componentAddresses as string[])?.length > 0
                      ? (activity.componentAddresses as string[]).map(
                          (address) => (
                            <div
                              key={address}
                              className="truncate font-mono text-xs"
                              title={address}
                            >
                              {address}
                            </div>
                          ),
                        )
                      : '-'}
                  </div>
                </TableCell>
                <TableCell className="border-r">
                  <Badge
                    variant={
                      ((activity.data as { showOnEarnPage?: boolean })
                        ?.showOnEarnPage ?? true)
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {((activity.data as { showOnEarnPage?: boolean })
                      ?.showOnEarnPage ?? true)
                      ? 'Yes'
                      : 'No'}
                  </Badge>
                </TableCell>
                <TableCell className="border-r">
                  <Badge
                    variant={
                      ((activity.data as { ap?: boolean })?.ap ?? false)
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {((activity.data as { ap?: boolean })?.ap ?? false)
                      ? 'Yes'
                      : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      ((activity.data as { multiplier?: boolean })
                        ?.multiplier ?? false)
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {((activity.data as { multiplier?: boolean })
                      ?.multiplier ?? false)
                      ? 'Yes'
                      : 'No'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                {searchTerm
                  ? 'No activities found matching your search.'
                  : 'No activities defined yet.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}