import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { ThemeProvider } from '../components/theme-provider';
import { Layout } from '../components/layout';
import { TRPCReactProvider } from '~/trpc/react';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Radix Incentives Admin Dashboard',
  description: 'Admin interface for the Radix Incentives Campaign',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <TRPCReactProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <Layout>{children}</Layout>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
