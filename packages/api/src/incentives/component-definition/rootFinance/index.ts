import { Schema } from 'effect';
import { LendingMarketComponent } from './lendingMarket';

export const RootFinanceComponentDefinitions = [LendingMarketComponent];

export const RootFinanceComponentDefinitionsUnionSchema = Schema.Union(
  ...RootFinanceComponentDefinitions,
);
