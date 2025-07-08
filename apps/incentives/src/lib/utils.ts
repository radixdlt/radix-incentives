import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
