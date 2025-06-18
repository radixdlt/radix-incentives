import s from "sbor-ez-mode";

export const PoolUnitSchema = s.enum([
  { variant: "PoolUnit", schema: s.tuple([s.address()]) },
]);

export const PoolResourcesSchema = s.enum([
  { variant: "PoolResources", schema: s.tuple([s.array(s.address())]) },
]);
