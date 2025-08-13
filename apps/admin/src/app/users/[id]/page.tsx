'use client';

import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { api } from '~/trpc/react';

export default function UserPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: user,
    isLoading,
    error,
  } = api.admin.user.getUser.useQuery({
    id,
  });

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <h2 className="mb-2 font-semibold text-destructive">
            Error loading user
          </h2>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading user...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 font-semibold text-lg">User not found</h2>
          <p className="text-muted-foreground text-sm">
            The user with ID "{id}" could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 pr-6 pl-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/users" aria-label="Back to users">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-bold text-3xl tracking-tight">User Details</h1>
          <p className="text-muted-foreground">
            View user information and associated accounts
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* User Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Basic information about this user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="text-muted-foreground text-sm">User ID</div>
              <div className="font-mono text-sm">{user.id}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">
                Identity Address
              </div>
              <div className="font-mono text-sm">{user.identityAddress}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Label</div>
              <div className="text-sm">
                {user.label || (
                  <span className="text-muted-foreground italic">No label</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Created At</div>
              <div className="text-sm">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleString()
                  : 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Associated Accounts</CardTitle>
          <CardDescription>
            {user.accounts?.length || 0} account
            {user.accounts?.length !== 1 ? 's' : ''} linked to this user
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Address</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Added At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.accounts && user.accounts.length > 0 ? (
                  user.accounts.map((account) => (
                    <TableRow key={account.address}>
                      <TableCell className="font-mono text-sm">
                        <Link
                          href={`/users/${id}/account/${account.address}`}
                          className="underline-offset-4 hover:text-primary hover:underline"
                        >
                          {account.address}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {account.label || (
                          <span className="text-muted-foreground italic">
                            No label
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {account.createdAt
                          ? new Date(account.createdAt).toLocaleString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`/users/${id}/account/${account.address}/balances`}
                            >
                              Balances
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`/users/${id}/account/${account.address}/activity-points`}
                            >
                              Activity Points
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No accounts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
