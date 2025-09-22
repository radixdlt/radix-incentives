'use client';
import { useEffect, useState } from 'react';

import 'vanilla-cookieconsent/dist/cookieconsent.css';
import { GoogleTagManager } from '@next/third-parties/google';
import * as CC from 'vanilla-cookieconsent';

export default function CookieConsent() {
  const [hasAcceptedAnalytics, setHasAcceptedAnalytics] = useState(false);
  useEffect(() => {
    CC.run({
      onConsent: () => {
        const hasAcceptedAnalytics = CC.acceptedCategory('analytics');
        setHasAcceptedAnalytics(hasAcceptedAnalytics);
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          enabled: true,
        },
      },
      language: {
        default: 'en',
        translations: {
          en: {
            consentModal: {
              title: 'Cookie Consent',
              description: '',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              showPreferencesBtn: 'Manage Individual preferences',
            },
            preferencesModal: {
              title: 'Manage cookie preferences',
              acceptAllBtn: 'Accept all',
              acceptNecessaryBtn: 'Reject all',
              savePreferencesBtn: 'Accept current selection',
              closeIconLabel: 'Close modal',
              sections: [
                {
                  title: 'About Your Privacy',
                  description:
                    'We process your data to deliver content or advertisements and measure the delivery of such content or advertisements to extract insights about our website. We share this information with our partners on the basis of consent. You may exercise your right to consent, based on a specific purpose below or at a partner level in the link under each purpose. These choices will be signaled to our vendors participating in the Transparency and Consent Framework.',
                },
                {
                  title: 'Strictly Necessary cookies',
                  description:
                    'These cookies are essential for the proper functioning of the website and cannot be disabled.',

                  linkedCategory: 'necessary',
                },
                {
                  title: 'Performance and Analytics',
                  description:
                    'These cookies collect information about how you use our website. All of the data is anonymized and cannot be used to identify you.',
                  linkedCategory: 'analytics',
                },
              ],
            },
          },
        },
      },
    });
  }, []);

  return (
    <>
      {hasAcceptedAnalytics ? <GoogleTagManager gtmId="GTM-PKNDV4C" /> : null}
    </>
  );
}
