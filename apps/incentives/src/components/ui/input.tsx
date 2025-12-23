import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';

import { cn } from '~/lib/utils';

const inputVariants = cva(
  'flex w-full min-w-0 rounded-md border shadow-xs outline-none transition-[color,box-shadow] selection:bg-primary selection:text-primary-foreground file:inline-flex file:border-0 file:bg-transparent file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-input bg-transparent file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40',
        dark: 'border-white/20 bg-white/10 text-white file:text-white placeholder:text-white/50 focus-visible:border-white/40 focus-visible:ring-[3px] focus-visible:ring-white/20 aria-invalid:border-destructive aria-invalid:ring-destructive/40',
      },
      size: {
        default: 'h-9 px-3 py-1 text-base file:h-7 file:text-sm md:text-sm',
        sm: 'h-8 px-2.5 py-1 text-sm file:h-6 file:text-xs',
        lg: 'h-11 px-4 py-2 text-base file:h-8 file:text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type InputProps = Omit<React.ComponentProps<'input'>, 'size'> &
  VariantProps<typeof inputVariants>;

function Input({ className, type, variant, size, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Input, inputVariants };
