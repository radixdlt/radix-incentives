'use client';

import { AlertCircle, CheckCircle2, Package, Truck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Spinner } from '~/components/ui/spinner';
import { api } from '~/trpc/react';

export default function ClaimPricePage() {
  const router = useRouter();

  const { data: competition, isLoading: isCompetitionLoading } =
    api.competition.getCompetitionBySlug.useQuery({
      slug: 'arculus',
    });

  const { data: participantData, isLoading: isParticipantLoading } =
    api.competition.getCompetitionParticipant.useQuery(
      {
        competitionId: competition?.id ?? '',
      },
      {
        enabled: !!competition?.id,
      },
    );

  const { data: userData, isLoading: isUserLoading } =
    api.user.getUser.useQuery();

  const utils = api.useUtils();

  const isLoading =
    isCompetitionLoading || isParticipantLoading || isUserLoading;

  const emailAddress = userData?.email;

  const { mutate: claimCompetitionPrice, isPending: isClaimingPrize } =
    api.competition.claimCompetitionPrice.useMutation({
      onSuccess: () => {
        toast.success(
          'Prize claimed successfully! Your Arculus card will be shipped soon.',
        );
        utils.competition.getCompetitionParticipant.invalidate();
        router.push('/dashboard/competitions/arculus');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const handleClaimPrize = () => {
    if (!competition?.id) return;
    claimCompetitionPrice({ competitionId: competition.id });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Check if user is a winner
  if (!participantData) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <div className="glass-card rounded-2xl p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
          <h1 className="mb-2 font-bold text-2xl">Not a Winner</h1>
          <p className="mb-6 text-muted-foreground">
            You are not a winner of this competition.
          </p>
          <Button onClick={() => router.push('../')}>
            Back to Competition
          </Button>
        </div>
      </div>
    );
  }

  // Check if prize already claimed
  if (participantData?.claimedAt) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <div className="glass-card rounded-2xl p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h1 className="mb-2 font-bold text-2xl">Prize Already Claimed</h1>
          <p className="mb-6 text-muted-foreground">
            You claimed your prize on{' '}
            {new Date(participantData.claimedAt).toLocaleDateString()}. We will
            send you an email with your prize details soon.
          </p>
          <Button onClick={() => router.push('./')}>Back to Competition</Button>
        </div>
      </div>
    );
  }

  const hasEmailAddress = !!userData?.email;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="glass-card rounded-2xl p-8">
        <div className="mb-6 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-cyan-500" />
          <h1 className="mb-2 font-bold text-3xl">Claim Your Prize</h1>
          <p className="text-muted-foreground">
            Congratulations! You won a Radix branded Arculus card
          </p>
        </div>

        <div className="space-y-6">
          {/* Email Address Status */}
          <div
            className={`rounded-lg border p-4 ${
              hasEmailAddress
                ? 'border-green-500/20 bg-green-500/10'
                : 'border-yellow-500/20 bg-yellow-500/10'
            }`}
          >
            <div className="flex items-start gap-3">
              {hasEmailAddress ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-500" />
              )}
              <div className="flex-1">
                <h3 className="mb-1 font-semibold">
                  {hasEmailAddress
                    ? 'Email Address Set'
                    : 'Email Address Required'}
                </h3>
                {hasEmailAddress ? (
                  <div className="text-muted-foreground text-sm">
                    <p>{emailAddress}</p>
                    <Link
                      href="/dashboard/settings/email?returnUrl=/dashboard/competitions/arculus/claim-price"
                      className="mt-2 inline-block text-cyan-400 hover:text-cyan-300"
                    >
                      Update address
                    </Link>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    You need to set your email address before claiming your
                    prize.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Prize Details */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 text-cyan-500" />
              <div>
                <h3 className="mb-1 font-semibold">What happens next?</h3>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>We will send you an email with your prize details</li>
                  <li>You will receive a tracking number via email</li>
                  <li>Delivery time depends on your location</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            {!hasEmailAddress ? (
              <>
                <Button asChild className="flex-1" size="lg">
                  <Link href="/dashboard/settings/email?returnUrl=/dashboard/competitions/arculus/claim-price">
                    Add Email Address
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/competitions/arculus')}
                  size="lg"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleClaimPrize}
                  disabled={isClaimingPrize}
                  className="flex-1"
                  size="lg"
                >
                  {isClaimingPrize ? 'Claiming...' : 'Claim Prize'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/competitions/arculus')}
                  disabled={isClaimingPrize}
                  size="lg"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
