'use client';

import { ArrowLeft, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
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

// Types for balance data structure
type FungibleResource = {
  amount?: string;
  [key: string]: unknown;
};

type Balance = {
  resource_address?: string;
  amount?: string;
  [key: string]: unknown;
};

type BalanceData = {
  fungible_resources?: Record<string, FungibleResource>;
  balances?: Balance[];
  [key: string]: unknown;
};

// Component to render balance data
function BalanceDataRenderer({ data }: { data: BalanceData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Try to extract key balance information
  const extractBalanceInfo = (data: BalanceData) => {
    const info: { resource: string; amount: string }[] = [];

    // Handle different data structures that might exist
    if (data && typeof data === 'object') {
      // Check for fungible resources
      if (data.fungible_resources) {
        Object.entries(data.fungible_resources).forEach(
          ([resource, details]) => {
            if (details?.amount) {
              info.push({
                resource: `${resource.slice(0, 20)}...`,
                amount: Number(details.amount).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 6,
                }),
              });
            }
          },
        );
      }

      // Check for other balance structures
      if (data.balances && Array.isArray(data.balances)) {
        data.balances.forEach((balance) => {
          if (balance.resource_address && balance.amount) {
            info.push({
              resource: `${balance.resource_address.slice(0, 20)}...`,
              amount: Number(balance.amount).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 6,
              }),
            });
          }
        });
      }
    }

    return info;
  };

  const balanceInfo = extractBalanceInfo(data);

  return (
    <div className="space-y-2">
      {/* Show key balance information */}
      {balanceInfo.length > 0 && (
        <div className="space-y-1">
          {balanceInfo.slice(0, 3).map((balance) => (
            <div
              key={balance.resource}
              className="flex justify-between text-sm"
            >
              <span className="font-mono text-muted-foreground text-xs">
                {balance.resource}
              </span>
              <span className="font-mono">{balance.amount}</span>
            </div>
          ))}
          {balanceInfo.length > 3 && !isExpanded && (
            <div className="text-muted-foreground text-xs">
              +{balanceInfo.length - 3} more resources...
            </div>
          )}
        </div>
      )}

      {/* Toggle button to show/hide raw JSON */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-6 px-2 text-xs"
      >
        {isExpanded ? (
          <>
            <ChevronDown className="mr-1 h-3 w-3" />
            Hide Raw Data
          </>
        ) : (
          <>
            <ChevronRight className="mr-1 h-3 w-3" />
            Show Raw Data
          </>
        )}
      </Button>

      {/* Raw JSON data (collapsible) */}
      {isExpanded && (
        <div className="rounded border bg-muted/50 p-2">
          <pre className="whitespace-pre-wrap text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function AccountBalancesPage() {
  const { id: userId, address } = useParams<{ id: string; address: string }>();

  const {
    data: balances,
    isLoading,
    error,
  } = api.admin.user.getAccountBalances.useQuery({
    address,
  });

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <h2 className="mb-2 font-semibold text-destructive">
            Error loading account balances
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
            <span>Loading account balances...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 pr-6 pl-6">
      {/* Header Section */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/users/${userId}`} aria-label="Back to user">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            Account Balances
          </h1>
          <p className="text-muted-foreground">
            Balance snapshots for account {address}
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Account Balances Table */}
      <Card>
        <CardHeader>
          <CardTitle>Balance History</CardTitle>
          <CardDescription>
            {balances?.length || 0} balance snapshot
            {balances?.length !== 1 ? 's' : ''} for this account
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Timestamp</TableHead>
                  <TableHead>Balance Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances && balances.length > 0 ? (
                  balances
                    .sort(
                      (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime(),
                    )
                    .map((balance, index) => (
                      <TableRow key={`${balance.timestamp}-${index}`}>
                        <TableCell className="align-top font-mono text-sm">
                          <div className="space-y-1">
                            <div>
                              {
                                new Date(balance.timestamp)
                                  .toISOString()
                                  .split('T')[0]
                              }
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {
                                new Date(balance.timestamp)
                                  .toISOString()
                                  .split('T')[1]
                                  ?.split('.')[0]
                              }{' '}
                              UTC
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <BalanceDataRenderer
                            data={balance.data as BalanceData}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      No balance snapshots found for this account.
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
