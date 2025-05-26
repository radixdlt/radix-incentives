export const getHourStartInUTC = (date = new Date()) => {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      0, // minutes
      0, // seconds
      0 // milliseconds
    )
  );
};
