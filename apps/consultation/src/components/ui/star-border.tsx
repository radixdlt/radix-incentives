import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { cn } from '~/lib/utils';

interface StarBorderProps<T extends ElementType> {
  as?: T;
  color?: string;
  speed?: string;
  className?: string;
  children: React.ReactNode;
}

export function StarBorder<T extends ElementType = 'button'>({
  as,
  className,
  color,
  speed = '6s',
  children,
  ...props
}: StarBorderProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof StarBorderProps<T>>) {
  const Component = as || 'button';
  const defaultColor = color || 'hsl(var(--foreground))';

  return (
    <Component
      className={cn(
        'relative inline-block overflow-hidden rounded-[20px] py-[1px]',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'absolute right-[-250%] bottom-[-11px] z-0 h-[50%] w-[300%] animate-star-movement-bottom rounded-full',
          'opacity-20 dark:opacity-70',
        )}
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className={cn(
          'absolute top-[-10px] left-[-250%] z-0 h-[50%] w-[300%] animate-star-movement-top rounded-full',
          'opacity-20 dark:opacity-70',
        )}
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className={cn(
          'relative z-1 cursor-pointer rounded-[20px] border px-3 py-2 text-center text-foreground text-sm',
          'border-border/40 bg-gradient-to-b from-background/90 to-muted/90',
          'dark:border-border dark:from-background dark:to-muted',
        )}
      >
        {children}
      </div>
    </Component>
  );
}
