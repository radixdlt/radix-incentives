import {
  ArrowLeftRight,
  Banknote,
  Coins,
  DollarSign,
  Network,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';

const iconMap = {
  Coins,
  ArrowLeftRight,
  TrendingUp,
  Banknote,
  Wallet,
  Target,
  Zap,
  DollarSign,
  Users,
  Network,
} as const;

export type IconName = keyof typeof iconMap;

export const getActivityIcon = (iconName: IconName) => {
  const IconComponent = iconMap[iconName];
  return <IconComponent className="w-5 h-5" />;
};
