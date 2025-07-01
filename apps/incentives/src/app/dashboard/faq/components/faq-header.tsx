'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

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
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      </motion.div>
    );
  },
);

FaqHeader.displayName = 'FaqHeader';
