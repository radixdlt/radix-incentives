'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { useUploadActivityCsv } from '~/lib/hooks/useUploadActivityCsv';
import { api } from '~/trpc/react';
import { ActivityFilters, ActivityTable, type FilterState } from './components';

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

type ActivityData = {
  showOnEarnPage?: boolean;
  ap?: boolean;
  multiplier?: boolean;
};

type Activity = {
  id: string;
  name?: string | null;
  description?: string | null;
  category: string;
  dapp?: string | null;
  componentAddresses: unknown;
  data: unknown;
};

const FILTER_STORAGE_KEY = 'activities-filters';

function ManageActivitiesPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: activitiesData } = api.activity.getActivities.useQuery();
  const [sortField, setSortField] = React.useState<SortField>('name');
  const [sortDirection, setSortDirection] =
    React.useState<SortDirection>('asc');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState<string>('');
  const { upload } = useUploadActivityCsv();

  const inputRef = React.useRef<HTMLInputElement>(null);

  const updateActivityMutation = api.activity.updateActivity.useMutation({
    onSuccess: () => {
      utils.activity.getActivities.invalidate();
      setEditingId(null);
    },
  });

  // Initialize filters with default values first
  const [filters, setFilters] = React.useState<FilterState>({
    search: '',
    categories: [],
    dapps: [],
    showOnEarnPage: 'all',
    ap: 'all',
    multiplier: 'all',
  });

  const [filtersLoaded, setFiltersLoaded] = React.useState(false);

  // Load filters from localStorage after hydration
  React.useEffect(() => {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    if (saved) {
      try {
        const parsedFilters = JSON.parse(saved);
        // Ensure all properties are defined with proper defaults
        setFilters({
          search: parsedFilters.search || '',
          categories: parsedFilters.categories || [],
          dapps: parsedFilters.dapps || [],
          showOnEarnPage: parsedFilters.showOnEarnPage || 'all',
          ap: parsedFilters.ap || 'all',
          multiplier: parsedFilters.multiplier || 'all',
        });
      } catch {
        // If parsing fails, keep default values
      }
    }
    setFiltersLoaded(true);
  }, []);

  // Save filters to localStorage when they change (but only after initial load)
  React.useEffect(() => {
    if (filtersLoaded) {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    }
  }, [filters, filtersLoaded]);

  // Extract unique categories and dapps for filter options
  const uniqueCategories = React.useMemo(() => {
    if (!activitiesData) return [];
    return [...new Set(activitiesData.map((a) => a.category))].sort();
  }, [activitiesData]);

  const uniqueDapps = React.useMemo(() => {
    if (!activitiesData) return [];
    return [
      ...new Set(activitiesData.map((a) => a.dapp).filter(Boolean) as string[]),
    ].sort();
  }, [activitiesData]);

  const handleRowClick = (activityId: string, e?: React.MouseEvent) => {
    // Don't navigate if clicking on the edit button or input
    if (e && (e.target as HTMLElement).closest('.inline-edit')) {
      return;
    }
    router.push(`/activities/${activityId}`);
  };

  const startEditing = (activity: Activity, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(activity.id);
    setEditingName(activity.name || '');
  };

  const saveEdit = async (activity: Activity) => {
    const activityData = activity.data as ActivityData;
    await updateActivityMutation.mutateAsync({
      id: activity.id,
      activity: {
        name: editingName,
        description: activity.description ?? undefined,
        category: activity.category,
        dapp: activity.dapp ?? undefined,
        componentAddresses: activity.componentAddresses as string[],
        data: {
          showOnEarnPage: activityData?.showOnEarnPage ?? true,
          ap: activityData?.ap ?? false,
          multiplier: activityData?.multiplier ?? false,
        },
      },
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedActivities = React.useMemo(() => {
    if (!activitiesData) return [];

    // Filter activities based on search term and filters
    const filtered = activitiesData.filter((activity) => {
      // Search filter
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        activity.id?.toLowerCase()?.includes(searchLower) ||
        activity.name?.toLowerCase()?.includes(searchLower) ||
        activity.description?.toLowerCase()?.includes(searchLower) ||
        activity.category?.toLowerCase()?.includes(searchLower) ||
        activity.dapp?.toLowerCase()?.includes(searchLower);

      if (!matchesSearch) return false;

      // Category filter
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(activity.category)
      ) {
        return false;
      }

      // Dapp filter
      if (
        filters.dapps.length > 0 &&
        activity.dapp &&
        !filters.dapps.includes(activity.dapp)
      ) {
        return false;
      }

      // Show on earn page filter
      const showOnEarnPage =
        (activity.data as { showOnEarnPage?: boolean })?.showOnEarnPage ?? true;
      if (filters.showOnEarnPage === 'yes' && !showOnEarnPage) return false;
      if (filters.showOnEarnPage === 'no' && showOnEarnPage) return false;

      // AP filter
      const ap = (activity.data as { ap?: boolean })?.ap ?? false;
      if (filters.ap === 'yes' && !ap) return false;
      if (filters.ap === 'no' && ap) return false;

      // Multiplier filter
      const multiplier =
        (activity.data as { multiplier?: boolean })?.multiplier ?? false;
      if (filters.multiplier === 'yes' && !multiplier) return false;
      if (filters.multiplier === 'no' && multiplier) return false;

      return true;
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
        case 'componentAddresses':
          aValue =
            (a.componentAddresses as string[])?.length?.toString() || '0';
          bValue =
            (b.componentAddresses as string[])?.length?.toString() || '0';
          break;
        case 'showOnEarnPage':
          aValue =
            ((a.data as { showOnEarnPage?: boolean })?.showOnEarnPage ?? true)
              ? 'true'
              : 'false';
          bValue =
            ((b.data as { showOnEarnPage?: boolean })?.showOnEarnPage ?? true)
              ? 'true'
              : 'false';
          break;
        case 'ap':
          aValue =
            ((a.data as { ap?: boolean })?.ap ?? false) ? 'true' : 'false';
          bValue =
            ((b.data as { ap?: boolean })?.ap ?? false) ? 'true' : 'false';
          break;
        case 'multiplier':
          aValue =
            ((a.data as { multiplier?: boolean })?.multiplier ?? false)
              ? 'true'
              : 'false';
          bValue =
            ((b.data as { multiplier?: boolean })?.multiplier ?? false)
              ? 'true'
              : 'false';
          break;
      }

      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [activitiesData, sortField, sortDirection, filters]);

  const hasActiveFilters = React.useMemo(() => {
    return (
      filters.search !== '' ||
      filters.categories.length > 0 ||
      filters.dapps.length > 0 ||
      filters.showOnEarnPage !== 'all' ||
      filters.ap !== 'all' ||
      filters.multiplier !== 'all'
    );
  }, [filters]);

  const clearAllFilters = () => {
    setFilters({
      search: '',
      categories: [],
      dapps: [],
      showOnEarnPage: 'all',
      ap: 'all',
      multiplier: 'all',
    });
  };

  return (
    <div className="container mx-auto py-6 pr-6 pl-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">
              Manage Activities
            </h1>
            <p className="text-muted-foreground">
              Configure activities that participants can earn points or
              multipliers for.
            </p>
          </div>
        </div>
        <Button onClick={() => inputRef.current?.click()}>Upload CSV</Button>
      </div>

      <Separator className="my-6" />

      {/* Filters */}
      <ActivityFilters
        filters={filters}
        setFilters={setFilters}
        uniqueCategories={uniqueCategories}
        uniqueDapps={uniqueDapps}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
        totalCount={activitiesData?.length || 0}
        filteredCount={filteredAndSortedActivities.length}
      />

      {/* Activities Table */}
      <ActivityTable
        activities={filteredAndSortedActivities}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={handleRowClick}
        editingId={editingId}
        editingName={editingName}
        onStartEdit={startEditing}
        onSaveEdit={saveEdit}
        onCancelEdit={cancelEdit}
        onNameChange={setEditingName}
        searchTerm={filters.search}
      />

      <input
        title="Upload CSV"
        className="hidden"
        type="file"
        accept=".csv,text/csv"
        onChange={async (event) =>
          await upload(event.target.files ?? new FileList())
        }
        ref={inputRef}
      />
    </div>
  );
}

export default ManageActivitiesPage;
