export const ConnectAccountInstructions = () => {
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-medium">Account Linking Instructions</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Follow these steps to link additional accounts to your dashboard:
        </p>

        <ol className="mt-4 space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              1
            </span>
            <span className="pt-0.5">
              Click the "Connect New Account" button above.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              2
            </span>
            <span className="pt-0.5">
              Connect your Radix wallet and select the account to link.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              3
            </span>
            <span className="pt-0.5">
              Sign the verification message to prove account ownership.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              4
            </span>
            <span className="pt-0.5">
              Your account will now be linked and start earning points.
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
};
