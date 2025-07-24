'use client';

import React from 'react';
import { cn } from '~/lib/utils';

const buttonGroupVariants =
  'flex sm:items-center max-sm:gap-1 max-sm:flex-col [&>*:focus-within]:ring-1 [&>*:focus-within]:z-10 [&>*]:ring-offset-0 sm:[&>*:not(:first-child)]:rounded-l-none sm:[&>*:not(:last-child)]:rounded-r-none [&>*]:h-10 [&>*]:px-4 [&>*]:py-2';

export const ButtonGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div className={cn(buttonGroupVariants, className)} ref={ref} {...props}>
      {children}
    </div>
  );
});
ButtonGroup.displayName = 'ButtonGroup';