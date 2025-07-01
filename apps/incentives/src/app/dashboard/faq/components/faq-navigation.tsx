'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Home, HelpCircle } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb';

interface BreadcrumbItemData {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface FaqNavigationProps {
  breadcrumbItems?: BreadcrumbItemData[];
}

export const FaqNavigation = React.forwardRef<
  HTMLDivElement,
  FaqNavigationProps
>(
  (
    {
      breadcrumbItems = [
        { label: 'Points', href: '/dashboard' },
        { label: 'FAQ', isCurrentPage: true },
      ],
    },
    ref,
  ) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={`breadcrumb-${item.label}`}>
                <BreadcrumbItem>
                  {item.isCurrentPage ? (
                    <BreadcrumbPage className="inline-flex items-center gap-1.5">
                      <HelpCircle
                        size={16}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={item.href}
                      className="inline-flex items-center gap-1.5"
                    >
                      {index === 0 && (
                        <Home size={16} strokeWidth={2} aria-hidden="true" />
                      )}
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </motion.div>
    );
  },
);

FaqNavigation.displayName = 'FaqNavigation';
