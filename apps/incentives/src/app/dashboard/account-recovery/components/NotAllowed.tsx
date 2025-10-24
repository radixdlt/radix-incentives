import { XCircleIcon } from 'lucide-react';
import { Card } from '~/components/ui/card';

export function NotAllowed() {
  return (
    <Card className="mx-auto w-fit">
      <div className="flex shrink justify-center gap-2 p-5">
        <XCircleIcon className="text-red-500" />
        <span>
          User has connected accounts. Log out and connect an empty persona to
          start account recovery.
        </span>
      </div>
    </Card>
  );
}
