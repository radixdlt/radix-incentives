'use client';

import { motion } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { QuickActions } from './components/QuickActions';
import { NotificationBar } from '~/components/NotificationBar';
import { api } from '~/trpc/react';

export default function Home() {
  const { data: config } = api.config.getPublicConfig.useQuery();
  const notification = config?.notification;

  return (
    <div 
      className="relative min-h-screen w-full overflow-hidden grid-pattern"
      style={{
        background: 'radial-gradient(circle at 5% 85%, rgba(225, 52, 176, 0.25) 0%, transparent 35%), radial-gradient(circle at 95% 15%, rgba(30, 249, 186, 0.22) 0%, transparent 35%), #0a0a0a'
      }}
    >
      {/* Notification Bar */}
      {notification?.enabled && (
        <NotificationBar message={notification.message} />
      )}

      {/* Navigation */}
      <Navigation />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 pt-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero section */}
          <HeroSection />

          {/* Quick actions */}
          <div className="mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="text-2xl font-bold text-white text-center mb-8"
            >
              Quick Actions
            </motion.h2>
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
