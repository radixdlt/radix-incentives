import { Info } from 'lucide-react';
import { Card, CardContent } from '~/components/ui/card';

export function AccountRecoveryInstructions() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-400" />
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Account recovery</h3>
            <div className="space-y-4 text-sm text-white/70">
              <div>
                <h4 className="mb-2 font-semibold text-white">
                  Step-by-step instructions:
                </h4>
                <ol className="ml-2 list-inside list-decimal space-y-1">
                  <li>Click the "Start Account Recovery" button below.</li>
                  <li>
                    Open your Radix Wallet on your mobile device. Use the check
                    boxes to select which account you want to recover, then
                    click "Continue" in the wallet app.
                  </li>
                  <li>
                    Sign the verification message in the Radix Wallet app to
                    prove ownership of the account.
                  </li>
                  <li>
                    The account will be linked to the currently connected
                    persona.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
