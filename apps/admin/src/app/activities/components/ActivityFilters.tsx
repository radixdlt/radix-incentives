'use client';

import { Filter, Search, X } from 'lucide-react';
import type * as React from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
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
  categories: string[];
  dapps: string[];
  showOnEarnPage: 'all' | 'yes' | 'no';
  ap: 'all' | 'yes' | 'no';
  multiplier: 'all' | 'yes' | 'no';
};

type ActivityFiltersProps = {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  uniqueCategories: string[];
  uniqueDapps: string[];
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
  totalCount: number;
  filteredCount: number;
};

export function ActivityFilters({
  filters,
  setFilters,
  uniqueCategories,
  uniqueDapps,
  hasActiveFilters,
  clearAllFilters,
  totalCount,
  filteredCount,
}: ActivityFiltersProps) {
  return (
    <div className="mb-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Category
              {filters.categories.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.categories.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {uniqueCategories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={filters.categories.includes(category)}
                onCheckedChange={(checked: boolean) => {
                  setFilters((prev) => ({
                    ...prev,
                    categories: checked
                      ? [...prev.categories, category]
                      : prev.categories.filter((c) => c !== category),
                  }));
                }}
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Dapp Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Dapp
              {filters.dapps.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filters.dapps.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by Dapp</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {uniqueDapps.map((dapp) => (
              <DropdownMenuCheckboxItem
                key={dapp}
                checked={filters.dapps.includes(dapp)}
                onCheckedChange={(checked: boolean) => {
                  setFilters((prev) => ({
                    ...prev,
                    dapps: checked
                      ? [...prev.dapps, dapp]
                      : prev.dapps.filter((d) => d !== dapp),
                  }));
                }}
              >
                {dapp}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Show on Earn Page Filter */}
        <Select
          value={filters.showOnEarnPage}
          onValueChange={(value: 'all' | 'yes' | 'no') =>
            setFilters((prev) => ({ ...prev, showOnEarnPage: value }))
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Show on Earn Page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">Show on Earn Page</SelectItem>
            <SelectItem value="no">Hidden</SelectItem>
          </SelectContent>
        </Select>

        {/* AP Filter */}
        <Select
          value={filters.ap}
          onValueChange={(value: 'all' | 'yes' | 'no') =>
            setFilters((prev) => ({ ...prev, ap: value }))
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="AP" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">Has AP</SelectItem>
            <SelectItem value="no">No AP</SelectItem>
          </SelectContent>
        </Select>

        {/* Multiplier Filter */}
        <Select
          value={filters.multiplier}
          onValueChange={(value: 'all' | 'yes' | 'no') =>
            setFilters((prev) => ({ ...prev, multiplier: value }))
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Multiplier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="yes">Has Multiplier</SelectItem>
            <SelectItem value="no">No Multiplier</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <span>
          {filteredCount} of {totalCount} activities
        </span>
        {hasActiveFilters && <span className="text-primary">(filtered)</span>}
      </div>
    </div>
  );
}
