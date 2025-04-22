"use client";

import { cn } from "~/lib/utils"; // Adjusted path
import Link from "next/link"; // Keep default import for usage
import type { LinkProps } from "next/link"; // Type-only import
import type React from "react"; // Make React import type-only
import { useState, createContext, useContext, useEffect } from "react"; // Keep specific hooks
import type { ReactNode, JSX } from "react"; // Type-only imports
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

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
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
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
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open } = useSidebar();

  return (
    <motion.div
      className={cn(
        "h-full px-4 py-4 hidden md:flex md:flex-col  w-[300px] flex-shrink-0",
        className
      )}
      style={{ width: "300px" }}
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
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();

  // Combined handler for toggle actions
  const handleToggle = () => {
    setOpen(!open);
  };

  // Keyboard handler for toggle actions
  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      handleToggle();
    }
  };

  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-neutral-100 dark:bg-neutral-800 h-full"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          {/* Use button element for semantics and accessibility */}
          <button
            type="button"
            className="text-neutral-800 dark:text-neutral-200 cursor-pointer p-1 rounded focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={() => handleToggle()}
            onKeyDown={handleKeyDown}
            aria-label={open ? "Close sidebar" : "Open sidebar"}
            aria-expanded={open}
          >
            <Menu />
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >
              {/* Add accessibility handlers to the close button */}
              <button
                type="button"
                className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200 cursor-pointer p-1 rounded focus:outline-none focus:ring-2 focus:ring-ring"
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
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: LinkProps;
}) => {
  const { open } = useSidebar();
  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2",
        className
      )}
      {...props}
    >
      {link.icon}
      <motion.span className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0">
        {link.label}
      </motion.span>
    </Link>
  );
};
