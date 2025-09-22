import '~/styles/globals.css';

import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import { Toaster } from 'sonner';
import { RadixDappToolkitProvider } from '~/lib/providers/rdtProvider';
import { TRPCReactProvider } from '~/trpc/react';

export const metadata: Metadata = {
  metadataBase: process.env.APP_URL ? new URL(process.env.APP_URL) : null,
  title: 'Radix Incentives',
  description:
    'The race for 1 billion $XRD is on! Connect your Radix Wallet to track your points in real-time, and push your rank to the top of the leaderboard.',
  icons: [{ rel: 'icon', url: '/favicon.png' }],
  openGraph: {
    type: 'website',
    title: 'Radix Incentives',
    description:
      'The race for 1 billion $XRD is on! Connect your Radix Wallet to track your points in real-time, and push your rank to the top of the leaderboard.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Radix Incentives',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radix Incentives',
    description:
      'The race for 1 billion $XRD is on! Connect your Radix Wallet to track your points in real-time, and push your rank to the top of the leaderboard.',
    images: ['/og.png'],
  },
};

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geist.variable}>
      <head>
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <TRPCReactProvider>
          <RadixDappToolkitProvider>
            {children}
            <Toaster richColors position="top-right" />
          </RadixDappToolkitProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
