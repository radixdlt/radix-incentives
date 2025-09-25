import { ExternalLink } from 'lucide-react';
import { SeasonRewardCard } from './season-reward-card';

interface RadixRewardsIntroProps {
  seasonId?: string;
}

export const RadixRewardsIntro = ({ seasonId }: RadixRewardsIntroProps) => {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex items-center lg:col-span-2">
          <div className="space-y-4">
            <h1 className="bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text font-bold text-2xl text-transparent md:text-3xl">
              Radix Rewards
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
              Radix Rewards features a massive multi-season{' '}
              <span className="font-semibold text-foreground">
                1 billion XRD
              </span>{' '}
              incentive program.{' '}
              <span className="font-semibold text-foreground">
                Earn points by participating in DeFi activities
              </span>{' '}
              across the Radix ecosystem and{' '}
              <span className="font-semibold text-foreground">
                unlock rewards based on your contribution to network
              </span>{' '}
              growth. When the ecosystem grows, everyone benefits through
              community milestones.
            </p>
            <div className="hidden flex-row gap-3 pt-4 lg:flex">
              <a
                href="https://radquest.io/home/basic"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
              >
                Try RadQuest
                <ExternalLink className="h-4 w-4" />
              </a>
              <a
                href="https://radixdlt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                About Radix
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end lg:col-span-1">
          {seasonId ? (
            <SeasonRewardCard seasonId={seasonId} />
          ) : (
            <div className="rounded-lg border bg-card p-6">
              <div className="text-center text-muted-foreground">
                Loading...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile links - centered below everything */}
      <div className="flex justify-center gap-3 pt-6 lg:hidden">
        <a
          href="https://radquest.io/home/basic"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
        >
          Try RadQuest
          <ExternalLink className="h-4 w-4" />
        </a>
        <a
          href="https://radixdlt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          About Radix
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
};
