import { motion } from 'framer-motion';
import { CoinsIcon, TrophyIcon, ExternalLinkIcon } from 'lucide-react';
import { Card } from '~/components/ui/card';

export const StatsSection = () => {
  const stats = [
    { label: 'Total Rewards', value: '1B XRD', icon: CoinsIcon },
    { label: 'Activities', value: '12', icon: TrophyIcon },
    { label: 'Participants', value: '15,847', icon: ExternalLinkIcon },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + index * 0.1 }}
        >
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <stat.icon className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
