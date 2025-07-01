import { cn } from '~/lib/utils';

type GlowProps = {
  className?: string;
  variant?: 'top' | 'center';
};

export const Glow = ({ className, variant = 'top' }: GlowProps) => (
  <div
    className={cn(
      'absolute w-full',
      variant === 'top' ? 'top-0' : 'top-[50%]',
      className,
    )}
  >
    <div
      className={cn(
        'absolute left-1/2 h-[256px] w-[60%] -translate-x-1/2 scale-[2.5] rounded-[50%] bg-[radial-gradient(ellipse_at_center,_hsla(var(--brand-foreground)/.5)_10%,_hsla(var(--brand-foreground)/0)_60%)] sm:h-[512px]',
        variant === 'center' && '-translate-y-1/2',
      )}
    />
    <div
      className={cn(
        'absolute left-1/2 h-[128px] w-[40%] -translate-x-1/2 scale-[2] rounded-[50%] bg-[radial-gradient(ellipse_at_center,_hsla(var(--brand)/.3)_10%,_hsla(var(--brand-foreground)/0)_60%)] sm:h-[256px]',
        variant === 'center' && '-translate-y-1/2',
      )}
    />
  </div>
);
