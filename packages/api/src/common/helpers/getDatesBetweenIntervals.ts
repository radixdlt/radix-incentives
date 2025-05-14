export const getDatesBetweenIntervals = (
  startDate: Date,
  endDate: Date,
  intervalFn: (value: Date) => void = (value) => {
    value.setHours(value.getHours() + 1);
  }
) => {
  const dates = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    intervalFn(currentDate);
  }
  return dates;
};
