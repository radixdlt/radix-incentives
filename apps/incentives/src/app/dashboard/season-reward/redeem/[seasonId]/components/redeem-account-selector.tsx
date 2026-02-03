import { useForm, useStore } from '@tanstack/react-form';
import BigNumber from 'bignumber.js';
import { AlertTriangle, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { useSubmitTransaction } from '~/lib/hooks/useSubmitTransaction';
import { buildRedeemManifest } from '~/lib/manifests/redeem';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/react';
import { formatAmount } from '../../../helpers/formatAmount';

type AccountBalance = {
  address: string;
  balance: string;
  label: string | null;
};

type VesterInfo = {
  poolUnitResourceAddress: string;
  poolAddress: string;
  currentValuePerUnit: string;
  maturityValuePerUnit: string;
  vestEndTimestamp: string | null;
};

type RedeemAccountSelectorProps = {
  accountBalances: AccountBalance[];
  vesterInfo?: VesterInfo;
  seasonId: string;
  onSelectDifferentAccount?: () => void;
};

const formatAddress = (address: string) => {
  return `${address.slice(0, 12)}...${address.slice(-8)}`;
};

export const RedeemAccountSelector = ({
  accountBalances,
  vesterInfo,
  onSelectDifferentAccount,
}: RedeemAccountSelectorProps) => {
  const utils = api.useUtils();
  const { submitTransaction, isSubmitting: isTransactionSubmitting } =
    useSubmitTransaction();
  const firstAccount = accountBalances[0];
  const [selectedAddress, setSelectedAddress] = useState<string>(
    firstAccount?.address ?? '',
  );

  const selectedAccount = accountBalances.find(
    (a) => a.address === selectedAddress,
  );

  const form = useForm({
    defaultValues: {
      amount: '',
    },
    onSubmit: async ({ value }) => {
      if (!vesterInfo || !selectedAddress) {
        return;
      }

      const manifest = buildRedeemManifest({
        accountAddress: selectedAddress,
        poolAddress: vesterInfo.poolAddress,
        lpTokenAddress: vesterInfo.poolUnitResourceAddress,
        amount: value.amount,
      });

      const result = await submitTransaction({
        manifest,
        message: `Redeem ${value.amount} LP tokens for XRD`,
        onSuccess: () => {
          form.reset();
          // Invalidate queries to refresh balances and vester info
          void utils.seasonReward.getRewardTokenBalances.invalidate();
          void utils.seasonReward.getVesterInfo.invalidate();
        },
      });

      return result;
    },
  });

  const currentAmount = useStore(form.store, (state) => state.values.amount);

  const selectedBalance = selectedAccount
    ? new BigNumber(selectedAccount.balance)
    : new BigNumber(0);

  const amountBn = new BigNumber(currentAmount || '0');
  const currentXrdValue = vesterInfo
    ? amountBn.multipliedBy(vesterInfo.currentValuePerUnit)
    : new BigNumber(0);
  const maturityXrdValue = vesterInfo
    ? amountBn.multipliedBy(vesterInfo.maturityValuePerUnit)
    : new BigNumber(0);
  const potentialLoss = maturityXrdValue.minus(currentXrdValue);
  const lossPercentage = maturityXrdValue.isGreaterThan(0)
    ? potentialLoss.dividedBy(maturityXrdValue).multipliedBy(100)
    : new BigNumber(0);

  const isMatured = vesterInfo?.vestEndTimestamp
    ? new Date(vesterInfo.vestEndTimestamp).getTime() <= Date.now()
    : false;

  if (accountBalances.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 text-center">
        <Wallet className="h-12 w-12 text-white/40" />
        <p className="text-muted-foreground">
          No connected accounts found with reward tokens.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Early redemption warning */}
      {!isMatured && (
        <div className="flex items-start gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
          <p className="text-left text-orange-300 text-xs">
            Redeeming before vesting completes will forfeit a portion of your
            rewards. Wait until maturity to receive the full XRD value.
          </p>
        </div>
      )}

      <div>
        <Label className="mb-2 block font-bold">Select Account</Label>
        <Select
          value={selectedAddress}
          onValueChange={(value) => {
            setSelectedAddress(value);
            // Reset amount when switching accounts
            form.setFieldValue('amount', '');
          }}
        >
          <SelectTrigger
            className={cn(
              'w-full',
              selectedAddress && 'bg-white/10 hover:bg-white/15',
            )}
          >
            <SelectValue placeholder="Select account...">
              {selectedAccount && (
                <span>
                  {selectedAccount.label ||
                    formatAddress(selectedAccount.address)}
                  <span className="ml-2 text-white/60">
                    ({formatAmount(selectedAccount.balance)} tokens)
                  </span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {accountBalances.map((account) => (
              <SelectItem key={account.address} value={account.address}>
                <div className="flex flex-col">
                  <span>{account.label || formatAddress(account.address)}</span>
                  <span className="text-xs opacity-60">
                    {formatAmount(account.balance)} tokens
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {onSelectDifferentAccount && (
          <button
            type="button"
            className="mt-2 w-full text-center text-muted-foreground text-sm underline hover:no-underline"
            onClick={onSelectDifferentAccount}
          >
            Select a different account from wallet
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="space-y-4">
          <form.Field
            name="amount"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Amount is required';
                const valueBn = new BigNumber(value);
                if (valueBn.isNaN()) return 'Invalid number format';
                if (valueBn.isNegative()) return 'Amount must be positive';
                if (valueBn.isLessThanOrEqualTo(0))
                  return 'Amount must be greater than 0';
                if (valueBn.isGreaterThan(selectedBalance))
                  return 'Amount exceeds available balance';
              },
            }}
          >
            {(field) => (
              <div>
                <Label
                  className={cn(
                    'mb-2 block font-bold',
                    field.state.meta.errors.length > 0 && 'text-destructive',
                  )}
                >
                  Amount to Redeem
                </Label>
                <Input
                  className="mb-2 w-full"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  disabled={isTransactionSubmitting || !selectedAccount}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="text"
                  placeholder={`Enter amount (${formatAmount(selectedBalance.toString())} available)`}
                  variant="dark"
                  size="lg"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="mb-2 font-medium text-destructive text-sm">
                    {field.state.meta.errors[0]}
                  </p>
                )}

                <div className="mb-4 grid grid-cols-4 gap-2">
                  {[
                    { label: '25%', value: 0.25 },
                    { label: '50%', value: 0.5 },
                    { label: '75%', value: 0.75 },
                    { label: '100%', value: 1 },
                  ].map((option) => (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      key={option.value}
                      disabled={!selectedAccount}
                      onClick={() => {
                        const amount = selectedBalance
                          .multipliedBy(option.value)
                          .toString();
                        field.handleChange(amount);
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </form.Field>

          {currentAmount && amountBn.isGreaterThan(0) && vesterInfo && (
            <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-white/60">Redemption Preview</div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">You will receive</span>
                <span className="font-semibold text-green-400">
                  {formatAmount(currentXrdValue.toString())} XRD
                </span>
              </div>
              {!isMatured && potentialLoss.isGreaterThan(0) && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Maturity value</span>
                    <span className="text-blue-400">
                      {formatAmount(maturityXrdValue.toString())} XRD
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-white/10 border-t pt-2">
                    <span className="text-orange-400">
                      Early redemption loss
                    </span>
                    <span className="font-medium text-orange-400">
                      -{formatAmount(potentialLoss.toString())} XRD (
                      {lossPercentage.toFixed(1)}%)
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          <form.Subscribe selector={(state) => [state.canSubmit]}>
            {([canSubmit]) => (
              <Button
                type="submit"
                className="w-full"
                disabled={
                  !canSubmit ||
                  !selectedAccount ||
                  !vesterInfo ||
                  isTransactionSubmitting
                }
              >
                {isTransactionSubmitting ? 'Redeeming...' : 'Redeem Tokens'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  );
};
