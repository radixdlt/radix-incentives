import { Button } from '~/components/ui/button';

export function AccountRecoveryButton({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div className="mt-5 flex justify-center">
      <Button
        onClick={onClick}
        disabled={disabled}
        variant="destructive"
        className="w-full max-w-xs"
      >
        {children}
      </Button>
    </div>
  );
}
