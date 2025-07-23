'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, LogOut, CalendarDays, Activity, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

const navigationItems = [
  {
    title: 'Seasons',
    href: '/seasons',
    icon: <CalendarDays className="h-5 w-5" />,
  },
  {
    title: 'Activities',
    href: '/activities',
    icon: <Activity className="h-5 w-5" />,
  },
  {
    title: 'Component Whitelist',
    href: '/component-whitelist',
    icon: <Shield className="h-5 w-5" />,
  },
  {
    title: 'User Management',
    href: '/users',
    icon: <Users className="h-5 w-5" />,
  },
];

export function Sidebar({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 flex h-full w-64 flex-col border-r bg-card transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            R
          </div>
          <span>Radix Incentives</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-3">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {item.icon}
            {item.title}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t p-2">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
