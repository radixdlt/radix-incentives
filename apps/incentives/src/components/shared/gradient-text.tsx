import type { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  withDropShadow?: boolean;
}

export const GradientText = ({
  children,
  className = '',
  withDropShadow = false,
}: GradientTextProps) => {
  const baseStyle = {
    background: 'linear-gradient(90deg, #ffddf3 0%, #e134b0 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    display: 'inline-block',
  };

  const style = withDropShadow
    ? {
        ...baseStyle,
        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.6))',
      }
    : baseStyle;

  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
};
