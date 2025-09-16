import { Schema } from 'effect';

import { CaviarnineComponentDefinitions } from './caviarnine';
import { DefiPlazaComponentDefinitions } from './defiplaza';
import { OciswapComponentDefinitions } from './ociswap';
import { RootFinanceComponentDefinitions } from './rootFinance';
import { SurgeComponentDefinitions } from './surge';
import { WeftFinanceComponentDefinitions } from './weftFinance';

export const ComponentDefinitions = [
  ...CaviarnineComponentDefinitions,
  ...OciswapComponentDefinitions,
  ...DefiPlazaComponentDefinitions,
  ...WeftFinanceComponentDefinitions,
  ...RootFinanceComponentDefinitions,
  ...SurgeComponentDefinitions,
] as const;

export const ComponentDefinitionUnionSchema = Schema.Union(
  ...ComponentDefinitions,
);

export const getComponentDefinitionByPackageAddress = (
  packageAddress: string,
) =>
  ComponentDefinitions.find((componentDefinition) =>
    componentDefinition.matchPackageAddress(packageAddress),
  );
