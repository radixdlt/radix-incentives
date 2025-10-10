import { ArrowRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type GradientButtonVariant = 'primary' | 'secondary';

interface GradientButtonProps {
  children: ReactNode;
  variant?: GradientButtonVariant;
  href?: string;
  onClick?: () => void;
  className?: string;
  showArrow?: boolean;
  icon?: LucideIcon;
  external?: boolean;
}

const variants = {
  primary: {
    gradient: 'from-[#FF43CA] to-[#21FFBE]',
    color: 'white',
  },
  secondary: {
    background: '#FF43CA',
    border: '#FF43CA',
    color: 'white',
  },
};

export const GradientButton = ({
  children,
  variant = 'primary',
  href,
  onClick,
  className = '',
  showArrow = true,
  icon: Icon,
  external = false,
}: GradientButtonProps) => {
  const isPrimary = variant === 'primary';
  const baseClasses = isPrimary
    ? `group cursor-pointer rounded-full bg-gradient-to-r ${variants[variant].gradient} px-3 py-1.5 font-medium text-sm transition-all duration-300 ease-out hover:scale-105 md:px-4 md:py-2 md:text-base inline-flex items-center gap-2`
    : `group cursor-pointer rounded-full backdrop-blur-sm px-3 py-1.5 font-medium text-sm transition-all duration-300 ease-out hover:scale-105 md:px-4 md:py-2 md:text-base inline-flex items-center gap-2`;

  const style = isPrimary
    ? {
        color: variants[variant].color,
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
      }
    : {
        background: variants.secondary.background,
        border: `1px solid ${variants.secondary.border}`,
        color: variants.secondary.color,
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
      };

  const content = (
    <>
      {children}
      {showArrow && (
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      )}
      {Icon && <Icon className="h-5 w-5" />}
    </>
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClasses} ${className}`}
          style={style}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        type="button"
        className={`${baseClasses} ${className}`}
        style={style}
      >
        {content}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseClasses} ${className}`}
      style={style}
    >
      {content}
    </button>
  );
};
