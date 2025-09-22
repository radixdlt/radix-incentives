'use client';

import { api } from '~/trpc/react';
import { DexPoolsTable } from './components/DexPoolsTable';

export default function DexPoolsPage() {
  const { data, isLoading } = api.admin.dex.getDexComponentTvl.useQuery();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-bold text-3xl">DEX Pools</h1>
        <p className="text-muted-foreground">
          View and analyze DEX pool liquidity across different protocols
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-muted-foreground">Loading pools data...</div>
        </div>
      ) : (
        <DexPoolsTable pools={data || []} />
      )}
    </div>
  );
}
