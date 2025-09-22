'use client';

import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';
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
import type { RouterOutputs } from '~/trpc/react';

type DexPoolsData = RouterOutputs['admin']['dex']['getDexComponentTvl'];

type SortField =
  | 'dapp'
  | 'poolAddress'
  | 'tvl'
  | 'token0'
  | 'token1'
  | 'exists'
  | 'blueprintName';
type SortDirection = 'asc' | 'desc';

type DexPoolsTableProps = {
  pools: DexPoolsData;
};

export function DexPoolsTable({ pools }: DexPoolsTableProps) {
  const [sortField, setSortField] = useState<SortField>('tvl');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPools = [...pools].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'dapp':
        aValue = a.dappId || '';
        bValue = b.dappId || '';
        break;
      case 'poolAddress':
        aValue = a.componentAddress;
        bValue = b.componentAddress;
        break;
      case 'tvl':
        aValue = Number.parseFloat(a.tvlUsd?.toString() || '0');
        bValue = Number.parseFloat(b.tvlUsd?.toString() || '0');
        break;
      case 'token0':
        aValue = a.data.token_x.symbol || '';
        bValue = b.data.token_x.symbol || '';
        break;
      case 'token1':
        aValue = a.data.token_y.symbol || '';
        bValue = b.data.token_y.symbol || '';
        break;
      case 'exists':
        aValue = a.exists ? 1 : 0;
        bValue = b.exists ? 1 : 0;
        break;
      case 'blueprintName':
        aValue = a.blueprintName || '';
        bValue = b.blueprintName || '';
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

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

  const formatTvl = (tvl: any) => {
    if (!tvl) return '$0';
    const value = Number.parseFloat(tvl.toString());
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const truncateAddress = (address: string | null | undefined) => {
    if (!address) return '-';
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('dapp')}
            >
              <div className="flex items-center">
                DEX
                {getSortIcon('dapp')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('blueprintName')}
            >
              <div className="flex items-center">
                Blueprint
                {getSortIcon('blueprintName')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('poolAddress')}
            >
              <div className="flex items-center">
                Pool Address
                {getSortIcon('poolAddress')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('token0')}
            >
              <div className="flex items-center">
                Token 0{getSortIcon('token0')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('token1')}
            >
              <div className="flex items-center">
                Token 1{getSortIcon('token1')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('exists')}
            >
              <div className="flex items-center">
                In Campaign
                {getSortIcon('exists')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer text-right hover:bg-muted/50"
              onClick={() => handleSort('tvl')}
            >
              <div className="flex items-center justify-end">
                TVL
                {getSortIcon('tvl')}
              </div>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPools.length > 0 ? (
            sortedPools.map((pool) => (
              <TableRow key={pool.componentAddress}>
                <TableCell>
                  <Badge variant="outline">{pool.dappId || 'Unknown'}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {pool.blueprintName || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  <span title={pool.componentAddress}>
                    {truncateAddress(pool.componentAddress)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {pool.data.token_x.symbol || 'Unknown'}
                    </span>
                    <span
                      className="font-mono text-muted-foreground text-xs"
                      title={pool.data.token_x.resourceAddress}
                    >
                      {truncateAddress(pool.data.token_x.resourceAddress)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {pool.data.token_y.symbol || 'Unknown'}
                    </span>
                    <span
                      className="font-mono text-muted-foreground text-xs"
                      title={pool.data.token_y.resourceAddress}
                    >
                      {truncateAddress(pool.data.token_y.resourceAddress)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={pool.exists ? 'default' : 'secondary'}>
                    {pool.exists ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatTvl(pool.tvlUsd)}
                </TableCell>
                <TableCell>
                  {pool.url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={pool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on CaviarNine"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                No DEX pools data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
