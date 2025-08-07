'use client';

import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import * as React from 'react';
import { Button } from '~/components/ui/button';

export const ContactSection = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-8 rounded-lg border border-border/50 bg-muted/50 p-4 text-center sm:mt-16 sm:p-8"
      {...props}
    >
      <div className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
        <HelpCircle className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
      </div>
      <h3 className="mb-2 font-semibold text-lg sm:text-xl">
        Still have questions?
      </h3>
      <p className="mb-4 px-2 text-muted-foreground text-sm leading-relaxed sm:mb-6 sm:text-base">
        Can't find the answer you're looking for? Join our community discord or
        reach out to our support team.
      </p>
      <div className="flex flex-col justify-center gap-2 sm:flex-row sm:gap-3">
        <Button variant="outline" size="sm" className="sm:h-10 sm:px-4 sm:py-2">
          Join Discord
        </Button>
        <Button size="sm" className="sm:h-10 sm:px-4 sm:py-2">
          Contact Support
        </Button>
      </div>
    </motion.div>
  );
});

ContactSection.displayName = 'ContactSection';
