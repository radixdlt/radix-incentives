'use client';

import { motion } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { QuickActions } from './components/QuickActions';
import { ElegantShape } from './components/ElegantShape';
import { Glow } from './components/Glow';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] via-transparent to-purple-500/[0.05] blur-3xl" />

      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-blue-500/[0.15]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-purple-500/[0.15]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-cyan-500/[0.15]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
      </div>

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

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/80 pointer-events-none" />

      {/* Glow effect */}
      <div className="relative">
        <Glow variant="center" className="animate-appear-zoom opacity-60" />
      </div>
    </div>
  );
}
