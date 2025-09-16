import { Schema } from 'effect';
import { LendingMarketComponent } from './lendingMarket';

export const WeftFinanceComponentDefinitions = [LendingMarketComponent];

export const WeftFinanceComponentDefinitionsUnionSchema = Schema.Union(
  ...WeftFinanceComponentDefinitions,
);
