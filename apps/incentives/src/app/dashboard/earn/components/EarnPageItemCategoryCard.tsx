import { Card, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

export const EarnPageItemCategoryCard = ({
  name,
  description,
  loading,
}: {
  name?: string | null;
  description?: string | null;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="mt-2 h-6 w-full rounded-lg" />
        </CardHeader>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{name}</CardTitle>
            <div className="mt-2 text-muted-foreground">{description}</div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
