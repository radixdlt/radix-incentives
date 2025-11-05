import { CheckCircle2, ExternalLink, Gift } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export const PrizeDetailsCard: FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-cyan-400" />
          About the Prize
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
            <div>
              <div className="font-semibold text-white">
                Hardware Wallet Security
              </div>
              <div className="text-sm text-white/70">
                Cold storage solution with biometric authentication
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
            <div>
              <div className="font-semibold text-white">Exclusive Branding</div>
              <div className="text-sm text-white/70">
                Custom Radix design on card
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
            <div>
              <div className="font-semibold text-white">
                Multi-Cryptocurrency Support
              </div>
              <div className="text-sm text-white/70">
                Store XRD and other supported cryptocurrencies
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
            <div>
              <div className="font-semibold text-white">
                Sleek Card Form Factor
              </div>
              <div className="text-sm text-white/70">
                Fits in your wallet, protecting keys offline
              </div>
            </div>
          </div>
        </div>

        <Link
          href="https://www.getarculus.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-cyan-400 text-sm transition-colors hover:text-cyan-300"
        >
          Learn more about Arculus
          <ExternalLink className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
};
