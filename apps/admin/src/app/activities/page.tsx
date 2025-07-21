'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';
import { Separator } from '~/components/ui/separator';
import { Input } from '~/components/ui/input';
import { api } from '~/trpc/react';

type SortField = 'id' | 'name' | 'description' | 'category' | 'dapp';
type SortDirection = 'asc' | 'desc';

function ManageActivitiesPage() {
  const router = useRouter();
  const { data: activitiesData } = api.activity.getActivities.useQuery();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortField, setSortField] = React.useState<SortField>('name');
  const [sortDirection, setSortDirection] =
    React.useState<SortDirection>('asc');

  const handleRowClick = (activityId: string) => {
    router.push(`/activities/${activityId}`);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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

  const filteredAndSortedActivities = React.useMemo(() => {
    if (!activitiesData) return [];

    // Filter activities based on search term
    const filtered = activitiesData.filter((activity) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        activity.id.toLowerCase().includes(searchLower) ||
        activity.name?.toLowerCase().includes(searchLower) ||
        activity.description?.toLowerCase().includes(searchLower) ||
        activity.category.toLowerCase().includes(searchLower) ||
        activity.dapp?.toLowerCase().includes(searchLower)
      );
    });

    // Sort filtered activities
    return filtered.sort((a, b) => {
      let aValue = '';
      let bValue = '';

      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'name':
          aValue = a.name || a.id;
          bValue = b.name || b.id;
          break;
        case 'description':
          aValue = a.description || '';
          bValue = b.description || '';
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'dapp':
          aValue = a.dapp || '';
          bValue = b.dapp || '';
          break;
      }

      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [activitiesData, searchTerm, sortField, sortDirection]);

  return (
    <div className="container mx-auto py-6 pl-6 pr-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Manage Activities
            </h1>
            <p className="text-muted-foreground">
              Configure activities that participants can earn points or
              multipliers for.
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Search Input */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredAndSortedActivities.length} of {activitiesData?.length || 0}{' '}
          activities
        </div>
      </div>

      {/* Activities Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 border-r"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center">
                  ID
                  {getSortIcon('id')}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 border-r"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  {getSortIcon('name')}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 border-r"
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center">
                  Description
                  {getSortIcon('description')}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 border-r"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center">
                  Category
                  {getSortIcon('category')}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('dapp')}
              >
                <div className="flex items-center">
                  Dapp
                  {getSortIcon('dapp')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedActivities.length > 0 ? (
              filteredAndSortedActivities.map((activity) => (
                <TableRow
                  key={activity.id}
                  onClick={() => handleRowClick(activity.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium w-1 border-r">
                    {activity.id}
                  </TableCell>
                  <TableCell className="font-medium border-r">
                    {activity.name}
                  </TableCell>
                  <TableCell className="max-w-md border-r">
                    <div className="truncate">{activity.description}</div>
                  </TableCell>
                  <TableCell className="border-r">
                    <Badge variant="outline">{activity.category}</Badge>
                  </TableCell>
                  <TableCell>{activity.dapp || '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {searchTerm
                    ? 'No activities found matching your search.'
                    : 'No activities defined yet.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default ManageActivitiesPage;
