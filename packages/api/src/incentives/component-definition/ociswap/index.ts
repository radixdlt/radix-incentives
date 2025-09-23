import { Schema } from 'effect';
import { BasicPoolComponent } from './basicPool';
import { FlexPoolComponent } from './flexPool';
import { PoolComponent } from './pool';
import { PrecisionPoolComponent } from './precisionPool';

export const OciswapComponentDefinitions = [
  PrecisionPoolComponent,
  FlexPoolComponent,
  BasicPoolComponent,
  PoolComponent,
];

export const OciswapComponentDefinitionsUnionSchema = Schema.Union(
  ...OciswapComponentDefinitions,
);
