'use client';

import {
  ChevronLeft,
  ChevronRight,
  Gift,
  HelpCircle,
  Home,
  List,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { Footer } from '~/components/Footer';
import { Logo } from '~/components/Logo';
import { NotificationBar } from '~/components/NotificationBar';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import { api } from '~/trpc/react';
import { RadixConnectButton } from './RadixConnectButton';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: publicConfig } = api.config.getPublicConfig.useQuery();
  const { data: seasons } = api.season.getSeasons.useQuery();

  const isLimitAccessEnabled =
    publicConfig?.NEXT_PUBLIC_LIMIT_ACCESS_ENABLED ?? false;

  const notification = publicConfig?.notification;

  const hasActiveSeason = seasons?.some((s) => s.status === 'active') ?? true;
  const isSeasonOver = seasons !== undefined && !hasActiveSeason;

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <Home className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      hide: isLimitAccessEnabled,
    },
    {
      label: 'Rewards',
      href: '/dashboard/season-reward',
      icon: (
        <Gift className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      hide: !isSeasonOver || isLimitAccessEnabled,
    },
    {
      label: 'Ranking',
      href: '/dashboard/leaderboard',
      icon: (
        <List className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      hide: isLimitAccessEnabled,
    },
    {
      label: 'Accounts',
      href: '/dashboard/accounts',
      icon: (
        <Users className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      hide: false,
    },
    {
      label: 'FAQ',
      href: '/dashboard/faq',
      icon: (
        <HelpCircle className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      hide: false,
    },
  ];

  // Mobile navigation items (filtered same as desktop)
  const mobileNavItems = navItems.filter((item) => !item.hide);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Notification Bar */}
      {notification?.enabled && (
        <NotificationBar message={notification.message} />
      )}

      {/* Top Navigation Bar */}
      <header
        className="sticky top-0 z-50 w-full border-white/10 border-b"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          borderTop: 'none',
        }}
      >
        <div
          className="flex items-center justify-between px-6"
          style={{ height: '64px' }}
        >
          <div className="flex items-center gap-3">
            <Logo />
          </div>
          <div className="flex items-center">
            <RadixConnectButton />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="glass-card grid-pattern-sm sticky top-[65px] hidden h-[calc(100vh-65px)] flex-col border-white/10 border-r md:flex">
          <div
            className={cn(
              'flex h-full flex-col transition-all duration-300 ease-in-out',
              isCollapsed ? 'w-20' : 'w-64',
            )}
          >
            {/* Sidebar Toggle - Sticky */}
            <div className="sticky top-0 z-10 border-white/10 border-b bg-inherit px-3 py-3">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-10 w-full border border-white/10 bg-white/5 transition-all duration-300 hover:bg-white/10',
                  isCollapsed ? 'justify-center px-0' : 'justify-between px-3',
                )}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {!isCollapsed && (
                  <span className="font-medium text-sm text-white/70">
                    Navigation
                  </span>
                )}
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-4">
              <div className="space-y-2">
                {navItems
                  .filter((item) => !item.hide)
                  .map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'hover-lift flex items-center rounded-xl py-3 font-medium text-sm transition-all duration-300',
                          isCollapsed ? 'justify-center px-3' : 'gap-3 px-3',
                          isActive
                            ? 'glass glow-brand gradient-brand text-white'
                            : 'hover:glass text-white/70 hover:bg-white/10 hover:text-white',
                        )}
                      >
                        <div className="flex-shrink-0">
                          {React.cloneElement(item.icon, {
                            className: cn(
                              'h-5 w-5 transition-all duration-300',
                              isActive ? 'text-white' : 'text-white/70',
                            ),
                          })}
                        </div>
                        {!isCollapsed && (
                          <span className="truncate font-medium">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </nav>
          </div>
        </aside>

        {/* Mobile Bottom Navigation */}
        <div className="fixed right-0 bottom-0 left-0 z-50 md:hidden">
          <nav className="glass grid-pattern-sm border-white/10 border-t">
            <div className="relative flex items-center justify-around px-2 py-2">
              {mobileNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'hover-lift flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-3 py-3 transition-all duration-300',
                      isActive
                        ? 'glass glow-brand gradient-brand text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <div className="flex-shrink-0">
                      {React.cloneElement(item.icon, {
                        className: cn(
                          'h-5 w-5 transition-all duration-300',
                          isActive ? 'text-white' : 'text-white/70',
                        ),
                      })}
                    </div>
                    <span className="truncate font-medium text-xs">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div
            className={cn(
              'overflow-y-auto overflow-x-hidden p-6 md:p-8',
              'pb-24 md:pb-8', // Add bottom padding on mobile for bottom nav
            )}
          >
            {/* Content wrapper with min height */}
            <div style={{ minHeight: '90vh' }}>{children}</div>

            {/* Footer - Inside main content so sidebar goes through */}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};
