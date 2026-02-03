import { Duration } from 'effect';
import { CheckCircle, Clock, ShieldCheck, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  SelectAccountButton,
  type SelectAccountEvent,
} from './select-account-button';

const COOLDOWN_DURATION = Duration.minutes(5);
const COOLDOWN_MS = Duration.toMillis(COOLDOWN_DURATION);

const formatTimeRemaining = (ms: number) => {
  const duration = Duration.millis(ms);
  const minutes = Math.floor(Duration.toMinutes(duration));
  const seconds = Math.floor(Duration.toSeconds(duration)) % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function SelectAccount({
  seasonName,
  onSelectAccount,
  hasPendingClaim,
  isFullyClaimed,
  lastClaimAt,
}: {
  seasonName?: string;
  onSelectAccount: (value: SelectAccountEvent) => void;
  hasPendingClaim?: boolean;
  isFullyClaimed?: boolean;
  lastClaimAt?: Date | null;
}) {
  const title = seasonName ? `Claim ${seasonName} Rewards` : 'Claim Rewards';
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    if (!lastClaimAt) {
      setCooldownRemaining(0);
      return;
    }

    const calculateRemaining = () => {
      const elapsed = Date.now() - lastClaimAt.getTime();
      const remaining = Math.max(0, COOLDOWN_MS - elapsed);
      setCooldownRemaining(remaining);
      return remaining;
    };

    const remaining = calculateRemaining();
    if (remaining <= 0) return;

    const interval = setInterval(() => {
      const newRemaining = calculateRemaining();
      if (newRemaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastClaimAt]);

  const isOnCooldown = cooldownRemaining > 0;

  if (isFullyClaimed) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-6 text-center">
        <h2 className="font-bold text-xl">{title}</h2>
        <div className="flex flex-col items-center gap-3">
          <CheckCircle className="h-12 w-12 text-green-400" />
          <div className="space-y-2">
            <p className="font-bold text-lg">All Rewards Claimed</p>
            <p className="text-muted-foreground text-sm">
              Congratulations! You have successfully claimed all your season
              rewards.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hasPendingClaim) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-6 text-center">
        <h2 className="font-bold text-xl">{title}</h2>
        <div className="flex flex-col items-center gap-3">
          <Clock className="h-12 w-12 animate-pulse text-yellow-400" />
          <div className="space-y-2">
            <p className="font-bold text-lg">Pending Claim</p>
            <p className="text-muted-foreground text-sm">
              Please wait for your pending claim to be processed before making
              another claim.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isOnCooldown) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-6 text-center">
        <h2 className="font-bold text-xl">{title}</h2>
        <div className="flex flex-col items-center gap-3">
          <Timer className="h-12 w-12 text-orange-400" />
          <div className="space-y-2">
            <p className="font-bold text-lg">Cooldown Active</p>
            <p className="text-muted-foreground text-sm">
              Please wait before making another claim. This helps protect your
              privacy by spreading claims over time.
            </p>
          </div>
          <Button className="mt-2 w-full max-w-xs" variant="outline" disabled>
            <Timer className="mr-2 h-4 w-4" />
            Wait {formatTimeRemaining(cooldownRemaining)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-6 text-center">
      <h2 className="font-bold text-xl">{title}</h2>
      <div className="flex flex-col items-center space-y-4">
        <p className="text-muted-foreground text-sm">
          Choose an account that will receive your season reward pool units.
        </p>

        {/* No penalty message */}
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-green-400" />
          <p className="text-left text-green-300 text-xs">
            Claiming has no penalty. You can claim all your pool units at any
            time.
          </p>
        </div>

        <div className="w-full max-w-xs">
          <SelectAccountButton onSelectAccount={onSelectAccount} />
        </div>
      </div>
    </div>
  );
}
