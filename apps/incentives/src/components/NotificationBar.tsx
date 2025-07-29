"use client";

import { useState, useEffect, useRef } from "react";
import { X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type NotificationBarProps = {
  message: string;
  onDismiss?: () => void;
  className?: string;
};

export function NotificationBar({
  message,
  onDismiss,
  className = "",
}: NotificationBarProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [textWidth, setTextWidth] = useState(0);
  const [segmentWidth, setSegmentWidth] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScrollNeeded = () => {
      if (textRef.current && containerRef.current) {
        // Create a temporary element to measure text width with icon
        const temp = document.createElement("div");
        temp.style.visibility = "hidden";
        temp.style.position = "absolute";
        temp.style.whiteSpace = "nowrap";
        temp.style.font = window.getComputedStyle(textRef.current).font;
        temp.style.display = "flex";
        temp.style.alignItems = "center";
        temp.innerHTML = `<svg width="16" height="16" style="margin-right: 0.75rem; flex-shrink: 0;"><circle cx="8" cy="8" r="6"/></svg><span>${message}</span>`;
        document.body.appendChild(temp);

        const measuredTextWidth = temp.offsetWidth;
        const containerWidth = containerRef.current.clientWidth - 80; // Account for close button and padding

        // Measure the full segment (text + icon + spacing)
        temp.innerHTML = `<svg width="16" height="16" style="margin-right: 0.75rem; flex-shrink: 0;"><circle cx="8" cy="8" r="6"/></svg><span>${message}</span><div style="margin: 0 3rem;"></div>`;
        const measuredSegmentWidth = temp.offsetWidth;

        document.body.removeChild(temp);
        setTextWidth(measuredTextWidth);
        setSegmentWidth(measuredSegmentWidth);
        setShouldScroll(measuredTextWidth > containerWidth);
      }
    };

    // Delay the check to ensure DOM is ready
    const timeoutId = setTimeout(checkScrollNeeded, 100);

    window.addEventListener("resize", checkScrollNeeded);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkScrollNeeded);
    };
  }, [message]);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`relative overflow-hidden bg-gradient-to-r from-pink-500/50 to-purple-500/50 backdrop-blur-sm border-b border-pink-500/20 ${className}`}
        style={{
          background: "rgba(225, 52, 176, 0.5)",
        }}
      >
        <div
          ref={containerRef}
          className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto"
        >
          <div className="flex-1 min-w-0 mr-4">
            {shouldScroll ? (
              <div className="relative overflow-hidden w-full">
                <motion.div
                  ref={textRef}
                  className="whitespace-nowrap text-white font-medium flex items-center"
                  animate={{
                    x: [0, -segmentWidth],
                  }}
                  key={message}
                  transition={{
                    duration: Math.max(8, segmentWidth / 100),
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                    repeatDelay: 0,
                  }}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: animation repeat, index is safe here
                    <div key={i} className="flex items-center">
                      <Info className="w-4 h-4 mr-3 opacity-70 flex-shrink-0" />
                      <span>{message}</span>
                      <div className="mx-12" />
                    </div>
                  ))}
                </motion.div>
              </div>
            ) : (
              <div
                ref={textRef}
                className="text-white font-medium text-center whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center"
              >
                <Info className="w-4 h-4 mr-3 opacity-70 flex-shrink-0" />
                <span>{message}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors duration-200"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
