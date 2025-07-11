'use client';

import type { ReactNode } from 'react';
import { env } from '~/env';
import { ThankYouPage } from './ThankYouPage';

interface PreviewBlockWrapperProps {
  children: ReactNode;
}

const isPreviewBlocked = (): boolean => {
  const isBlockEnabled = !!env.NEXT_PUBLIC_PREVIEW_BLOCK_ENABLED;
  // biome-ignore lint/style/noNonNullAssertion: value is not null
  const blockDate = new Date(env.NEXT_PUBLIC_PREVIEW_BLOCK_ENABLED!);
  const currentDate = new Date();
  const isAfterBlockDate = currentDate > blockDate;

  return isBlockEnabled && isAfterBlockDate;
};

export const PreviewBlockWrapper = ({ children }: PreviewBlockWrapperProps) => {
  if (isPreviewBlocked()) {
    return <ThankYouPage />;
  }

  return <>{children}</>;
};
