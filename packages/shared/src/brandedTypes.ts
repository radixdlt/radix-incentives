import { Schema } from 'effect';

export const UserId = Schema.String.pipe(Schema.brand('UserId'));
export type UserId = typeof UserId.Type;

export const SeasonId = Schema.String.pipe(Schema.brand('SeasonId'));
export type SeasonId = typeof SeasonId.Type;

export const AccountAddress = Schema.String.pipe(
  Schema.brand('AccountAddress'),
);
export type AccountAddress = typeof AccountAddress.Type;

export const NonFungibleId = Schema.String.pipe(Schema.brand('NonFungibleId'));
export type NonFungibleId = typeof NonFungibleId.Type;

export const Amount = Schema.String.pipe(Schema.brand('Amount'));
export type Amount = typeof Amount.Type;

export const AmountUsd = Schema.String.pipe(Schema.brand('AmountUsd'));
export type AmountUsd = typeof AmountUsd.Type;

export const PositionKey = Schema.String.pipe(Schema.brand('PositionKey'));
export type PositionKey = typeof PositionKey.Type;

export const ValidatorAddress = Schema.String.pipe(
  Schema.brand('ValidatorAddress'),
);
export type ValidatorAddress = typeof ValidatorAddress.Type;

export const ComponentAddress = Schema.String.pipe(
  Schema.brand('ComponentAddress'),
);
export type ComponentAddress = typeof ComponentAddress.Type;

export const AccountLockerAddress = Schema.String.pipe(
  Schema.brand('AccountLockerAddress'),
);
export type AccountLockerAddress = typeof AccountLockerAddress.Type;

export const PoolAddress = Schema.String.pipe(Schema.brand('PoolAddress'));
export type PoolAddress = typeof PoolAddress.Type;

export const StateVersion = Schema.Number.pipe(Schema.brand('StateVersion'));
export type StateVersion = typeof StateVersion.Type;

export const TransactionId = Schema.String.pipe(Schema.brand('TransactionId'));
export type TransactionId = typeof TransactionId.Type;

export const Epoch = Schema.Number.pipe(Schema.brand('Epoch'));
export type Epoch = typeof Epoch.Type;

export const NetworkId = Schema.Number.pipe(Schema.brand('NetworkId'));
export type NetworkId = typeof NetworkId.Type;

export const Nonce = Schema.Number.pipe(Schema.brand('Nonce'));
export type Nonce = typeof Nonce.Type;

export const HexString = Schema.String.pipe(Schema.brand('HexString'));
export type HexString = typeof HexString.Type;

export const Base64String = Schema.String.pipe(Schema.brand('Base64String'));
export type Base64String = typeof Base64String.Type;

export const TransactionManifestString = Schema.String.pipe(
  Schema.brand('TransactionManifestString'),
);
export type TransactionManifestString = typeof TransactionManifestString.Type;

export const TransactionMessageString = Schema.String.pipe(
  Schema.brand('TransactionMessageString'),
);
export type TransactionMessageString = typeof TransactionMessageString.Type;

export const PackageAddress = Schema.String.pipe(
  Schema.brand('PackageAddress'),
);
export type PackageAddress = typeof PackageAddress.Type;

export const AccessControllerAddress = Schema.String.pipe(
  Schema.brand('AccessControllerAddress'),
);
export type AccessControllerAddress = typeof AccessControllerAddress.Type;

export const FungibleResourceAddress = Schema.String.pipe(
  Schema.brand('FungibleResourceAddress'),
);
export type FungibleResourceAddress = typeof FungibleResourceAddress.Type;

export const NonFungibleResourceAddress = Schema.String.pipe(
  Schema.brand('NonFungibleResourceAddress'),
);
export type NonFungibleResourceAddress = typeof NonFungibleResourceAddress.Type;
