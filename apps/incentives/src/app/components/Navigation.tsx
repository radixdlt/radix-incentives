import { Logo } from '~/components/Logo';
import { Button } from '~/components/ui/button';
import { useDappToolkit } from '~/lib/hooks/useRdt';
import Link from 'next/link';

export const Navigation = () => {
  const rdt = useDappToolkit();

  return (
    <nav className="relative z-20 w-full px-6 py-3 ">
      <div className=" mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Logo />
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="flex items-center">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Open app
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
