export interface FaqItemData {
  question: string;
  answer: string;
}

export const faqItems: FaqItemData[] = [
  {
    question: "What is the Radix Incentives Program?",
    answer: `The Radix Rewards program is designed to reward meaningful on-chain economic activity on the Radix network. Participants earn points through activities like trading on DEXs, providing liquidity, lending/borrowing, and holding XRD/LSUs. The program has a total budget of 1 billion XRD that will be distributed across multiple seasons to encourage sustained network participation. More details can be found <a class="underline" href='https://www.radixdlt.com/blog/backing-growth-radix-incentives-campaign-proposal' target='_blank'>here</a>.`,
  },
  {
    question: "How do I qualify for the program?",
    answer:
      "To participate in the Radix Rewards program, you must maintain a minimum holding of $50 worth of XRD across all your connected accounts. Accounts must be connected via the <a class='underline' href='/dashboard/accounts'>Accounts</a> page using the Radix wallet. You can link multiple accounts to a single Radix Rewards profile to earn points across all your accounts. Activities are tracked automatically once your accounts are verified from the point you link them to the Radix Rewards dApp. Important: you do not earn points for activity priority to linking your account(s).",
  },
  {
    question: "What are points and how are they calculated?",
    answer: `There are two main types of points in the Radix Rewards program; weekly Activity Points (AP) and Season Points (SP). 
Activity points are earned by using assets in supported dApps and pools, such as supplying xUSDC on lending markets, or trading xWBTC on DEXs. Current activities can be found here (not live in testing).
<br /><br />

Each activity has a set amount of Season Points each week. Your weekly Activity Points are ranked percentile-wise against other participants in each category, then converted to season points. A multiplier based on your XRD/LSU holdings (ranging from 0.5x to 3x) is applied to boost your final season points.
`,
  },
  {
    question: "What are the supported assets and activities?",
    answer: `Assets and activities may change each week, but generally look at providing liquidity in a range of assets to DeFi dApps, trading activity in certain assets, and general use of the Radix ecosystem. 
<br /><br />
The current list of rewarded activities can be found here (not live in testing)`,
  },
  {
    question: "What are multipliers and how do they work?",
    answer: `Multipliers are bonuses applied to your season points based on your XRD and LSU holdings, as well as XRD or LSUs in supported DeFi applications such as LSULP, or XRD in support DEX pools. 
<br /><br />
The multiplier follows an S-curve pattern, with significant increases from $5,000 to $100,000 in holdings, then diminishing returns above that. The maximum multiplier is 3x. You must maintain holdings for at least 24 hours to qualify for multiplier benefits.`,
  },
  {
    question: "When can I claim my rewards?",
    answer:
      "Rewards are distributed at the end of each season based on your accumulated season points and final ranking.The distribution mechanism and claiming process will be announced as each season concludes, and may be adjusted based if exploitation is detected. Points are calculated weekly but converted to season points that determine your final reward allocation from that season's XRD pool.",
  },
  {
    question:
      "I participated in activities but don't see my points. Where are they?",
    answer: `Points are calculated in batches, so there may be a delay between your activity and points appearing. Additionally, only accounts registered with the Radix Rewards program earn points, so make sure your wallet and all accounts you wish to have associated are properly connected and verified through Radix Connect on the Accounts page. 
<br /><br />

If you've linked multiple accounts, points from all connected wallets should appear in your unified dashboard. Please note, to earn any points you must have at least $50 of XRD/LSUs across all your linked accounts, and certain activities may have minimum activity thresholds. 
<br /><br />

<a class='underline' href='mailto:support@radix.foundation'>Contact support</a> if points are still missing after the weekly calculation period.`,
  },
  {
    question: "Is it safe to link multiple accounts?",
    answer: `Yes. When you enrol in the Radix Rewards program, the Persona you connect may be shown publicly, but the account addresses are never shown and are not connected in any way by the Radix Rewards program on-ledger. 
<br /><br />
Although Radix Rewards does not link your accounts in a way other users can see, please remember blockchains are public networks and activity can be connected across multiple accounts in other ways. It is recommended to keep good “account hygiene”.`,
  },
];
