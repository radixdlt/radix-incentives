import { Schema } from 'effect';

export const UserId = Schema.String.pipe(Schema.brand('UserId'));
export type UserId = typeof UserId.Type;

export const SeasonId = Schema.String.pipe(Schema.brand('SeasonId'));
export type SeasonId = typeof SeasonId.Type;

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
