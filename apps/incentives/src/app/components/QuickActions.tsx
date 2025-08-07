import { motion } from 'framer-motion';
import {
  ArrowLeftRightIcon,
  ArrowRightIcon,
  CreditCardIcon,
  TrophyIcon,
} from 'lucide-react';

export const QuickActions = () => {
  const actions = [
    {
      title: 'Buy XRD',
      description: 'Purchase XRD tokens to participate in campaigns',
      icon: CreditCardIcon,
      href: 'https://radixdlt.com/tokens',
      target: '_blank',
      color: { from: 'rgba(225, 52, 176, 0.4)', to: 'rgba(217, 0, 122, 0.4)' }, // Pink gradient
    },
    {
      title: 'Bridge Assets',
      description: 'Bridge your assets to Radix network',
      icon: ArrowLeftRightIcon,
      href: 'https://www.instabridge.io',
      target: '_blank',
      color: { from: 'rgba(30, 249, 186, 0.4)', to: 'rgba(0, 194, 168, 0.4)' }, // Cyan gradient
    },
    {
      title: 'View Points',
      description: 'Check your campaign points and rewards',
      icon: TrophyIcon,
      href: '/dashboard',
      target: '_self',
      color: { from: 'rgba(6, 44, 192, 0.4)', to: 'rgba(0, 31, 143, 0.4)' }, // Blue gradient
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {actions.map((action, index) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 + index * 0.1 }}
          className="group h-full"
        >
          <div className="glass-card hover-lift flex h-full flex-col rounded-lg p-6 transition-all duration-300 group-hover:border-white/15">
            <a
              href={action.href}
              target={action.target}
              className="block h-full"
            >
              <div className="flex h-full flex-col">
                <div className="flex flex-1 items-start space-x-4">
                  <div
                    className="flex-shrink-0 rounded-lg p-3 transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background: `linear-gradient(to right, ${action.color.from}, ${action.color.to})`,
                    }}
                  >
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h3 className="mb-2 font-semibold text-lg text-white">
                      {action.title}
                    </h3>
                    <p className="mb-4 flex-1 text-sm text-white/60">
                      {action.description}
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex items-center text-brand-cyan text-sm transition-colors group-hover:text-brand-pink">
                  Get Started
                  <ArrowRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
