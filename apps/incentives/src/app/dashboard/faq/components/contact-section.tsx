'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';

export const ContactSection = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-16 text-center p-8 rounded-lg bg-muted/50 border border-border/50"
      {...props}
    >
      <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
        <HelpCircle className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
      <p className="text-muted-foreground mb-6">
        Can't find the answer you're looking for? Join our community discord or
        reach out to our support team.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" size="lg">
          Join Discord
        </Button>
        <Button size="lg">Contact Support</Button>
      </div>
    </motion.div>
  );
});

ContactSection.displayName = 'ContactSection';
