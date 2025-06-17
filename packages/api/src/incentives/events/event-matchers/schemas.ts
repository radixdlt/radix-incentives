import s from "sbor-ez-mode";

export const WithdrawNonFungibleEventSchema = s.enum([
  {
    variant: "NonFungible",
    schema: s.tuple([s.address(), s.array(s.nonFungibleLocalId())]),
  },
]);

export const WithdrawFungibleEventSchema = s.enum([
  {
    variant: "Fungible",
    schema: s.tuple([s.address(), s.decimal()]),
  },
]);

export const DepositNonFungibleEventSchema = s.enum([
  {
    variant: "NonFungible",
    schema: s.tuple([s.address(), s.array(s.nonFungibleLocalId())]),
  },
]);

export const DepositFungibleEventSchema = s.enum([
  {
    variant: "Fungible",
    schema: s.tuple([s.address(), s.decimal()]),
  },
]);
