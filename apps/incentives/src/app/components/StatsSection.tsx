import { motion } from 'framer-motion';
import { CoinsIcon, ExternalLinkIcon, TrophyIcon } from 'lucide-react';
import { Card } from '~/components/ui/card';

export const StatsSection = () => {
  const stats = [
    { label: 'Total Rewards', value: '1B XRD', icon: CoinsIcon },
    { label: 'Activities', value: '12', icon: TrophyIcon },
    { label: 'Participants', value: '15,847', icon: ExternalLinkIcon },
  ];

  return (
    <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + index * 0.1 }}
        >
          <Card className="border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <stat.icon className="h-8 w-8 text-blue-400" />
              <div>
                <p className="font-bold text-2xl text-white">{stat.value}</p>
                <p className="text-sm text-white/60">{stat.label}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
