'use client';

import { useRouter, usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { api } from '~/trpc/react';

interface LimitAccessWrapperProps {
  children: ReactNode;
}

export const LimitAccessWrapper = ({ children }: LimitAccessWrapperProps) => {
  const { data: publicConfig, isLoading } =
    api.config.getPublicConfig.useQuery();

  const router = useRouter();
  const pathname = usePathname();

  const shouldRedirect =
    publicConfig?.NEXT_PUBLIC_LIMIT_ACCESS_ENABLED &&
    !['/dashboard/accounts', '/dashboard/faq'].includes(pathname);

  useEffect(() => {
    if (!isLoading && shouldRedirect) {
      router.push('/dashboard/accounts');
    }
  }, [isLoading, shouldRedirect, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  // Show loading while redirecting
  if (shouldRedirect) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  return <>{children}</>;
};
