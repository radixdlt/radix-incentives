'use client';

import { useMemo } from 'react';
import { api } from '~/trpc/react';

export const useMostRecentWeek = () => {
  const { data } = api.week.getWeeks.useQuery();

  const week = useMemo(() => {
    if (!data) return undefined;
    const weeks = [...data];
    const mostRecentWeek = weeks.sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime(),
    )[0];

    return mostRecentWeek;
  }, [data]);

  return week;
};
