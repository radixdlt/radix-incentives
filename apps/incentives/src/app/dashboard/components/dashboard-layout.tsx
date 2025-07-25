'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { RadixConnectButton } from "./RadixConnectButton";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  Home,
  List,
  Users,
  HelpCircle,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Logo } from "~/components/Logo";
import { api } from '~/trpc/react';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: publicConfig } = api.config.getPublicConfig.useQuery();

  const isLimitAccessEnabled =
    publicConfig?.NEXT_PUBLIC_LIMIT_ACCESS_ENABLED ?? false;

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      hide: isLimitAccessEnabled,
    },
    {
      label: 'Earn',
      href: '/dashboard/earn',
      icon: (
        <Target className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      hide: isLimitAccessEnabled,
    },
    {
      label: 'Ranking',
      href: '/dashboard/leaderboard',
      icon: (
        <List className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      hide: isLimitAccessEnabled,
    },
    {
      label: 'Accounts',
      href: '/dashboard/accounts',
      icon: (
        <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      hide: false,
    },
    {
      label: 'FAQ',
      href: '/dashboard/faq',
      icon: (
        <HelpCircle className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      hide: false,
    },
  ];

  // Mobile navigation items (filtered same as desktop)
  const mobileNavItems = navItems.filter((item) => !item.hide);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full glass border-b border-white/10">
        <div className="flex h-16 items-center justify-between px-6">
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
      <aside className="hidden md:flex flex-col glass-card border-r border-white/10 grid-pattern-sm sticky top-16 h-[calc(100vh-4rem)]">
        <div className={cn(
          "flex flex-col h-full transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}>
          {/* Sidebar Toggle - Sticky */}
          <div className="px-3 py-3 border-b border-white/10 sticky top-0 bg-inherit z-10">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-10 w-full transition-all duration-300 hover:bg-white/10 btn-glass",
                isCollapsed ? "px-0 justify-center" : "justify-between px-3"
              )}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {!isCollapsed && (
                <span className="text-sm text-white/70 font-medium">Navigation</span>
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
                        "flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-300 hover-lift",
                        isCollapsed ? "justify-center px-3" : "gap-3 px-3",
                        isActive
                          ? "glass text-white glow-brand gradient-brand"
                          : "text-white/70 hover:text-white hover:bg-white/10 hover:glass"
                      )}
                    >
                      <div className="flex-shrink-0">
                        {React.cloneElement(item.icon, {
                          className: cn(
                            "h-5 w-5 transition-all duration-300",
                            isActive ? "text-white" : "text-white/70"
                          )
                        })}
                      </div>
                      {!isCollapsed && (
                        <span className="truncate font-medium">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
            </div>
          </nav>

        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <nav className="glass border-t border-white/10 grid-pattern-sm">
          <div className="relative flex items-center justify-around px-2 py-2">
            {mobileNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-3 rounded-xl transition-all duration-300 min-w-0 flex-1 hover-lift",
                    isActive
                      ? "glass text-white glow-brand gradient-brand"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  <div className="flex-shrink-0">
                    {React.cloneElement(item.icon, {
                      className: cn(
                        "h-5 w-5 transition-all duration-300",
                        isActive ? "text-white" : "text-white/70"
                      )
                    })}
                  </div>
                  <span className="text-xs font-medium truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className={cn(
          "h-full overflow-y-auto p-6 md:p-8",
          "pb-24 md:pb-8" // Add bottom padding on mobile for bottom nav
        )}>
          {children}
        </div>
      </main>
      </div>
    </div>
  );
};
