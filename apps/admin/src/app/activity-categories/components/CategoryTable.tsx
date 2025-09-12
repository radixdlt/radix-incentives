import { ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import Image from 'next/image';
import type * as React from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { InlineNameEdit } from './InlineNameEdit';

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

type CategoryTableProps = {
  categories: Category[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onRowClick: (categoryId: string) => void;
  editingId: string | null;
  editingName: string;
  onStartEdit: (category: Category, e: React.MouseEvent) => void;
  onSaveEdit: (category: Category) => void;
  onCancelEdit: () => void;
  onNameChange: (name: string) => void;
  searchTerm: string;
};

export const CategoryTable = ({
  categories,
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
}: CategoryTableProps) => {
  const highlightText = (text: string, search: string) => {
    if (!search) return text;

    const regex = new RegExp(`(${search})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts
          .filter((part) => part.length > 0)
          .map((part) =>
            part.toLowerCase() === search.toLowerCase() ? (
              <mark
                key={`highlight-${part}-${Math.random()}`}
                className="bg-yellow-200 dark:bg-yellow-800"
              >
                {part}
              </mark>
            ) : (
              <span key={`text-${part}-${Math.random()}`}>{part}</span>
            ),
          )}
      </>
    );
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSort(field)}
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      <span className="flex items-center gap-1">
        {children}
        {sortField === field &&
          (sortDirection === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          ))}
      </span>
    </Button>
  );

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="w-32">
              <SortButton field="id">ID</SortButton>
            </TableHead>
            <TableHead className="min-w-48">
              <SortButton field="name">Name</SortButton>
            </TableHead>
            <TableHead className="min-w-64">
              <SortButton field="description">Description</SortButton>
            </TableHead>
            <TableHead className="w-24 text-center">
              <SortButton field="multiplier">Multiplier</SortButton>
            </TableHead>
            <TableHead className="w-24 text-center">
              <SortButton field="showOnEarnPage">Earn Page</SortButton>
            </TableHead>
            <TableHead className="w-32">
              <SortButton field="dappCount">dApps</SortButton>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length > 0 ? (
            categories.map((category) => (
              <TableRow
                key={category.id}
                className="cursor-pointer border-b hover:bg-muted/50"
                onClick={() => onRowClick(category.id)}
              >
                <TableCell className="font-mono text-xs">
                  {highlightText(category.id, searchTerm)}
                </TableCell>

                <TableCell>
                  {editingId === category.id ? (
                    <InlineNameEdit
                      value={editingName}
                      onChange={onNameChange}
                      onSave={() => onSaveEdit(category)}
                      onCancel={onCancelEdit}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{highlightText(category.name, searchTerm)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => onStartEdit(category, e)}
                        className="inline-edit h-6 w-6 p-0 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  <div className="max-w-md truncate text-muted-foreground text-sm">
                    {category.description
                      ? highlightText(category.description, searchTerm)
                      : '-'}
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  {category.multiplier ? (
                    <Badge variant="default" className="text-xs">
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      No
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-center">
                  {category.showOnEarnPage ? (
                    <Badge variant="default" className="text-xs">
                      Shown
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Hidden
                    </Badge>
                  )}
                </TableCell>

                <TableCell>
                  {category.dapps && category.dapps.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="-space-x-1 flex">
                        {category.dapps.slice(0, 3).map((dapp) => (
                          <div
                            key={dapp.id}
                            className="relative h-6 w-6 overflow-hidden rounded-full border bg-white"
                            title={dapp.name}
                          >
                            {dapp.logoFileName ? (
                              <Image
                                src={`/dapp-logos/${dapp.logoFileName}`}
                                alt={`${dapp.name} logo`}
                                fill
                                className="object-contain"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gray-100 font-medium text-gray-500 text-xs">
                                {dapp.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {category.dapps.length > 3 && (
                        <span className="text-muted-foreground text-xs">
                          +{category.dapps.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">None</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No categories found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
