'use client';

import { useEffect, useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

type MobileTooltipProps = {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
};

export function MobileTooltip({
  children,
  content,
  className,
}: MobileTooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only open the tooltip, don't toggle
    if (!open) {
      setOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      }
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Check if click is on tooltip trigger
      if (tooltipRef.current?.contains(target)) {
        return;
      }

      // Check if click is on tooltip content (which is in a portal)
      const tooltipContent = document.querySelector(
        '[data-slot="tooltip-content"]',
      );
      if (tooltipContent?.contains(target)) {
        return;
      }

      // Click is outside both trigger and content, close tooltip
      setOpen(false);
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={tooltipRef}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger
          asChild
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-label="Show tooltip"
        >
          <button type="button" className={className}>
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </div>
  );
}
