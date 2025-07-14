'use client';

import type { ReactNode } from 'react';
import { ThankYouPage } from './ThankYouPage';
import { api } from '~/trpc/react';

interface PreviewBlockWrapperProps {
  children: ReactNode;
}

const isPreviewBlocked = (blockDate: Date): boolean => {
  const currentDate = new Date();
  const isAfterBlockDate = currentDate > blockDate;

  return isAfterBlockDate;
};

export const PreviewBlockWrapper = ({ children }: PreviewBlockWrapperProps) => {
  const { data: publicConfig, isLoading } =
    api.config.getPublicConfig.useQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  if (
    publicConfig?.NEXT_PUBLIC_PREVIEW_BLOCK_ENABLED &&
    isPreviewBlocked(publicConfig.NEXT_PUBLIC_PREVIEW_BLOCK_ENABLED)
  ) {
    return <ThankYouPage />;
  }

  return <>{children}</>;
};
