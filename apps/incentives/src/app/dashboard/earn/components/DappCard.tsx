import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Markdown from 'react-markdown';
import { Badge } from '~/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { cn, getIcon } from '~/lib/utils';

type DappCategory = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

type DappCardProps = {
  dapp: {
    id: string;
    name: string;
    website: string;
    description: string | null;
    tags: string[];
    categories: DappCategory[];
  };
};

const getDappLogoPath = (dappId: string): string => {
  return `/dapp-logos/${dappId}.png`;
};

export const DappCard = ({ dapp }: DappCardProps) => {
  const logoPath = getDappLogoPath(dapp.id);

  return (
    <Link
      href={`/dashboard/earn/dapp/${dapp.id}?from=dapps`}
      className="group block h-full"
    >
      <Card className="relative flex h-full cursor-pointer flex-col overflow-hidden transition-all duration-200 hover:border-primary/50 hover:shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white bg-background p-0.5">
                <Image
                  src={logoPath}
                  alt={`${dapp.name} logo`}
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <CardTitle className="text-lg">{dapp.name}</CardTitle>
              </div>
            </div>
          </div>
          {dapp.tags && dapp.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {dapp.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1">
          <div className="markdown-content text-muted-foreground text-sm">
            <Markdown>
              {dapp.description || 'Participate in this DApp to earn points.'}
            </Markdown>
          </div>
        </CardContent>

        <CardFooter className="mt-auto pt-3">
          <div className="flex w-full items-end justify-between gap-3">
            {dapp.categories && dapp.categories.length > 0 ? (
              <div className="flex flex-1 flex-col gap-2">
                <span className="text-muted-foreground text-xs">Earn in:</span>
                <div className="flex max-w-full flex-wrap gap-2">
                  {dapp.categories.map((category) => {
                    const IconComponent = getIcon(category.icon ?? undefined);
                    const colorClasses =
                      category.color || 'bg-primary/10 text-white';

                    return (
                      <button
                        key={category.id}
                        type="button"
                        className="group/category relative cursor-pointer rounded-lg transition-all duration-200 hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 hover:ring-offset-background"
                        title={category.name}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.location.href = `/dashboard/earn/${category.id}?dapp=${dapp.id}`;
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = `/dashboard/earn/${category.id}?dapp=${dapp.id}`;
                          }
                        }}
                      >
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 transition-all duration-200 group-hover/category:scale-110 group-hover/category:border-white/40 group-hover/category:shadow-lg',
                            colorClasses,
                          )}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div />
            )}
            <div className="inline-flex h-9 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-xl border border-white/20 px-4 py-2 font-semibold text-sm text-white transition-all duration-300 group-hover:bg-primary/10">
              Details
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};
