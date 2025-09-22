import { type ClassValue, clsx } from 'clsx';
import {
  Coins,
  CreditCard,
  Droplet,
  FileText,
  type LucideIcon,
  Settings,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Shared formatting utilities for the incentives platform
 */

/**
 * Format currency values with locale support
 * @param value - The value to format (string or number)
 * @param locale - The locale to use (defaults to 'en-US')
 * @param options - Additional Intl.NumberFormat options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: string | number,
  locale = 'en-US',
  options?: Intl.NumberFormatOptions,
): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (Number.isNaN(num)) return '$0.00';

  // For values less than 1000, show 2 decimal places
  if (num < 1000) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(num);
  }

  // For values 1000+, show as "k" format with 1 decimal
  return `${new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    ...options,
  }).format(num / 1000)}k`;
};

/**
 * Format AP per hour values
 * @param value - The AP/hour value (string, number, or null)
 * @param locale - The locale to use (defaults to 'en-US')
 * @returns Formatted AP/hour string or null if no value
 */
export const formatAPPerHour = (
  value: string | number | null,
  locale = 'en-US',
): string | null => {
  if (value === null || value === undefined) return null;

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (Number.isNaN(num) || num === 0) return '0';

  // For very small values, show as "<0.01"
  if (num < 0.01) return '<0.01';

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Format activity points as rounded integers with locale-aware thousands separators
 * @param value - The AP value (string or number)
 * @param locale - The locale to use (defaults to 'en-US')
 * @returns Formatted AP string
 */
export const formatActivityPoints = (
  value: string | number,
  locale = 'en-US',
): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (Number.isNaN(num)) return '0';

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(Math.round(num));
};

/**
 * Format multiplier values with locale support
 * @param value - The multiplier value (string or number)
 * @param locale - The locale to use (defaults to 'en-US')
 * @returns Formatted multiplier string with 'x' suffix
 */
export const formatMultiplier = (
  value: string | number,
  locale = 'en-US',
): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (Number.isNaN(num)) return '0x';

  return `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)}x`;
};

/**
 * Format season points per week for display
 * @param value - The SP/week value (number)
 * @param locale - The locale to use (defaults to 'en-US')
 * @returns Formatted SP/week string
 */
export const formatSeasonPointsPerWeek = (
  value: number,
  locale = 'en-US',
): string => {
  if (Number.isNaN(value)) return '0k SP/week';

  return `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / 1000)}k SP/week`;
};

/**
 * Format milestone rewards (XRD amounts) with locale support
 * @param rewardXrd - The reward amount in XRD (string or number)
 * @param locale - The locale to use (defaults to 'en-US')
 * @returns Formatted reward string (e.g., "5M XRD", "500K XRD")
 */
export const formatMilestoneReward = (
  rewardXrd: string | number,
  locale = 'en-US',
): string => {
  const num = typeof rewardXrd === 'string' ? parseFloat(rewardXrd) : rewardXrd;

  if (Number.isNaN(num) || num === 0) return '0 XRD';

  // Convert to millions for display (divide by 1,000,000)
  const millions = num / 1000000;

  if (millions >= 1) {
    // Show as "XM XRD" for values 1M and above
    return `${new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(millions)}M XRD`;
  }

  // Show as "XK XRD" for values under 1M
  const thousands = num / 1000;
  return `${new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(thousands)}K XRD`;
};

/**
 * Format activity names from camelCase IDs to readable names
 * @param activityId - The activity ID in camelCase
 * @param activityName - The explicit activity name if available
 * @returns Formatted activity name
 */
export const formatActivityName = (
  activityId: string,
  activityName?: string | null,
): string => {
  if (activityName) {
    return activityName;
  }

  return activityId
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

/**
 * Category behavior constants and utilities
 */

// Categories that don't have capital at work (volume/fee-based)
export const VOLUME_FEE_CATEGORIES = [
  'transactionFees',
  'tradingVolume',
  'componentCalls',
] as const;

// Categories that don't earn AP directly
export const NON_AP_CATEGORIES = ['maintainXrdBalance'] as const;

// Categories excluded from various filtering operations
export const EXCLUDED_CATEGORIES = ['lendingNative', 'common'] as const;

export type VolumeFeeCategory = (typeof VOLUME_FEE_CATEGORIES)[number];
export type NonAPCategory = (typeof NON_AP_CATEGORIES)[number];
export type ExcludedCategory = (typeof EXCLUDED_CATEGORIES)[number];

/**
 * Check if a category is volume/fee-based (no capital at work)
 */
export const isVolumeFeeCategory = (
  categoryId: string,
): categoryId is VolumeFeeCategory => {
  return VOLUME_FEE_CATEGORIES.includes(categoryId as VolumeFeeCategory);
};

/**
 * Check if a category earns Activity Points
 */
export const earnsActivityPoints = (categoryId: string): boolean => {
  return !NON_AP_CATEGORIES.includes(categoryId as NonAPCategory);
};

/**
 * Check if a category has capital at work metrics
 */
export const hasCapitalAtWork = (categoryId: string): boolean => {
  return !isVolumeFeeCategory(categoryId);
};

/**
 * Check if a category should show AP/hour
 */
export const showsAPPerHour = (categoryId: string): boolean => {
  return earnsActivityPoints(categoryId) && !isVolumeFeeCategory(categoryId);
};

/**
 * Check if a category is the XRD balance maintainer
 */
export const isMaintainXrdBalance = (
  categoryId: string,
): categoryId is NonAPCategory => {
  return categoryId === 'maintainXrdBalance';
};

/**
 * Check if a category should be excluded from general filtering
 */
export const isExcludedCategory = (
  categoryId: string,
): categoryId is ExcludedCategory => {
  return EXCLUDED_CATEGORIES.includes(categoryId as ExcludedCategory);
};

/**
 * Icon mapping utilities
 */

export const ICON_MAP = {
  Coins,
  CreditCard,
  Droplet,
  FileText,
  Settings,
  TrendingUp,
  Wallet,
} as const;

export type IconName = keyof typeof ICON_MAP;

/**
 * Get a Lucide icon component by name, with FileText as fallback
 * @param iconName - The name of the icon
 * @returns The icon component
 */
export const getIcon = (iconName?: string): LucideIcon => {
  if (!iconName) return FileText;
  return ICON_MAP[iconName as IconName] || FileText;
};

/**
 * Get token logo path from ticker symbol
 * @param ticker - The token ticker (e.g., 'xrd', 'btc')
 * @returns The path to the token logo
 */
export const getTokenLogo = (ticker: string): string => {
  return `/token-logos/${ticker.toLowerCase()}-logo.png`;
};

export function getNextUpdateTime() {
  const currentTime = new Date();
  const utcHour = currentTime.getUTCHours();
  const minutes = currentTime.getUTCMinutes();

  const nextUpdateMinutes = 60 - minutes;
  const nextUpdateHour = utcHour % 2 === 0 ? 1 : 0;

  currentTime.setUTCHours(nextUpdateHour, 0, 0, 0);

  const formatted = nextUpdateHour
    ? `${nextUpdateHour}h ${nextUpdateMinutes}m`
    : `${nextUpdateMinutes}m`;

  return formatted;
}
