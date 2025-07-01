import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  CreditCardIcon,
  ArrowLeftRightIcon,
  TrophyIcon,
} from 'lucide-react';
import { Card } from '~/components/ui/card';

export const QuickActions = () => {
  const actions = [
    {
      title: 'Buy XRD',
      description: 'Purchase XRD tokens to participate in campaigns',
      icon: CreditCardIcon,
      href: 'https://radixdlt.com/tokens',
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Bridge Assets',
      description: 'Bridge your assets to Radix network',
      icon: ArrowLeftRightIcon,
      href: 'https://www.instabridge.io',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'View Points',
      description: 'Check your campaign points and rewards',
      icon: TrophyIcon,
      href: '/dashboard/points',
      color: 'from-purple-500 to-violet-600',
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
          className="h-full"
        >
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer group h-full">
            <a href={action.href} className="block h-full">
              <div className="flex flex-col h-full">
                <div className="flex items-start space-x-4 flex-1">
                  <div
                    className={`p-3 rounded-lg bg-gradient-to-r ${action.color} flex-shrink-0`}
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
                <div className="flex items-center text-blue-400 text-sm group-hover:text-blue-300 transition-colors mt-auto">
                  Get Started
                  <ArrowRightIcon className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
