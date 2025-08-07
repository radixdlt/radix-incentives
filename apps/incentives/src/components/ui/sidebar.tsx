'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import type { LinkProps } from 'next/link'; // Type-only import
import Link from 'next/link'; // Keep default import for usage
import type React from 'react'; // Make React import type-only
import type { JSX, ReactNode } from 'react'; // Type-only imports
import { createContext, useContext, useState } from 'react'; // Keep specific hooks
import { cn } from '~/lib/utils'; // Adjusted path

interface Links {
  label: string;
  href: string;
  icon: JSX.Element | ReactNode; // Use imported types
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined,
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return {
    open: context.open,
    setOpen: (value: boolean) => {
      return context.setOpen(value);
    },
  };
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<'div'>)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  return (
    <motion.div
      className={cn(
        'hidden h-full w-[300px] flex-shrink-0 px-4 py-4 md:flex md:flex-col',
        className,
      )}
      style={{ width: '300px' }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) => {
  const { open, setOpen } = useSidebar();

  // Combined handler for toggle actions
  const handleToggle = () => {
    setOpen(!open);
  };

  // Keyboard handler for toggle actions
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleToggle();
    }
  };

  return (
    <div
      className={cn(
        'flex h-10 h-full flex-row items-center justify-between bg-neutral-100 px-4 py-4 md:hidden dark:bg-neutral-800',
      )}
      {...props}
    >
      <div className="z-20 flex w-full justify-end">
        {/* Use button element for semantics and accessibility */}
        <button
          type="button"
          className="cursor-pointer rounded p-1 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-ring dark:text-neutral-200"
          onClick={() => handleToggle()}
          onKeyDown={handleKeyDown}
          aria-label={open ? 'Close sidebar' : 'Open sidebar'}
          aria-expanded={open}
        >
          <Menu />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
            }}
            className={cn(
              'fixed inset-0 z-[100] flex h-full w-full flex-col justify-between bg-white p-10 dark:bg-neutral-900',
              className,
            )}
          >
            {/* Add accessibility handlers to the close button */}
            <button
              type="button"
              className="absolute top-10 right-10 z-50 cursor-pointer rounded p-1 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-ring dark:text-neutral-200"
              onClick={handleToggle}
              onKeyDown={handleKeyDown}
              aria-label="Close sidebar"
            >
              <X />
            </button>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
  pathname,
  ...props
}: {
  link: Links;
  className?: string;
  pathname: string;
  props?: LinkProps;
}) => {
  const { setOpen } = useSidebar();
  const isActive = pathname === link.href;

  const handleClick = () => {
    setOpen(false);
  };

  return (
    <Link
      href={link.href}
      className={cn(
        'group/sidebar flex items-center justify-start gap-2 rounded-md px-3 py-2 font-medium text-sm transition-colors',
        isActive
          ? 'bg-muted text-primary hover:text-primary'
          : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      {link.icon}

      <span
        className={cn(
          'inline-block whitespace-pre font-medium text-neutral-700 dark:text-neutral-200',
        )}
      >
        {link.label}
      </span>
    </Link>
  );
};
