import { ArrowLeftIcon } from 'lucide-react';
import { cn } from '~/lib/utils';

export function PageHeader({
  onBackClick,
  children,
  className,
}: {
  onBackClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4 flex items-center gap-4', className)}>
      {onBackClick && (
        <ArrowLeftIcon
          className="size-4 hover:cursor-pointer"
          onClick={onBackClick}
        />
      )}
      <h1 className="font-bold text-2xl">{children}</h1>
    </div>
  );
}
