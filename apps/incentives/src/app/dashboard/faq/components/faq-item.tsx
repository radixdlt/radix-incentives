'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from '~/components/ui/button';

const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

interface FaqItemProps {
  question: string;
  answer: string;
  index: number;
}

export const FaqItem = React.forwardRef<HTMLDivElement, FaqItemProps>(
  ({ question, answer, index }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.1 }}
        className={cn(
          'group rounded-lg w-full',
          'transition-all duration-200 ease-in-out',
          'border border-border/50',
          isOpen
            ? 'bg-gradient-to-br from-background via-muted/50 to-background'
            : 'hover:bg-muted/50',
        )}
      >
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 sm:px-6 py-3 sm:py-4 h-auto hover:bg-transparent"
        >
          <div className="flex items-start justify-between gap-3 w-full">
            <h3
              className={cn(
                'text-sm sm:text-base font-medium transition-colors duration-200 text-left leading-relaxed',
                'text-foreground/70',
                'flex-1 min-w-0 max-w-full',
                isOpen ? 'text-foreground' : '',
              )}
              style={{
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                width: '100%',
                maxWidth: 'calc(100% - 3rem)',
              }}
            >
              {question}
            </h3>
            <motion.div
              animate={{
                rotate: isOpen ? 180 : 0,
                scale: isOpen ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={cn(
                'p-0.5 rounded-full flex-shrink-0',
                'transition-colors duration-200',
                isOpen ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </div>
        </Button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: 'auto',
                opacity: 1,
                transition: { duration: 0.2, ease: 'easeOut' },
              }}
              exit={{
                height: 0,
                opacity: 0,
                transition: { duration: 0.2, ease: 'easeIn' },
              }}
            >
              <div className="px-3 sm:px-6 pb-3 sm:pb-4 pt-2">
                <motion.p
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  className="text-muted-foreground leading-relaxed"
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: answer }} />
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

FaqItem.displayName = 'FaqItem';
