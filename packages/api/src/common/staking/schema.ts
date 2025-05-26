import s from "sbor-ez-mode";

export const claimNftSchema = s.struct({
  name: s.string(),
  claim_epoch: s.number(),
  claim_amount: s.decimal(),
});
