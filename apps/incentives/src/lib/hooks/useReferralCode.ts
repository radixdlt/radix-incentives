'use client';

import Cookies from 'js-cookie';
import { useCallback, useEffect, useState } from 'react';

export const useReferralCode = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Only access searchParams on the client side
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      setReferralCode(searchParams.get('ref'));
    }
  }, []);

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
