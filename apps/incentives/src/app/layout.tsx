import '~/styles/globals.css';

import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import { TRPCReactProvider } from '~/trpc/react';
import { RadixDappToolkitProvider } from '~/lib/providers/rdtProvider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Radix Incentives',
  description: 'Dashboard for the Radix Incentives campaign',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${geist.variable}`}>
      <head>
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className="bg-background text-foreground min-h-screen antialiased">
        <TRPCReactProvider>
          <RadixDappToolkitProvider>
            <>
              <div className="text-center font-bold bg-white text-black sticky top-0 z-50">
                ⚠️ PREVIEW TEST ⚠️
              </div>

              {children}
            </>
            <Toaster richColors position="top-right" />
          </RadixDappToolkitProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
