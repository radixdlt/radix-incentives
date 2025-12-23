import { ArrowLeft } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

export function PageHeader({
  onBackClick,
  backLabel = 'Back',
  children,
  className,
}: {
  onBackClick?: () => void;
  backLabel?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 space-y-4', className)}>
      {onBackClick && (
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBackClick}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Button>
        </div>
      )}
      {children && <h1 className="font-bold text-2xl">{children}</h1>}
    </div>
  );
}
