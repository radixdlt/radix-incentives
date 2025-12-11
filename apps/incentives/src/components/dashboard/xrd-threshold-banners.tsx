import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import type { FC } from 'react';

type InsufficientXrdBannerProps = {
  totalXrdValue: number;
  onCheckBalance: () => void;
  isChecking?: boolean;
};

export const InsufficientXrdBanner: FC<InsufficientXrdBannerProps> = ({
  totalXrdValue,
  onCheckBalance,
  isChecking = false,
}) => {
  return (
    <div className="fade-in-50 slide-in-from-top-5 relative animate-in overflow-hidden rounded-xl border-2 border-red-500 bg-gradient-to-br from-red-500/20 via-red-600/10 to-orange-500/20 p-6 shadow-lg shadow-red-500/20 duration-500">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10" />

      {/* Glow effect */}
      <div className="-inset-1 absolute rounded-xl bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 opacity-75 blur-lg" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="shrink-0 animate-pulse rounded-full bg-red-500 p-3 shadow-lg shadow-red-500/50">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 font-bold text-red-600 text-xl">
              Accounts Disabled - Action Required
            </h3>
            <p className="mb-2 text-foreground text-sm">
              Your accounts are currently disabled. To participate in the
              program, you need at least{' '}
              <span className="font-bold text-white">$50</span> in XRD holdings.
            </p>
            <p className="mb-3 font-bold text-sm text-white">
              After adding XRD, click "Check Balance" below to reactivate your
              accounts!
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:shrink-0">
          <a
            href="https://www.radixdlt.com/token"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-white bg-white px-4 py-2 font-bold text-red-600 shadow-lg shadow-white/30 transition-all duration-200 hover:scale-105 hover:border-red-100 hover:bg-red-50 hover:shadow-white/50 hover:shadow-xl"
          >
            Buy XRD Now
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={onCheckBalance}
            disabled={isChecking}
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-white/70 bg-red-500/40 px-4 py-2 font-semibold text-white transition-all duration-200 hover:bg-red-500/50 disabled:opacity-50"
          >
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Check Balance
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

type LowXrdSeasonPointsBannerProps = {
  totalXrdValue: number;
};

export const LowXrdSeasonPointsBanner: FC<LowXrdSeasonPointsBannerProps> = ({
  totalXrdValue,
}) => {
  return (
    <div className="fade-in-50 slide-in-from-top-5 relative animate-in overflow-hidden rounded-xl border-2 border-amber-500 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-yellow-500/20 p-6 shadow-amber-500/20 shadow-lg duration-500">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10" />

      {/* Glow effect */}
      <div className="-inset-1 absolute rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 opacity-75 blur-lg" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="shrink-0 animate-pulse rounded-full bg-amber-500 p-3 shadow-amber-500/50 shadow-lg">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 font-bold text-amber-600 text-xl">
              Increase Your XRD to Participate Fully
            </h3>
            <p className="mb-2 text-foreground text-sm">
              To participate in the full program and earn Season Points, you
              need at least <span className="font-bold text-white">$50</span> in
              XRD holdings. You currently have{' '}
              <span className="font-bold text-white">
                ${totalXrdValue.toFixed(2)}
              </span>
              .
            </p>
            <p className="mb-3 font-bold text-sm text-white">
              Add more XRD to unlock Season Points!
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:shrink-0">
          <a
            href="https://www.radixdlt.com/token"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border-2 border-white bg-white px-4 py-2 font-bold text-amber-600 shadow-lg shadow-white/30 transition-all duration-200 hover:scale-105 hover:border-amber-100 hover:bg-amber-50 hover:shadow-white/50 hover:shadow-xl"
          >
            Buy XRD Now
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
