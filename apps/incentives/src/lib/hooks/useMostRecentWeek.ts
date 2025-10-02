'use client';

import { useMemo, useState } from 'react';
import { api, type RouterOutputs } from '~/trpc/react';

export const useMostRecentWeek = () => {
  const [week, setWeek] = useState<
    RouterOutputs['week']['getWeeks'][number] | undefined
  >();

  const { data } = api.week.getWeeks.useQuery();

  useMemo(() => {
    const weeks = data ? [...data] : [];
    const mostRecentWeek = weeks.sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime(),
    )[0];

    setWeek(mostRecentWeek ?? undefined);
  }, [data]);

  return week;
};
