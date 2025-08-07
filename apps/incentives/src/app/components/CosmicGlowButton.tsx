import { cn } from '~/lib/utils';

type CosmicGlowButtonProps = {
  className?: string;
  color?: string;
  speed?: string;
  children?: React.ReactNode;
  onClick?: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const CosmicGlowButton = ({
  className,
  color,
  speed = '5s',
  children,
  onClick,
  ...props
}: CosmicGlowButtonProps) => {
  const glowColor = color || 'hsl(var(--foreground))';
  const content = children ?? 'Click me';

  return (
    <button
      className={cn(
        'relative inline-flex cursor-pointer items-center justify-center rounded-2xl px-8 py-4 font-semibold text-base',
        'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900',
        'text-white shadow-[rgba(0,0,0,0.4)] shadow-lg',
        'overflow-hidden',
        className,
      )}
      onClick={onClick}
      {...props}
    >
      <span
        className="absolute inset-0 animate-glow-scale rounded-2xl opacity-40 blur-lg"
        style={{
          background: `radial-gradient(circle at center, ${glowColor} 10%, transparent 60%)`,
          animationDuration: speed,
          zIndex: 0,
        }}
      />
      <span
        className="absolute inset-0 animate-glow-slide rounded-2xl opacity-20"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, transparent 0deg, ${glowColor} 120deg, transparent 240deg)`,
          animationDuration: speed,
          zIndex: 0,
        }}
      />
      <span className="relative z-10">{content}</span>
    </button>
  );
};
