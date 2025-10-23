import { Skeleton } from '~/components/ui/skeleton';

export function SkeletonLoader() {
  return (
    <div className="mt-3">
      <Skeleton className="mb-3 h-10 w-1/2" />
      <Skeleton className="mb-3 h-15 w-full" />
      <Skeleton className="mb-3 h-15 w-full" />
    </div>
  );
}
