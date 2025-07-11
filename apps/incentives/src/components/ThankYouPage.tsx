'use client';

import { motion } from 'framer-motion';
import { ElegantShape } from '~/app/components/ElegantShape';
import { Glow } from '~/app/components/Glow';

export const ThankYouPage = () => {
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

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Thank you message */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 mb-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Success checkmark"
                >
                  <title>Success checkmark</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                Thank You!
              </h1>

              <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
                Thank you for participating in the preview test
              </p>

              <div className="max-w-2xl mx-auto">
                <p className="text-lg text-slate-400 leading-relaxed">
                  Your participation has been invaluable in helping us prepare
                  for the full launch of the Radix Incentives Campaign. The
                  dashboard is currently closed for maintenance as we prepare
                  for the next phase.
                </p>
              </div>
            </motion.div>
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
};
