'use client';

import { motion } from 'framer-motion';
import * as React from 'react';

interface FaqHeaderProps {
  title?: string;
  description?: string;
}

export const FaqHeader = React.forwardRef<HTMLDivElement, FaqHeaderProps>(
  (
    {
      title = 'Frequently Asked Questions',
      description = 'Find answers to common questions about the Radix Incentives Program, qualification requirements, points calculation, and reward claiming process.',
    },
    ref,
  ) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8 text-center sm:mb-12"
      >
        <h1 className="mb-3 bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text font-bold text-2xl text-transparent leading-tight sm:mb-4 sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        <p className="mx-auto max-w-2xl px-2 text-muted-foreground text-sm leading-relaxed sm:text-base lg:text-lg">
          {description}
        </p>
      </motion.div>
    );
  },
);

FaqHeader.displayName = 'FaqHeader';
