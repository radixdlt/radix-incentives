import s from "sbor-ez-mode";

export const WithdrawNonFungibleEventSchema = s.enum([
  {
    variant: "NonFungible",
    schema: s.tuple([s.address(), s.array(s.nonFungibleLocalId())]),
  },
]);

export const DepositNonFungibleEventSchema = s.enum([
  {
    variant: "NonFungible",
    schema: s.tuple([s.address(), s.array(s.nonFungibleLocalId())]),
  },
]);
