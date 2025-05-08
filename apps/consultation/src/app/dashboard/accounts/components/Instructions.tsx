import { Avatar, AvatarFallback } from "~/components/ui/avatar";

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
            <Avatar className="h-4.5 w-4.5">
              <AvatarFallback>1</AvatarFallback>
            </Avatar>

            <span>
              Click the "Connect New Account" button in the top right of this
              page, under the Radix Connect button.
            </span>
          </li>
          <li className="flex gap-2">
            <Avatar className="h-4.5 w-4.5">
              <AvatarFallback>2</AvatarFallback>
            </Avatar>
            <span>
              Open your Radix Wallet on your mobile device. Use the check boxes
              to select which accounts you want to connect, then click
              "Continue" in the wallet app.
            </span>
          </li>
          <li className="flex gap-2">
            <Avatar className="h-4.5 w-4.5">
              <AvatarFallback>3</AvatarFallback>
            </Avatar>
            <span>
              Sign the verification message in the Radix Wallet app to prove
              ownership of the account(s) you're linking.
            </span>
          </li>
          <li className="flex gap-2">
            <Avatar className="h-4.5 w-4.5">
              <AvatarFallback>4</AvatarFallback>
            </Avatar>
            <span>
              Connected accounts will show above, you can repeat this process to
              connect additional accounts.
            </span>
          </li>
          <li className="flex gap-2">
            <Avatar className="h-4.5 w-4.5">
              <AvatarFallback>5</AvatarFallback>
            </Avatar>
            <span>
              After connecting any accounts you wish to use, click on
              "Consultations" on the left of the page to participate in a
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
