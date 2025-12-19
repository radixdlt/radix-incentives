import {
  SelectAccountButton,
  type SelectAccountEvent,
} from './select-account-button';

export function SelectAccount({
  onSelectAccount,
}: {
  onSelectAccount: (value: SelectAccountEvent) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold">Account Selection</p>
      <p className="mb-4 text-muted-foreground">
        Start by selecting an account that will receive the season reward
        tokens.
      </p>
      <div className="w-full self-center">
        <SelectAccountButton onSelectAccount={onSelectAccount} />
      </div>
    </div>
  );
}
