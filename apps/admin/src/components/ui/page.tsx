'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Separator } from './separator';
import { Skeleton } from './skeleton';

export function PageHeader({
  title,
  description,
  children,
  backButton,
  loading,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
  backButton?: boolean;
  loading?: boolean;
}) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        {backButton && (
          <Link href="./" className="shrink">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <div className="grow">
          {loading ? (
            <>
              <Skeleton className="mb-2 h-8 w-48" />
              <Skeleton className="h-5 w-1/2" />
            </>
          ) : (
            <>
              <h1 className="font-bold text-3xl tracking-tight">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </>
          )}
        </div>
        {children}
      </div>

      <Separator className="my-6" />
    </>
  );
}

export function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="container mx-auto py-6 pr-6 pl-6">{children}</div>;
}
