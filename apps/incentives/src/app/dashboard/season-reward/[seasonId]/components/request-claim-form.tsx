import { useForm, useStore } from '@tanstack/react-form';
import BigNumber from 'bignumber.js';
import { ShieldCheck } from 'lucide-react';
import { Amount } from 'shared/brandedTypes';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { cn } from '~/lib/utils';
import { formatAmount } from '../../helpers/formatAmount';
import type { SelectAccountEvent } from './select-account-button';
import { SelectedAccount } from './selected-account';

export function RequestClaimForm({
  seasonName,
  selectedAccount,
  onClearAccount,
  availableAmount,
  onRequestClaim,
}: {
  seasonName?: string;
  availableAmount: string;
  selectedAccount: SelectAccountEvent;
  onClearAccount: () => void;
  onRequestClaim: (amount: Amount) => Promise<void>;
}) {
  const title = seasonName ? `Claim ${seasonName} Rewards` : 'Claim Rewards';
  const form = useForm({
    defaultValues: {
      amount: '',
    },
    onSubmit: async ({ value }) => {
      await onRequestClaim(Amount.make(value.amount));
    },
  });

  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <>
      <h2 className="mb-6 text-center font-bold text-xl">{title}</h2>

      {/* No penalty message */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2">
        <ShieldCheck className="h-4 w-4 shrink-0 text-green-400" />
        <p className="text-left text-green-300 text-xs">
          Claiming has no penalty. You can claim all your pool units at any
          time.
        </p>
      </div>

      <p className="mb-2 font-bold text-lg">Select Amount to Claim</p>
      <div className="mb-4 text-sm">
        <p className="text-muted-foreground">
          We recommended that you don't withdraw all your pool units to the same
          account.
        </p>
        <p className="text-muted-foreground">
          Instead, you should withdraw a portion spread out over multiple
          accounts.
        </p>
        <p className="text-muted-foreground">
          This will help to prevent tracing your incentives user to your wallet
          account.
        </p>
      </div>

      <SelectedAccount
        account={selectedAccount.account}
        onClearAccount={onClearAccount}
      />
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-2">
          <form.Field
            name="amount"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Amount is required';
                const valueBn = new BigNumber(value);
                if (valueBn.isNaN()) return 'Invalid number format';
                if (valueBn.isNegative()) return 'Amount must be positive';
                if (valueBn.isLessThan(1)) return 'Minimum amount is 1';
                if (valueBn.isGreaterThan(availableAmount))
                  return 'Amount is greater than available amount';
              },
            }}
          >
            {(field) => (
              <div>
                <Label
                  className={cn(
                    'font-bold',
                    field.state.meta.errors.length > 0 && 'text-destructive',
                  )}
                >
                  Amount
                </Label>
                <Input
                  className="mb-2 w-full"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  disabled={isSubmitting}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="text"
                  placeholder={`Enter amount (${formatAmount(availableAmount)} available) `}
                  variant="dark"
                  size={'lg'}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="mb-2 font-medium text-destructive text-sm">
                    {field.state.meta.errors[0]}
                  </p>
                )}

                <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                      onClick={() => {
                        const amount = new BigNumber(availableAmount)
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

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting ? 'Submitting...' : 'Claim pool units'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </>
  );
}
