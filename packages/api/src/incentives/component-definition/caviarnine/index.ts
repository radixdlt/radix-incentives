import { Schema } from 'effect';
import { HyperStakeComponent } from './hyperStake';
import { QuantaSwapComponent } from './quantaSwap';
import { WeightedPoolComponent } from './weightedPool';

export const CaviarnineComponentDefinitions = [
  QuantaSwapComponent,
  HyperStakeComponent,
  WeightedPoolComponent,
];

export const CaviarnineComponentDefinitionUnionSchema = Schema.Union(
  ...CaviarnineComponentDefinitions,
);
