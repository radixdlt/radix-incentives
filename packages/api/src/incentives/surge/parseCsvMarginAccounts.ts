import { Effect } from 'effect';

export class CsvParsingError {
  readonly _tag = 'CsvParsingError';
  constructor(readonly message: string) {}
}

export type ParseCsvMarginAccountsInput = {
  csvData: string;
};

export type ParseCsvMarginAccountsOutput = {
  marginAccountAddresses: string[];
  count: number;
};

export const parseCsvMarginAccounts = (
  input: ParseCsvMarginAccountsInput,
): Effect.Effect<ParseCsvMarginAccountsOutput, CsvParsingError> =>
  Effect.gen(function* () {
    const lines = input.csvData.trim().split('\n');
    const marginAccountAddresses: string[] = [];

    // Handle empty CSV
    if (lines.length === 0 || (lines.length === 1 && !lines[0]?.trim())) {
      return {
        marginAccountAddresses: [],
        count: 0,
      };
    }

    const header = lines[0];

    if (!header?.includes('address')) {
      return yield* Effect.fail(
        new CsvParsingError("Invalid CSV format. Expected 'address' column"),
      );
    }

    // Find the column index for address
    const headers = header.split(',').map((h) => h.trim());
    const addressIndex = headers.findIndex(
      (h) => h === 'address' || h === '"address"',
    );

    if (addressIndex === -1) {
      return yield* Effect.fail(
        new CsvParsingError('Address column not found'),
      );
    }

    // Parse margin account addresses from CSV
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      const columns = line
        .split(',')
        .map((col) => col.trim().replace(/"/g, ''));
      const marginAccountAddress = columns[addressIndex];

      if (!marginAccountAddress) {
        continue;
      }

      if (!marginAccountAddress.startsWith('component_')) {
        return yield* Effect.fail(
          new CsvParsingError(
            `Invalid margin account address at row ${i + 1}: ${marginAccountAddress}. Must start with 'component_'`,
          ),
        );
      }

      marginAccountAddresses.push(marginAccountAddress);
    }

    return {
      marginAccountAddresses,
      count: marginAccountAddresses.length,
    };
  });
