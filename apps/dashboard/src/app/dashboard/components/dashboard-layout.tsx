"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { RadixConnectButton } from "./RadixConnectButton";
import { Sidebar, SidebarBody, SidebarLink } from "~/components/ui/sidebar";
import {
  Home,
  Activity,
  DollarSign,
  List,
  Users,
  Settings,
  Vote,
} from "lucide-react";

const navItems = [
  // {
  //   label: "Dashboard",
  //   href: "/dashboard",
  //   icon: (
  //     <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
  //   ),
  // },
  // {
  //   label: "Activity",
  //   href: "/dashboard/activity",
  //   icon: (
  //     <Activity className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
  //   ),
  // },
  // {
  //   label: "Multiplier",
  //   href: "/dashboard/multiplier",
  //   icon: (
  //     <DollarSign className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
  //   ),
  // },
  // {
  //   label: "Leaderboard",
  //   href: "/dashboard/leaderboard",
  //   icon: (
  //     <List className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
  //   ),
  // },
  {
    label: "Accounts",
    href: "/dashboard/accounts",
    icon: (
      <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Voting",
    href: "/dashboard/voting",
    icon: (
      <Vote className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
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
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <title>Radix Incentives</title>
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <span>Radix Incentives</span>
          </Link>
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
                  <SidebarLink key={link.href} link={link} />
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
