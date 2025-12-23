import { Schema } from 'effect';
import { AccountAddress } from '../brandedTypes';

export const WalletAccountSchema = Schema.Struct({
  address: AccountAddress,
  label: Schema.String,
  appearanceId: Schema.Number,
});

export type WalletAccount = typeof WalletAccountSchema.Type;
