'use client';
import { Share2 } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

type ShareButtonProps = {
  referralLink: string;
  size?: 'sm' | 'md' | 'lg';
};

export function ShareButton({ referralLink, size = 'md' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const encodedUrl = encodeURIComponent(referralLink);
  const shareText = encodeURIComponent(
    'Join me on Radix Rewards and earn XRD incentives! 🚀',
  );

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${shareText}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${shareText}`,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Radix Rewards',
          text: 'Join me on Radix Rewards and earn XRD incentives!',
          url: referralLink,
        });
      } catch (err) {
        // User cancelled or share failed
        console.error('Share failed:', err);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-4 w-4',
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground text-xs transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          title="Share referral link"
        >
          <Share2 className={iconSizeClasses[size]} />
          <span>Share</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer items-center gap-2"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-label="X logo"
            >
              <title>X logo</title>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={shareLinks.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer items-center gap-2"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-label="Telegram logo"
            >
              <title>Telegram logo</title>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
            Share on Telegram
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={shareLinks.reddit}
            target="_blank"
            rel="noopener noreferrer"
            className="flex cursor-pointer items-center gap-2"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-label="Reddit logo"
            >
              <title>Reddit logo</title>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5.89 9.89c.02.14.03.29.03.44 0 2.24-2.61 4.06-5.83 4.06s-5.83-1.82-5.83-4.06c0-.15.01-.3.03-.44-.49-.15-.85-.6-.85-1.13 0-.66.54-1.2 1.2-1.2.33 0 .63.13.85.35.84-.58 1.99-.96 3.27-1.01l.62-2.82c.02-.08.08-.14.16-.16l2.06-.45c.13-.39.49-.66.91-.66.54 0 .98.44.98.98s-.44.98-.98.98c-.47 0-.86-.33-.96-.77l-1.86.41-.55 2.53c1.25.06 2.37.44 3.19 1.01.22-.21.51-.34.84-.34.66 0 1.2.54 1.2 1.2 0 .53-.35.98-.85 1.13zm-2.61 1.07c-.37 0-.66.3-.66.66 0 .37.3.66.66.66.37 0 .66-.3.66-.66 0-.37-.3-.66-.66-.66zm-3.56 0c-.37 0-.66.3-.66.66 0 .37.3.66.66.66.37 0 .66-.3.66-.66 0-.37-.3-.66-.66-.66zm4.44 2.55c-.51.51-1.49.77-2.28.77-.79 0-1.77-.26-2.28-.77-.09-.09-.24-.09-.33 0-.09.09-.09.24 0 .33.62.62 1.75.94 2.61.94.86 0 1.99-.32 2.61-.94.09-.09.09-.24 0-.33-.09-.09-.24-.09-.33 0z" />
            </svg>
            Share on Reddit
          </a>
        </DropdownMenuItem>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <DropdownMenuItem
            onSelect={handleNativeShare}
            className="cursor-pointer"
          >
            <Share2 className="mr-2 h-4 w-4" />
            More options
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={handleCopyLink} className="cursor-pointer">
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-label="Copy icon"
          >
            <title>Copy icon</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
