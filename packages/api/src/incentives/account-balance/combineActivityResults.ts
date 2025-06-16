import { Context, Effect, Layer } from "effect";
import { BigNumber } from "bignumber.js";
import type { AggregateAccountBalanceOutput } from "./aggregateAccountBalance";

// Protocol-specific data types
type WeftLendingData = {
  protocol: "weft";
  xUSDC?: string;
};

type RootLendingData = {
  protocol: "root";
  xUSDC?: string;
};

type LendingProtocolData = WeftLendingData | RootLendingData;

export type CombinedLendingData = {
  type: "combined_lending";
  totalUsdValue: string;
  protocolContributions: Record<string, LendingProtocolData & { usdValue: string }>;
  protocolCount: number;
};

// DEX protocol data types (for future use)
type CaviarnineProtocolData = {
  protocol: "caviarnine";
  // Add specific fields when needed
};

type DexProtocolData = CaviarnineProtocolData; // Extend as more DEX protocols are added

// Future combined data types can be added here
export type CombinedDexData = {
  type: "combined_dex";
  totalUsdValue: string;
  protocolContributions: Record<string, DexProtocolData & { usdValue: string }>;
  protocolCount: number;
};

// Union of all possible combined data types
export type CombinedActivityData = CombinedLendingData | CombinedDexData;

// Combined result type that extends the base structure
export type CombinedActivityResult = {
  timestamp: Date;
  address: string;
  activityId: string;
  usdValue: BigNumber;
  data: CombinedActivityData;
};

export type CombineActivityResultsInput = {
  results: AggregateAccountBalanceOutput[];
};

export type CombineActivityResultsOutput = (AggregateAccountBalanceOutput | CombinedActivityResult)[];

export class CombineActivityResultsService extends Context.Tag(
  "CombineActivityResultsService"
)<
  CombineActivityResultsService,
  (
    input: CombineActivityResultsInput
  ) => Effect.Effect<CombineActivityResultsOutput, never, never>
>() {}

// Activity-specific combination strategies
const activityCombiners = {
  lending: (
    results: AggregateAccountBalanceOutput[]
  ): CombinedActivityResult => {
    // For lending activity, combine USD values and track protocol contributions
    const first = results[0]!;
    const totalUsdValue = results.reduce(
      (sum, result) => sum.plus(result.usdValue),
      new BigNumber(0)
    );

    // Track contributions from each protocol using their data.protocol field
    const protocolContributions: Record<string, LendingProtocolData & { usdValue: string }> = {};
    
    for (const result of results) {
      // Type guard to ensure we have lending protocol data
      if (result.data && typeof result.data === 'object' && 'protocol' in result.data) {
        const protocolData = result.data as LendingProtocolData;
        if (protocolData?.protocol) {
          protocolContributions[protocolData.protocol] = {
            usdValue: result.usdValue.toString(),
            ...protocolData, // Include all protocol-specific data
          };
        }
      }
    }

    const combinedData: CombinedLendingData = {
      type: "combined_lending",
      totalUsdValue: totalUsdValue.toString(),
      protocolContributions,
      protocolCount: results.length,
    };

    return {
      timestamp: first.timestamp,
      address: first.address,
      activityId: "lending",
      usdValue: totalUsdValue,
      data: combinedData,
    };
  },

  provideLiquidityToDex: (
    results: AggregateAccountBalanceOutput[]
  ): CombinedActivityResult => {
    // For DEX liquidity, combine USD values and merge position data
    const first = results[0]!;
    const totalUsdValue = results.reduce(
      (sum, result) => sum.plus(result.usdValue),
      new BigNumber(0)
    );

    // For DEX positions, combine protocol contributions
    // TODO: When we have multiple DEX protocols, implement proper combining logic
    const protocolContributions: Record<string, DexProtocolData & { usdValue: string }> = {};
    
    for (const result of results) {
      // For now, assume Caviarnine protocol
      // This will need to be updated when we add more DEX protocols
      protocolContributions["caviarnine"] = {
        protocol: "caviarnine",
        usdValue: result.usdValue.toString(),
      };
    }

    const combinedData: CombinedDexData = {
      type: "combined_dex",
      totalUsdValue: totalUsdValue.toString(),
      protocolContributions,
      protocolCount: results.length,
    };

    return {
      timestamp: first.timestamp,
      address: first.address,
      activityId: "provideLiquidityToDex", 
      usdValue: totalUsdValue,
      data: combinedData,
    };
  },

  // Add more activity combiners as needed
  // trading: (results) => { ... },
  // holding: (results) => { ... },
};

export const CombineActivityResultsLive = Layer.effect(
  CombineActivityResultsService,
  Effect.gen(function* () {
    return (input) =>
      Effect.gen(function* () {
        const { results } = input;

        // Group results by combination key (timestamp + address + activityId)
        const groupedResults = results.reduce((acc, result) => {
          const key = `${result.timestamp.toISOString()}-${result.address}-${result.activityId}`;
          
          if (!acc.has(key)) {
            acc.set(key, []);
          }
          acc.get(key)!.push(result);
          
          return acc;
        }, new Map<string, AggregateAccountBalanceOutput[]>());

        // Process each group with appropriate combination strategy
        const combinedResults: (AggregateAccountBalanceOutput | CombinedActivityResult)[] = [];

        for (const [key, groupResults] of groupedResults.entries()) {
          if (groupResults.length === 1) {
            // No combination needed
            combinedResults.push(groupResults[0]!);
          } else {
            // Multiple results for same activity - need to combine
            const activityId = groupResults[0]!.activityId;
            const combiner = activityCombiners[activityId as keyof typeof activityCombiners];

            if (combiner) {
              // Use activity-specific combination logic
              const combinedResult = combiner(groupResults);
              combinedResults.push(combinedResult);
            } else {
              // Fallback: log warning and use first result
              yield* Effect.log(
                `Warning: No combiner found for activityId '${activityId}'. Using first result only.`
              );
              combinedResults.push(groupResults[0]!);
            }
          }
        }

        return combinedResults;
      });
  })
);