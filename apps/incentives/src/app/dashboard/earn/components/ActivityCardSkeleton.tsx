import { Skeleton } from '~/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '~/components/ui/card';

export const ActivityCardSkeleton = () => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="flex gap-1 mt-2">
          <Skeleton className="h-5 w-8 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>

        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
      
      <CardFooter className="pt-3">
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  );
};