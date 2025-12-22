import { Duration } from 'effect';
import { CheckCircle, Clock, Timer } from 'lucide-react';
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
  onSelectAccount,
  hasPendingClaim,
  isFullyClaimed,
  lastClaimAt,
}: {
  onSelectAccount: (value: SelectAccountEvent) => void;
  hasPendingClaim?: boolean;
  isFullyClaimed?: boolean;
  lastClaimAt?: Date | null;
}) {
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
      <div className="flex flex-col gap-2">
        <p className="font-bold">All Rewards Claimed</p>
        <p className="mb-4 text-muted-foreground">
          Congratulations! You have successfully claimed all your season
          rewards.
        </p>
        <Button className="w-full" variant="outline" disabled>
          <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
          Fully Claimed
        </Button>
      </div>
    );
  }

  if (hasPendingClaim) {
    return (
      <div className="flex flex-col gap-2">
        <p className="font-bold">Account Selection</p>
        <p className="mb-4 text-muted-foreground">
          You have a pending claim. Please wait for it to be processed before
          making another claim.
        </p>
        <Button className="w-full" variant="outline" disabled>
          <Clock className="mr-2 h-4 w-4 animate-pulse" />
          Pending Claim in Progress
        </Button>
      </div>
    );
  }

  if (isOnCooldown) {
    return (
      <div className="flex flex-col gap-2">
        <p className="font-bold">Account Selection</p>
        <p className="mb-4 text-muted-foreground">
          Please wait before making another claim. This is to spread out the
          claims over time to prevent mapping your incentives user to your
          wallet account.
        </p>
        <Button className="w-full" variant="outline" disabled>
          <Timer className="mr-2 h-4 w-4" />
          Wait {formatTimeRemaining(cooldownRemaining)}
        </Button>
      </div>
    );
  }

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
