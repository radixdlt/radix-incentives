'use client';

import { Plus } from 'lucide-react';
import * as React from 'react';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { api } from '~/trpc/react';
import {
  CategoryFilters,
  CategoryTable,
  CreateCategoryDialog,
  EditCategoryDialog,
  type FilterState,
} from './components';

type SortField =
  | 'id'
  | 'name'
  | 'description'
  | 'multiplier'
  | 'showOnEarnPage'
  | 'dappCount';
type SortDirection = 'asc' | 'desc';

type Category = {
  id: string;
  name: string;
  description?: string | null;
  multiplier: boolean;
  showOnEarnPage: boolean;
  dappIds: string[];
  dapps?: Array<{
    id: string;
    name: string;
    website: string;
    logoFileName: string | null;
  }>;
};

const FILTER_STORAGE_KEY = 'activity-categories-filters';

function ManageActivityCategoriesPage() {
  const utils = api.useUtils();
  const { data: categoriesData } = api.admin.getActivityCategories.useQuery();
  const { data: dappsData } = api.admin.getDapps.useQuery();

  const [sortField, setSortField] = React.useState<SortField>('name');
  const [sortDirection, setSortDirection] =
    React.useState<SortDirection>('asc');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [selectedCategory, setSelectedCategory] =
    React.useState<Category | null>(null);

  // Initialize filters with default values first
  const [filters, setFilters] = React.useState<FilterState>({
    search: '',
    multiplier: 'all',
    showOnEarnPage: 'all',
  });

  const [filtersLoaded, setFiltersLoaded] = React.useState(false);

  // Load filters from localStorage after hydration
  React.useEffect(() => {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    if (saved) {
      try {
        const parsedFilters = JSON.parse(saved);
        setFilters({
          search: parsedFilters.search || '',
          multiplier: parsedFilters.multiplier || 'all',
          showOnEarnPage: parsedFilters.showOnEarnPage || 'all',
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

  const updateCategoryMutation = api.admin.updateActivityCategory.useMutation({
    onSuccess: () => {
      utils.admin.getActivityCategories.invalidate();
      setEditingId(null);
    },
  });

  const handleRowClick = (categoryId: string) => {
    const category = categoriesData?.find((cat) => cat.id === categoryId);
    if (category) {
      setSelectedCategory(category);
      setShowEditDialog(true);
    }
  };

  const startEditing = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(category.id);
    setEditingName(category.name || '');
  };

  const saveEdit = async (category: Category) => {
    await updateCategoryMutation.mutateAsync({
      id: category.id,
      name: editingName,
      description: category.description,
      multiplier: category.multiplier,
      dappIds: category.dappIds,
      showOnEarnPage: category.showOnEarnPage,
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

  const filteredAndSortedCategories = React.useMemo(() => {
    if (!categoriesData) return [];

    // Filter categories based on search term and filters
    const filtered = categoriesData.filter((category) => {
      // Search filter
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        category.id?.toLowerCase()?.includes(searchLower) ||
        category.name?.toLowerCase()?.includes(searchLower) ||
        category.description?.toLowerCase()?.includes(searchLower);

      if (!matchesSearch) return false;

      // Multiplier filter
      if (filters.multiplier === 'yes' && !category.multiplier) return false;
      if (filters.multiplier === 'no' && category.multiplier) return false;

      // Show on earn page filter
      if (filters.showOnEarnPage === 'yes' && !category.showOnEarnPage)
        return false;
      if (filters.showOnEarnPage === 'no' && category.showOnEarnPage)
        return false;

      return true;
    });

    // Sort filtered categories
    return filtered.sort((a, b) => {
      let aValue = '';
      let bValue = '';

      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'description':
          aValue = a.description || '';
          bValue = b.description || '';
          break;
        case 'multiplier':
          aValue = a.multiplier ? 'true' : 'false';
          bValue = b.multiplier ? 'true' : 'false';
          break;
        case 'showOnEarnPage':
          aValue = a.showOnEarnPage ? 'true' : 'false';
          bValue = b.showOnEarnPage ? 'true' : 'false';
          break;
        case 'dappCount':
          aValue = (a.dapps?.length || 0).toString();
          bValue = (b.dapps?.length || 0).toString();
          break;
      }

      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [categoriesData, sortField, sortDirection, filters]);

  const hasActiveFilters = React.useMemo(() => {
    return (
      filters.search !== '' ||
      filters.multiplier !== 'all' ||
      filters.showOnEarnPage !== 'all'
    );
  }, [filters]);

  const clearAllFilters = () => {
    setFilters({
      search: '',
      multiplier: 'all',
      showOnEarnPage: 'all',
    });
  };

  return (
    <div className="container mx-auto py-6 pr-6 pl-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">
              Manage Activity Categories
            </h1>
            <p className="text-muted-foreground">
              Configure activity categories that appear on the Earn page and
              their settings.
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Category
        </Button>
      </div>

      <Separator className="my-6" />

      {/* Filters */}
      <CategoryFilters
        filters={filters}
        setFilters={setFilters}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
        totalCount={categoriesData?.length || 0}
        filteredCount={filteredAndSortedCategories.length}
      />

      {/* Categories Table */}
      <CategoryTable
        categories={filteredAndSortedCategories}
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

      {/* Create Category Dialog */}
      <CreateCategoryDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        dapps={dappsData || []}
        onSuccess={() => {
          utils.admin.getActivityCategories.invalidate();
          setShowCreateDialog(false);
        }}
      />

      {/* Edit Category Dialog */}
      <EditCategoryDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        category={selectedCategory}
        dapps={dappsData || []}
        onSuccess={() => {
          utils.admin.getActivityCategories.invalidate();
          setShowEditDialog(false);
          setSelectedCategory(null);
        }}
      />
    </div>
  );
}

export default ManageActivityCategoriesPage;
