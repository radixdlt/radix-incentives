export const ConnectAccountInstructions = () => {
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-medium">Account Linking Instructions</h3>
        <p className="text-sm text-muted-foreground mt-1">
          To participate in the community consultation, you need to connect
          account(s). The XRD, LSUs, LSULP, and some other XRD derivatives in
          any linked account during the consultation period will be taken into
          account.
        </p>

        <p className="text-sm text-muted-foreground mt-1">
          How to connect account(s):
        </p>

        <ol className="mt-4 space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              1
            </span>
            <span className="pt-0.5">
              Click the “Connect New Account” button in the top right of this
              page, under the Radix Connect button.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="h-6 w-[30px] rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              2
            </span>
            <span className="pt-0.5">
              Open your Radix Wallet on your mobile device. Use the check boxes
              to select which accounts you want to connect, then click
              “Continue” in the wallet app.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              3
            </span>
            <span className="pt-0.5">
              Sign the verification message in the Radix Wallet app to prove
              ownership of the account(s) you’re linking.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              4
            </span>
            <span className="pt-0.5">
              Connected accounts will show above, you can repeat this process to
              connect additional accounts.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              5
            </span>
            <span className="pt-0.5">
              After connecting any accounts you wish to use, click on
              “Consultations” on the left of the page to participate in a
              consultation.
            </span>
          </li>
        </ol>

        <p className="text-sm text-muted-foreground mt-1">
          Please note, an account can only be connected to the dApp with 1
          Persona.
        </p>
      </div>
    </div>
  );
};
