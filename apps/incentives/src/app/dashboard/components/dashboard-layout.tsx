'use client';

import Link from 'next/link';
import { redirect, usePathname } from 'next/navigation';
import { useState } from 'react';
import { RadixConnectButton } from './RadixConnectButton';
import { Sidebar, SidebarBody, SidebarLink } from '~/components/ui/sidebar';
import Image from 'next/image';
import {
  Home,
  Activity,
  DollarSign,
  List,
  Users,
  Settings,
  Vote,
  HelpCircle,
  Target,
} from 'lucide-react';
import { Logo } from '~/components/Logo';

const navItems = [
  // TODO: Implement these
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: 'Earn',
    href: '/dashboard/earn',
    icon: (
      <Target className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  // {
  //   label: 'Activity',
  //   href: '/dashboard/activity',
  //   icon: (
  //     <Activity className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
  //   ),
  // },
  // {
  //   label: 'Multiplier',
  //   href: '/dashboard/multiplier',
  //   icon: (
  //     <DollarSign className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
  //   ),
  // },
  {
    label: 'Leaderboard',
    href: '/dashboard/leaderboard',
    icon: (
      <List className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: 'Accounts',
    href: '/dashboard/accounts',
    icon: (
      <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: 'FAQ',
    href: '/dashboard/faq',
    icon: (
      <HelpCircle className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
];

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
        <div className="flex flex-1 items-center gap-2">
          <Logo />
        </div>
        <nav className="flex items-center gap-2">
          <RadixConnectButton />
        </nav>
      </header>
      <div className="flex flex-1 h-full">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              <div className="flex flex-col gap-2 px-4">
                {navItems.map((link) => (
                  <SidebarLink
                    key={link.href}
                    link={link}
                    pathname={pathname}
                  />
                ))}
              </div>
            </div>
          </SidebarBody>
        </Sidebar>
        <main className="flex-1 p-4 md:p-6 bg-muted/50 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
