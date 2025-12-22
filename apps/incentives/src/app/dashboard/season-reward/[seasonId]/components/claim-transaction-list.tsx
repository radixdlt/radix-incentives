'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  ExternalLink,
  History,
  Loader2,
  XCircle,
} from 'lucide-react';
import { Card } from '~/components/ui/card';
import { EmptyState } from '~/components/ui/empty-state';
import { Skeleton } from '~/components/ui/skeleton';
import type { RouterOutputs } from '~/trpc/react';
import { formatAmount } from '../../helpers/formatAmount';

type Claim =
  RouterOutputs['seasonReward']['getAllUserSeasonRewardClaims'][number];

const StatusBadge = ({ status }: { status: Claim['status'] }) => {
  const config = {
    pending: {
      icon: Clock,
      label: 'Pending',
      className: 'bg-yellow-500/20 text-yellow-400',
    },
    success: {
      icon: CheckCircle,
      label: 'Success',
      className: 'bg-green-500/20 text-green-400',
    },
    failed: {
      icon: XCircle,
      label: 'Failed',
      className: 'bg-red-500/20 text-red-400',
    },
  };

  const { icon: Icon, label, className } = config[status];

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium text-xs ${className}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </div>
  );
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const truncateTransactionId = (id: string) => {
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}...${id.slice(-8)}`;
};

const ClaimTransactionSkeleton = () => {
  return (
    <Card noHover className="overflow-hidden">
      <div className="border-white/10 border-b px-4 py-3">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="divide-y divide-white/10">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-3.5 w-3.5" />
          </div>
        ))}
      </div>
    </Card>
  );
};

const PendingClaimRow = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex animate-pulse items-center justify-between gap-4 px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
        <span className="text-sm text-white/60">
          Processing claim request...
        </span>
      </div>
    </motion.div>
  );
};

export const ClaimTransactionList = ({
  claims,
  isLoading,
  isAwaitingClaim,
}: {
  claims: RouterOutputs['seasonReward']['getAllUserSeasonRewardClaims'];
  isLoading?: boolean;
  isAwaitingClaim?: boolean;
}) => {
  if (isLoading) {
    return <ClaimTransactionSkeleton />;
  }

  if (claims.length === 0 && !isAwaitingClaim) {
    return (
      <EmptyState
        icon={History}
        title="No claim history"
        description="Your claim transactions will appear here once you claim your rewards."
      />
    );
  }

  return (
    <Card noHover className="overflow-hidden">
      <div className="border-white/10 border-b px-4 py-3">
        <h3 className="font-medium text-sm text-white/80">Claim History</h3>
      </div>
      <div className="divide-y divide-white/10">
        <AnimatePresence mode="wait">
          {isAwaitingClaim && <PendingClaimRow key="pending-claim" />}
        </AnimatePresence>
        <AnimatePresence>
          {claims.map((claim, index) => (
            <motion.div
              key={claim.transactionId}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-white">
                    {formatAmount(claim.amount)}
                  </span>
                  <StatusBadge status={claim.status} />
                </div>
                <span className="text-white/50 text-xs">
                  {formatDate(claim.createdAt)}
                </span>
              </div>
              <a
                href={`https://dashboard.radixdlt.com/transaction/${claim.transactionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-white/60 text-xs transition-colors hover:text-white"
                title={claim.transactionId}
              >
                <span className="hidden sm:inline">
                  {truncateTransactionId(claim.transactionId)}
                </span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
};
