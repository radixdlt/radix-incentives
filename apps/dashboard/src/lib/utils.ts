import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines classNames with tailwind's preferred merge strategy
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
