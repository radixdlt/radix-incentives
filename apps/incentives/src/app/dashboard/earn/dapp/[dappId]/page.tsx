'use client';

import { ArrowLeft, BookOpen, ChevronRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { use } from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { cn, getIcon } from '~/lib/utils';
import { api } from '~/trpc/react';

const getDappLogoPath = (dappId: string): string => {
  return `/dapp-logos/${dappId}.png`;
};

export default function DappDetailPage({
  params,
}: {
  params: Promise<{ dappId: string }>;
}) {
  const { dappId } = use(params);
  const searchParams = useSearchParams();
  const fromDapps = searchParams.get('from') === 'dapps';
  const backUrl = fromDapps ? '/dashboard/earn?view=dapps' : '/dashboard/earn';

  const { data: dappsData, isLoading } =
    api.dapps.getDappsWithCategories.useQuery();

  const dapp = dappsData?.find((d) => d.id === dappId);

  // Get unique categories from activities
  const uniqueCategories = new Map();
  dapp?.activities?.forEach((activity) => {
    if (activity.activityCategories) {
      uniqueCategories.set(
        activity.activityCategories.id,
        activity.activityCategories,
      );
    }
  });
  const categories = Array.from(uniqueCategories.values());

  const logoPath = getDappLogoPath(dappId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardHeader>
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="mt-4 h-8 w-64" />
            <Skeleton className="mt-2 h-4 w-full" />
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!dapp) {
    return (
      <div className="space-y-6">
        <Link href={backUrl}>
          <Button type="button" variant="ghost" className="mb-2 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Earn
          </Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>DApp not found</CardTitle>
            <CardDescription>
              The DApp you're looking for doesn't exist.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href={backUrl}>
        <Button type="button" variant="ghost" className="mb-2 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Earn
        </Button>
      </Link>

      <Card noHover>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white bg-background p-1">
                <Image
                  src={logoPath}
                  alt={`${dapp.name} logo`}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">{dapp.name}</CardTitle>
                {dapp.tags && dapp.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {dapp.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <a
              href={dapp.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto sm:shrink-0"
            >
              <Button type="button" className="w-full gap-2 sm:w-auto">
                Visit DApp
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card noHover className="lg:col-span-1">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              {dapp.longDescription ||
                dapp.description ||
                'No description available.'}
            </CardDescription>
          </CardContent>
        </Card>

        {categories.length > 0 && (
          <Card noHover className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Earning Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {categories.map((category) => {
                  const IconComponent = getIcon(category.icon);
                  const colorClasses =
                    category.color || 'bg-primary/10 text-white';

                  return (
                    <Link
                      key={category.id}
                      href={`/dashboard/earn/${category.id}?dapp=${dapp.id}`}
                      className="group flex items-center gap-3 rounded-lg border border-white/10 p-4 transition-all duration-200 hover:border-primary/50 hover:bg-muted/50"
                    >
                      <div
                        className={cn('shrink-0 rounded-lg p-2', colorClasses)}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span className="flex-1 font-medium text-sm">
                        {category.name}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {dapp.resources && dapp.resources.length > 0 && (
        <Card noHover>
          <CardHeader>
            <CardTitle>Guides & Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dapp.resources.map((resource) => (
                <a
                  key={resource.url}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card className="flex h-full items-center transition-all duration-200 hover:border-primary/50 hover:shadow-md">
                    <div className="flex w-full items-center justify-between gap-3 p-4">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                        <span className="font-semibold text-sm">
                          {resource.title}
                        </span>
                      </div>
                      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
