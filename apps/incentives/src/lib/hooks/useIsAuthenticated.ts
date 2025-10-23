import { useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '~/trpc/react';
import { usePersona } from './usePersona';
import { useDappToolkit } from './useRdt';

export const useIsAuthenticated = () => {
  const { persona } = usePersona();
  const rdt = useDappToolkit();

  const isAuthenticated = api.auth.isSignedIn.useQuery(undefined, {
    retry: false,
    enabled: !!persona,
  });

  useEffect(() => {
    if (persona && isAuthenticated.error?.data?.httpStatus === 401) {
      toast.error('Your session has expired. Please sign in again.');
      rdt?.disconnect();
    }
  }, [persona, isAuthenticated.isError, rdt]);

  return isAuthenticated.data;
};
