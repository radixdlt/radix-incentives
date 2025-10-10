import Image from 'next/image';

interface StarBackgroundProps {
  variant?: 'left' | 'center';
  opacity?: number;
  className?: string;
}

export const StarBackground = ({
  variant = 'left',
  opacity = 0.5,
  className = '',
}: StarBackgroundProps) => {
  const styles = {
    left: {
      top: '-12px',
      left: '-38px',
      width: '300px',
      height: '200px',
      transform: 'none',
    },
    center: {
      top: 'calc(50% - 15px)',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '800px',
      height: '400px',
    },
  };

  return (
    <Image
      src="/assets/star.png"
      alt=""
      width={variant === 'left' ? 300 : 800}
      height={variant === 'left' ? 200 : 400}
      className={`absolute ${className}`}
      style={{
        ...styles[variant],
        opacity,
        objectFit: 'fill',
      }}
    />
  );
};
