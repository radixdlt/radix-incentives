'use client';

import Cookies from 'js-cookie';
import { useCallback, useEffect, useState } from 'react';

export const useReferralCode = () => {
  const KEY = 'ref';
  const [referralCode, setReferralCode] = useState<string | null>(null);

  const setCookie = useCallback((code: string) => {
    Cookies.set(KEY, code, {
      expires: 30,
      path: '/',
      secure: true,
      sameSite: 'lax',
      httpOnly: false,
    });
  }, []);

  const clearCookie = useCallback(() => {
    Cookies.remove(KEY);
  }, []);

  const setCookieFromSearchParams = useCallback(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const value = searchParams.get(KEY);

      if (value) {
        setCookie(value);
      }
      return value;
    }
  }, []);

  useEffect(() => {
    const value = Cookies.get(KEY);
    if (value) {
      setReferralCode(value);
    }
  }, [setCookieFromSearchParams]);

  return { referralCode, clearCookie, setCookie, setCookieFromSearchParams };
};
