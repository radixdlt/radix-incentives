import { motion } from 'framer-motion';
import { TrophyIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '~/components/ui/button';

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
    <div className="mb-16 text-center">
      <motion.div
        custom={0}
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.05] px-4 py-2"
      >
        <TrophyIcon className="h-4 w-4 text-brand-cyan" />
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
        <h1 className="mb-6 font-bold text-4xl tracking-tight sm:text-6xl md:text-7xl">
          <span className="bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
            Earn Rewards on
          </span>
          <br />
          <span className="gradient-text">Radix Network</span>
        </h1>
      </motion.div>

      <motion.div
        custom={2}
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
      >
        <p className="mx-auto mb-8 max-w-2xl font-light text-lg text-white/60 leading-relaxed sm:text-xl">
          Participate in the incentives campaign, earn XRD rewards, and help
          grow the Radix ecosystem. Connect your wallet to get started.
        </p>
      </motion.div>

      <motion.div
        custom={3}
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
      >
        <Link href="/dashboard">
          <Button size="xl" className="btn-gradient">
            Enroll in Campaign
          </Button>
        </Link>
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
