import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate the next update time for scheduled calculations
 * Updates occur every 2 hours at the top of even hours (00:00, 02:00, 04:00, etc.)
 */
export function getNextUpdateTime(): Date {
  const now = new Date()
  const nextUpdate = new Date(now)
  
  // Set minutes and seconds to 0
  nextUpdate.setMinutes(0, 0, 0)
  
  // Get current hour and calculate next even hour
  const currentHour = now.getHours()
  const nextEvenHour = Math.ceil(currentHour / 2) * 2
  
  if (nextEvenHour === currentHour && now.getMinutes() === 0) {
    // If we're exactly at an update time, next update is in 2 hours
    nextUpdate.setHours(currentHour + 2)
  } else {
    // Otherwise, set to the next even hour
    nextUpdate.setHours(nextEvenHour)
  }
  
  // Handle day overflow
  if (nextUpdate.getHours() >= 24) {
    nextUpdate.setDate(nextUpdate.getDate() + 1)
    nextUpdate.setHours(nextUpdate.getHours() - 24)
  }
  
  return nextUpdate
}

/**
 * Format the time until next update in a human-readable format
 */
export function formatTimeUntilUpdate(nextUpdate: Date): string {
  const now = new Date()
  const diff = nextUpdate.getTime() - now.getTime()
  
  if (diff <= 0) {
    return "Updating now..."
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}
