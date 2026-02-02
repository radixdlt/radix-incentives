'use client';

import { AccountAddress } from 'api/incentives/account-balance/v2/schemas';
import type { RewardTokenBalance } from 'api/incentives/season-reward/incentives-vester/seasonVester';
import BigNumber from 'bignumber.js';
import { Array as A, Option, pipe } from 'effect';
import { Clock } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { SeasonId } from 'shared/brandedTypes';
import { Card } from '~/components/ui/card';
import { EmptyState } from '~/components/ui/empty-state';
import { useIsAuthenticated } from '~/lib/hooks/useIsAuthenticated';
import { api } from '~/trpc/react';
import { PageHeader } from '../../[seasonId]/components/page-header';
import { RedeemAccountSelector } from './components/redeem-account-selector';
import { RedeemInfo } from './components/redeem-info';
import {
  type WalletAccountEvent,
  WalletAccountSelector,
} from './components/wallet-account-selector';

export default function SeasonRewardRedeemPage() {
  const { seasonId } = useParams<{ seasonId: string }>();
  const router = useRouter();
  const brandedSeasonId = SeasonId.make(seasonId);
  const isAuthenticated = useIsAuthenticated();

  // State for wallet-selected account
  const [walletAccount, setWalletAccount] = useState<WalletAccountEvent | null>(
    null,
  );
  // State to show wallet selector when user explicitly wants to select a different account
  const [showingWalletSelector, setShowingWalletSelector] = useState(false);

  const { data: seasons, isLoading: seasonsLoading } =
    api.season.getSeasons.useQuery();

  const { data: vesterInfo, isLoading: vesterLoading } =
    api.seasonReward.getVesterInfo.useQuery(
      { seasonId: brandedSeasonId },
      {
        enabled: Boolean(seasonId),
        retry: false,
      },
    );

  // Fetch user's connected accounts when authenticated
  const { data: userAccounts, isLoading: accountsLoading } =
    api.account.getAccounts.useQuery(undefined, {
      enabled: Boolean(isAuthenticated),
    });

  // Build the list of accounts to query balances for
  const accountsToQuery = useMemo(() => {
    const accounts: { address: AccountAddress; label: string | null }[] = [];

    // Add user's connected accounts
    if (userAccounts) {
      for (const account of userAccounts) {
        accounts.push({
          address: AccountAddress(account.address),
          label: account.label ?? null,
        });
      }
    }

    // Add wallet-selected account if not already in the list
    if (
      walletAccount &&
      !accounts.some((a) => a.address === walletAccount.account.address)
    ) {
      accounts.push({
        address: AccountAddress(walletAccount.account.address),
        label: walletAccount.account.label ?? null,
      });
    }

    return accounts;
  }, [userAccounts, walletAccount]);

  // Fetch balances for all accounts
  const {
    data: accountBalances,
    isLoading: balancesLoading,
    isError: balancesError,
  } = api.seasonReward.getRewardTokenBalances.useQuery(
    {
      seasonId: brandedSeasonId,
      accounts: accountsToQuery,
    },
    {
      enabled: Boolean(seasonId) && accountsToQuery.length > 0,
      retry: false,
    },
  );

  const season = pipe(
    Option.fromNullable(seasons),
    Option.flatMap(A.findFirst((s) => s.id === seasonId)),
    Option.getOrUndefined,
  );

  const seasonName = pipe(
    Option.fromNullable(season),
    Option.map((s) => s.name),
    Option.getOrElse(() => 'Season'),
  );

  // Get account balances from the query
  const combinedAccountBalances = pipe(
    Option.fromNullable(accountBalances),
    Option.getOrElse(() => A.empty<RewardTokenBalance>()),
  );

  // Calculate loading state
  const isLoading =
    seasonsLoading ||
    vesterLoading ||
    accountsLoading ||
    (accountsToQuery.length > 0 && balancesLoading && !balancesError);

  const totalRewardTokenBalance = pipe(
    Option.fromNullable(
      combinedAccountBalances.length > 0 ? combinedAccountBalances : null,
    ),
    Option.map((balances) =>
      balances.reduce((acc, b) => acc.plus(b.balance), new BigNumber(0)),
    ),
    Option.getOrElse(() => new BigNumber(0)),
  );

  // Show wallet selector when:
  // - Not loading
  // - No accounts with balance OR explicitly want to add another wallet account
  const showWalletSelector =
    !isLoading &&
    (showingWalletSelector ||
      ((combinedAccountBalances.length === 0 ||
        totalRewardTokenBalance.isZero()) &&
        !walletAccount));

  // Handler for selecting a different account from wallet
  const handleSelectDifferentAccount = () => {
    setShowingWalletSelector(true);
  };

  // Handler for when wallet account is selected
  const handleWalletAccountSelected = (account: WalletAccountEvent) => {
    setWalletAccount(account);
    setShowingWalletSelector(false);
  };

  // If no vester info, show empty state
  if (!vesterLoading && !vesterInfo) {
    return (
      <div>
        <PageHeader
          onBackClick={() => router.push('/dashboard/season-reward')}
          backLabel="Back to Seasons"
        />
        <EmptyState
          icon={Clock}
          title="Redemption setup in progress"
          description="The reward redemption system is being configured. Please check back later."
          action={{
            label: 'Back to Season Rewards',
            onClick: () => router.push('/dashboard/season-reward'),
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        onBackClick={() => router.push('/dashboard/season-reward')}
        backLabel="Back to Seasons"
      />

      <div className="grid gap-4 sm:grid-cols-10">
        <Card noHover className="flex flex-col gap-2 p-6 sm:col-span-5">
          <div className="flex flex-col gap-2">
            <h2 className="mb-6 text-center font-bold text-xl">
              Redeem {seasonName} Rewards
            </h2>

            {isLoading ? (
              <div className="flex min-h-[200px] items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : showWalletSelector ? (
              <WalletAccountSelector
                seasonName={seasonName}
                onSelectAccount={handleWalletAccountSelected}
              />
            ) : combinedAccountBalances.length === 0 ||
              totalRewardTokenBalance.isZero() ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 text-center">
                <p className="text-muted-foreground">
                  No reward tokens found in the selected account.
                </p>
                <p className="text-muted-foreground text-sm">
                  Claim your season rewards first to receive redeemable tokens.
                </p>
                <button
                  type="button"
                  className="text-primary text-sm underline hover:no-underline"
                  onClick={handleSelectDifferentAccount}
                >
                  Select a different account
                </button>
              </div>
            ) : (
              <RedeemAccountSelector
                accountBalances={combinedAccountBalances}
                vesterInfo={vesterInfo}
                seasonId={seasonId}
                onSelectDifferentAccount={handleSelectDifferentAccount}
              />
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-4 sm:col-span-5">
          <RedeemInfo
            vesterInfo={vesterInfo}
            totalBalance={totalRewardTokenBalance.toString()}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
