'use client';

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { api } from '~/trpc/react';

export default function UsersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  const {
    data: response,
    isLoading,
    error,
  } = api.user.getUsersPaginated.useQuery({
    page,
    limit,
  });

  const users = response?.users;
  const totalUsers = response?.total || 0;
  const totalPages = Math.ceil(totalUsers / limit);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (users && users.length === limit) {
      setPage(page + 1);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  };

  const handleUserClick = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <h2 className="mb-2 font-semibold text-destructive">
            Error loading users
          </h2>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl">Users</h1>
          <p className="text-muted-foreground">
            Manage and view all users in the platform
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Show:</span>
          <div className="flex gap-1">
            {[10, 25, 50, 100].map((limitOption) => (
              <Button
                key={limitOption}
                variant={limit === limitOption ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLimitChange(limitOption)}
              >
                {limitOption}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Identity Address</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Accounts</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading users...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users && users.length > 0 ? (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => handleUserClick(user.id)}
                >
                  <TableCell className="font-mono text-sm">
                    {user.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {user.identityAddress.slice(0, 3)}...
                    {user.identityAddress.slice(-6)}
                  </TableCell>
                  <TableCell>
                    {user.label || (
                      <span className="text-muted-foreground italic">
                        No label
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.accounts && user.accounts.length > 0 ? (
                      <div className="space-y-1">
                        {user.accounts.map((account) => (
                          <div key={account.address} className="text-xs">
                            <div className="font-mono text-muted-foreground">
                              {account.address}
                            </div>
                            <div className="text-foreground">
                              {account.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">
                        No accounts
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(user.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  <div className="text-muted-foreground">
                    <p className="font-medium text-lg">No users found</p>
                    <p className="text-sm">There are no users to display.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {totalUsers > 0 ? (
            <>
              Showing {(page - 1) * limit + 1} to{' '}
              {Math.min(page * limit, totalUsers)} of {totalUsers} user
              {totalUsers !== 1 ? 's' : ''}
            </>
          ) : (
            'No users to display'
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={page === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-sm">
              Page {page} of {totalPages || 1}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={page >= totalPages || isLoading || totalPages === 0}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
