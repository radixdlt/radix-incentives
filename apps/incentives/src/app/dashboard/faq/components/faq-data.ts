export interface FaqItemData {
  question: string;
  answer: string;
}

export const faqItems: FaqItemData[] = [
  {
    question: "What is the Radix Incentives Program?",
    answer:
      "The Radix Incentives Program is designed to reward meaningful on-chain economic activity on the Radix network. Participants earn points through activities like trading on DEXs, providing liquidity, lending/borrowing, and holding XRD/LSUs. The program runs in 12-week seasons with a total budget of 1 billion XRD distributed across multiple seasons to encourage sustained network participation.",
  },
  {
    question: "How do I qualify for the program?",
    answer:
      "To participate in the Radix Incentives Program, you must maintain a minimum holding of $50 worth of XRD and connect your Radix wallet through the dashboard. You can link multiple accounts to a single dashboard profile to earn points across all your wallets. Activities are tracked automatically once your accounts are verified.",
  },
  {
    question: "What are points and how are they calculated?",
    answer:
      "Points are earned through two types of activities: passive (holding assets) and active (trading, liquidity provision, lending). Your weekly activity is ranked percentile-wise against other participants in each category, then converted to season points. A multiplier based on your XRD/LSU holdings (ranging from 0.5x to 3x) is applied to boost your final season points.",
  },
  {
    question: "What are the supported assets and activities?",
    answer:
      "High-priority activities include trading blue-chip assets (xUSDC, xUSDT, xBTC, xETH) and XRD on DEXs, providing liquidity to these pairs, and lending/borrowing on protocols. Moderate priority includes Radix-native token activities. Lower priority covers NFT activities and basic token interactions. The program emphasizes economically meaningful transactions over low-value farming.",
  },
  {
    question: "What are multipliers and how do they work?",
    answer:
      "Multipliers are bonuses applied to your season points based on your XRD and LSU holdings. The multiplier follows an S-curve pattern, with significant increases from $5,000 to $100,000 in holdings, then diminishing returns above that. The maximum multiplier is 3x for top 10% holders. You must maintain holdings for at least 24 hours to qualify for multiplier benefits.",
  },
  {
    question: "When can I claim my rewards?",
    answer:
      "Rewards are distributed at the end of each 12-week season based on your accumulated season points and final ranking. The distribution mechanism and claiming process will be announced as each season concludes. Points are calculated weekly but converted to season points that determine your final reward allocation from that season's XRD pool.",
  },
  {
    question:
      "I participated in activities but don't see my points. Where are they?",
    answer:
      "Points are calculated weekly in a batch process, so there may be a delay between your activity and points appearing. Make sure your wallet is properly connected and verified through Radix Connect. If you've linked multiple accounts, points from all connected wallets should appear in your unified dashboard. Contact support if points are still missing after the weekly calculation period.",
  },
];
