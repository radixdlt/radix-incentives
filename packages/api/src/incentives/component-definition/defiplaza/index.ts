import { Schema } from 'effect';
import { PlazaPairSchema } from './plazaPair';

export const DefiPlazaComponentDefinitions = [PlazaPairSchema];

export const DefiPlazaComponentDefinitionsUnionSchema = Schema.Union(
  ...DefiPlazaComponentDefinitions,
);
