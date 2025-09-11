'use client';

import { motion } from 'framer-motion';
import { Footer } from '~/components/Footer';
import { NotificationBar } from '~/components/NotificationBar';
import { api } from '~/trpc/react';
import { HeroSection } from './components/HeroSection';
import { Navigation } from './components/Navigation';
import { QuickActions } from './components/QuickActions';

export default function Home() {
  const { data: config } = api.config.getPublicConfig.useQuery();
  const notification = config?.notification;

  return (
    <div
      className="grid-pattern relative w-full overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 5% 85%, rgba(225, 52, 176, 0.25) 0%, transparent 35%), radial-gradient(circle at 95% 15%, rgba(30, 249, 186, 0.22) 0%, transparent 35%), #0a0a0a',
      }}
    >
      {/* Notification Bar */}
      {notification?.enabled && (
        <NotificationBar message={notification.message} />
      )}

      {/* Navigation */}
      <Navigation />

      {/* Main content */}
      <div className="container relative z-10 mx-auto px-4 pt-12 md:px-6">
        <div className="mx-auto max-w-6xl">
          {/* Hero section */}
          <HeroSection />

          {/* Quick actions */}
          <div className="mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="mb-8 text-center font-bold text-2xl text-white"
            >
              Quick Actions
            </motion.h2>
            <QuickActions />
          </div>
        </div>
      </div>

      {/* Footer with 200px margin */}
      <Footer className="mt-[200px]" />
    </div>
  );
}
