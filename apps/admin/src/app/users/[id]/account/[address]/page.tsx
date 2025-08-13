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
import { api } from '~/trpc/react';

export default function AccountPage() {
  const { id, address } = useParams<{ id: string; address: string }>();

  const {
    data: userData,
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
            Error loading account
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
            <span>Loading account...</span>
          </div>
        </div>
      </div>
    );
  }

  const account = userData?.accounts.find((acc) => acc.address === address);

  if (!account) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border p-8 text-center">
          <h2 className="mb-2 font-semibold text-lg">Account not found</h2>
          <p className="text-muted-foreground text-sm">
            The account with address "{address}" could not be found.
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
          <Link href={`/users/${id}`} aria-label="Back to user">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Account Details</h1>
          <p className="text-muted-foreground">
            View account information and related data
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Account Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Details about this account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="text-muted-foreground text-sm">Address</div>
              <div className="font-mono text-sm break-all">{account.address}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Label</div>
              <div className="text-sm">
                {account.label || (
                  <span className="text-muted-foreground italic">No label</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Created At</div>
              <div className="text-sm">
                {account.createdAt
                  ? new Date(account.createdAt).toLocaleString()
                  : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">User ID</div>
              <div className="font-mono text-sm">{userData?.id}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Data</CardTitle>
          <CardDescription>
            View detailed information about this account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <Link href={`/users/${id}/account/${address}/balances`}>
                View Balances
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/users/${id}/account/${address}/activity-points`}>
                View Activity Points
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}