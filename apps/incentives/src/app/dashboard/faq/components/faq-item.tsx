'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';

const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

interface FaqItemProps {
  question: string;
  answer: string;
  index: number;
}

export const FaqItem = React.forwardRef<HTMLDivElement, FaqItemProps>(
  ({ question, answer }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
      setIsMounted(true);
    }, []);

    return (
      <div
        ref={ref}
        className={cn(
          'group w-full rounded-lg',
          'border border-border/50',
          isOpen
            ? 'bg-gradient-to-br from-background via-muted/50 to-background'
            : '',
        )}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className={cn(
            'w-full cursor-pointer rounded-lg border-none bg-transparent px-3 py-3 text-left outline-none transition-colors duration-200 sm:px-6 sm:py-4',
            isOpen
              ? ''
              : 'hover:bg-white/5 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2',
          )}
        >
          <div className="flex w-full items-start justify-between gap-3">
            <h3
              className={cn(
                'text-left font-medium text-sm leading-relaxed sm:text-base',
                'min-w-0 flex-1',
                isOpen ? 'text-foreground' : 'text-foreground/70',
              )}
              style={{
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                width: 'calc(100% - 3rem)',
                flexShrink: 1,
              }}
            >
              {question}
            </h3>
            <div
              className={cn(
                'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full p-0.5 transition-transform duration-200',
                isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground',
              )}
            >
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </button>
        {isMounted ? (
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
                <div className="px-3 pt-2 pb-3 sm:px-6 sm:pb-4">
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="text-muted-foreground leading-relaxed"
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                    /* biome-ignore lint/security/noDangerouslySetInnerHtml: FAQ content is static and trusted */
                    dangerouslySetInnerHTML={{ __html: answer }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          isOpen && (
            <div className="px-3 pt-2 pb-3 sm:px-6 sm:pb-4">
              <div
                className="text-muted-foreground leading-relaxed"
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                }}
                /* biome-ignore lint/security/noDangerouslySetInnerHtml: FAQ content is static and trusted */
                dangerouslySetInnerHTML={{ __html: answer }}
              />
            </div>
          )
        )}
      </div>
    );
  },
);

FaqItem.displayName = 'FaqItem';
