import type { IconName } from "../utils/getActivityIcon";

export interface ActivityData {
  id: string;
  title: string;
  description: string;
  category: "passive" | "active";
  type: "holding" | "trading" | "liquidity" | "lending" | "network";

  icon: IconName;
  requirements?: string[];
  benefits: string[];
  pools?: string[];
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: "passive" | "active";
  type: "holding" | "trading" | "liquidity" | "lending" | "network";
  pointsRange: string;
  difficulty: "Easy" | "Medium" | "Hard";
  requirements?: string[];
}
