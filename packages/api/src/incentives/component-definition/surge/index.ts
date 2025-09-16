import { Schema } from 'effect';
import { MarginPoolComponent } from './marginPool';

export const SurgeComponentDefinitions = [MarginPoolComponent];

export const SurgeComponentDefinitionsUnionSchema = Schema.Union(
  ...SurgeComponentDefinitions,
);
