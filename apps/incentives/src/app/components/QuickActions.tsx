import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  CreditCardIcon,
  ArrowLeftRightIcon,
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {actions.map((action, index) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 + index * 0.1 }}
          className="h-full group"
        >
          <div className="glass-card p-6 rounded-lg h-full flex flex-col hover-lift transition-all duration-300 group-hover:border-white/15">
            <a
              href={action.href}
              target={action.target}
              className="block h-full"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start space-x-4 flex-1">
                  <div
                    className="p-3 rounded-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background: `linear-gradient(to right, ${action.color.from}, ${action.color.to})`,
                    }}
                  >
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {action.title}
                    </h3>
                    <p className="text-white/60 text-sm mb-4 flex-1">
                      {action.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-brand-cyan text-sm group-hover:text-brand-pink transition-colors mt-auto">
                  Get Started
                  <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
