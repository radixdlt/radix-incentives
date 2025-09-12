import { X } from 'lucide-react';
import type * as React from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

export type FilterState = {
  search: string;
  multiplier: 'all' | 'yes' | 'no';
  showOnEarnPage: 'all' | 'yes' | 'no';
};

type CategoryFiltersProps = {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
  totalCount: number;
  filteredCount: number;
};

export const CategoryFilters = ({
  filters,
  setFilters,
  hasActiveFilters,
  clearAllFilters,
  totalCount,
  filteredCount,
}: CategoryFiltersProps) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleMultiplierChange = (value: 'all' | 'yes' | 'no') => {
    setFilters({ ...filters, multiplier: value });
  };

  const handleShowOnEarnPageChange = (value: 'all' | 'yes' | 'no') => {
    setFilters({ ...filters, showOnEarnPage: value });
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search and Filters Row */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="min-w-80 flex-1">
          <Input
            type="text"
            placeholder="Search categories..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>

        {/* Multiplier Filter */}
        <div className="min-w-40">
          <Select
            value={filters.multiplier}
            onValueChange={handleMultiplierChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Multiplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Multiplier</SelectItem>
              <SelectItem value="yes">Has Multiplier</SelectItem>
              <SelectItem value="no">No Multiplier</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Show on Earn Page Filter */}
        <div className="min-w-40">
          <Select
            value={filters.showOnEarnPage}
            onValueChange={handleShowOnEarnPageChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Earn Page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="yes">Show on Earn</SelectItem>
              <SelectItem value="no">Hidden from Earn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="default"
            onClick={clearAllFilters}
            className="whitespace-nowrap"
          >
            <X className="mr-1 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          Showing {filteredCount.toLocaleString()} of{' '}
          {totalCount.toLocaleString()} categories
        </div>

        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="text-xs">
              Search: "{filters.search}"
            </Badge>
          )}
          {filters.multiplier !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Multiplier: {filters.multiplier === 'yes' ? 'Has' : 'No'}
            </Badge>
          )}
          {filters.showOnEarnPage !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Earn Page: {filters.showOnEarnPage === 'yes' ? 'Shown' : 'Hidden'}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
