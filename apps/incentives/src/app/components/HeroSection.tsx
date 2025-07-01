import { motion } from 'framer-motion';
import { TrophyIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { CosmicGlowButton } from './CosmicGlowButton';
import Link from 'next/link';

export const HeroSection = () => {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <div className="text-center mb-16">
      <motion.div
        custom={0}
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.1] mb-8"
      >
        <TrophyIcon className="h-4 w-4 text-blue-400" />
        <span className="text-sm text-white/80 tracking-wide">
          Radix Incentives Campaign Platform
        </span>
      </motion.div>

      <motion.div
        custom={1}
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
            Earn Rewards on
          </span>
          <br />
          <span className="bg-clip-text">Radix Network</span>
        </h1>
      </motion.div>

      <motion.div
        custom={2}
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
      >
        <p className="text-lg sm:text-xl text-white/60 mb-8 leading-relaxed font-light max-w-2xl mx-auto">
          Participate in the incentives campaign, earn XRD rewards, and help
          grow the Radix ecosystem. Connect your wallet to get started.
        </p>
      </motion.div>

      <motion.div
        custom={3}
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
      >
        <CosmicGlowButton
          color="hsl(220, 80%, 60%)"
          speed="6s"
          className="px-8 py-4 text-lg"
          onClick={() => {
            window.location.href = '/dashboard';
          }}
        >
          Enroll in Campaign
        </CosmicGlowButton>
        <Link href="/dashboard/faq">
          <Button
            variant="outline"
            size="lg"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Learn More
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};
