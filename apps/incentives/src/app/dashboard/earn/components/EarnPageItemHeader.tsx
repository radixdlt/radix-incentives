import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '~/components/ui/button';

export const EarnPageItemHeader = () => {
  return (
    <div className="flex items-center gap-4">
      <Link href="/dashboard/earn">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Earn
        </Button>
      </Link>
    </div>
  );
};
