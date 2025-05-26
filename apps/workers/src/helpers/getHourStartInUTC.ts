/**
 * Returns the current date/time rounded down to the start of the current hour in UTC
 * @returns Date object set to the beginning of the current hour (minutes, seconds, milliseconds = 0)
 */
export const getHourStartInUTC = (): Date => {
  const now = new Date();
  now.setUTCMinutes(0, 0, 0);
  return now;
};

/**
 * Creates a new Date object in UTC with specific components
 * @param year - UTC year
 * @param month - UTC month (0-11)
 * @param day - UTC day (1-31)
 * @param hour - UTC hour (0-23)
 * @param minute - UTC minute (0-59, default: 0)
 * @param second - UTC second (0-59, default: 0)
 * @param millisecond - UTC millisecond (0-999, default: 0)
 */
export const createUTCDate = (
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0
): Date => {
  return new Date(
    Date.UTC(year, month, day, hour, minute, second, millisecond)
  );
};

/**
 * Converts a timestamp (ISO string or milliseconds) to UTC Date
 * @param timestamp - ISO string or milliseconds since epoch
 */
export const toUTCDate = (timestamp: string | number): Date => {
  return new Date(timestamp);
};
