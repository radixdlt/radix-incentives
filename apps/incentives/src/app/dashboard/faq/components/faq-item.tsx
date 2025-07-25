"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "~/components/ui/button";

const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

interface FaqItemProps {
  question: string;
  answer: string;
  index: number;
}

export const FaqItem = React.forwardRef<HTMLDivElement, FaqItemProps>(
  ({ question, answer, index }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
      setIsMounted(true);
    }, []);

    return (
      <div
        ref={ref}
        className={cn(
          "group rounded-lg w-full",
          "border border-border/50",
          isOpen
            ? "bg-gradient-to-br from-background via-muted/50 to-background"
            : ""
        )}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className={cn(
            "w-full px-3 sm:px-6 py-3 sm:py-4 cursor-pointer outline-none rounded-lg bg-transparent border-none text-left transition-colors duration-200",
            isOpen
              ? ""
              : "hover:bg-white/5 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
          )}
        >
          <div className="flex items-start justify-between gap-3 w-full">
            <h3
              className={cn(
                "text-sm sm:text-base font-medium text-left leading-relaxed",
                "flex-1 min-w-0",
                isOpen ? "text-foreground" : "text-foreground/70"
              )}
              style={{
                whiteSpace: "normal",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                hyphens: "auto",
                width: "calc(100% - 3rem)",
                flexShrink: 1,
              }}
            >
              {question}
            </h3>
            <div
              className={cn(
                "p-0.5 rounded-full flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-200",
                isOpen ? "text-primary rotate-180" : "text-muted-foreground"
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
                  height: "auto",
                  opacity: 1,
                  transition: { duration: 0.2, ease: "easeOut" },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: { duration: 0.2, ease: "easeIn" },
                }}
              >
                <div className="px-3 sm:px-6 pb-3 sm:pb-4 pt-2">
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="text-muted-foreground leading-relaxed"
                    style={{
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
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
            <div className="px-3 sm:px-6 pb-3 sm:pb-4 pt-2">
              <div
                className="text-muted-foreground leading-relaxed"
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
                /* biome-ignore lint/security/noDangerouslySetInnerHtml: FAQ content is static and trusted */
                dangerouslySetInnerHTML={{ __html: answer }}
              />
            </div>
          )
        )}
      </div>
    );
  }
);

FaqItem.displayName = "FaqItem";
