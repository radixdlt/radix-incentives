import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

const buttonVariants = cva(
  'hover-lift inline-flex items-center justify-center whitespace-nowrap rounded-xl font-semibold text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'btn-gradient glow-brand font-bold text-white',
        destructive:
          'glow-pink bg-destructive text-white hover:bg-destructive/80',
        outline:
          'btn-glass border border-white/20 text-white hover:border-white/40',
        secondary: 'glass text-white hover:bg-white/15',
        ghost: 'text-white/80 hover:bg-white/10 hover:text-white',
        link: 'gradient-text text-cyan-400 underline-offset-4 hover:underline',
        glass: 'btn-glass text-white',
        gradient: 'btn-gradient font-bold text-white',
      },
      size: {
        default: 'h-11 px-6 py-3',
        sm: 'h-9 px-4 py-2',
        lg: 'h-12 px-8 py-4 text-base',
        xl: 'h-14 px-10 py-5 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
