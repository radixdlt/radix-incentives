import { useEffect } from 'react';
import { toast } from 'sonner';
import { api } from '~/trpc/react';
import { usePersona } from './usePersona';
import { useDappToolkit } from './useRdt';

export const useIsAuthenticated = () => {
  const { persona, isConnected } = usePersona();
  const rdt = useDappToolkit();

  const isAuthenticated = api.auth.isSignedIn.useQuery(
    { identityAddress: persona?.identityAddress },
    {
      retry: false,
      enabled: isConnected,
    },
  );

  useEffect(() => {
    if (persona && isAuthenticated.error?.data?.httpStatus === 401) {
      toast.error('Your session has expired. Please sign in again.');
      rdt?.disconnect();
    }
  }, [persona, isAuthenticated.isError, rdt]);

  return isConnected && isAuthenticated.data;
};
