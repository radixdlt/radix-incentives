'use client';

import Cookies from 'js-cookie';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export const useReferralCode = () => {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');

  const clearReferralCode = useCallback(() => {
    Cookies.remove('ref');
  }, []);

  useEffect(() => {
    if (referralCode) {
      Cookies.set('ref', referralCode, {
        expires: 30,
        path: '/',
        secure: true,
        sameSite: 'lax',
        httpOnly: false,
      });
    }
  }, [referralCode]);

  return clearReferralCode;
};
