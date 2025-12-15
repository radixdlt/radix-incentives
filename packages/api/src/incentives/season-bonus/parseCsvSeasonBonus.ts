import { Data, Effect, Schema } from 'effect';
import Papa from 'papaparse';

export class CsvParsingError extends Data.TaggedError('CsvParsingError')<{
  message: string;
}> {}

export type ParseCsvSeasonBonusInput = {
  csvData: string;
};

export type SeasonBonusEntry = {
  userId: string;
  seasonId: string;
  seasonBonus: number;
};

export type ParseCsvSeasonBonusOutput = {
  entries: SeasonBonusEntry[];
  count: number;
};

type CsvRow = {
  user_id: string;
  season_id: string;
  season_bonus: string;
};

const SeasonBonusEntrySchema = Schema.Struct({
  userId: Schema.propertySignature(Schema.UUID).pipe(Schema.fromKey('user_id')),
  seasonId: Schema.propertySignature(Schema.UUID).pipe(
    Schema.fromKey('season_id'),
  ),
  seasonBonus: Schema.propertySignature(
    Schema.NumberFromString.pipe(Schema.between(0, 0.2)),
  ).pipe(Schema.fromKey('season_bonus')),
});

/**
 * Parses a CSV file containing user season bonuses.
 * Expected format: user_id,season_id,season_bonus
 * Validates that season_bonus is between 0 and 0.2 (20%)
 */
export const parseCsvSeasonBonus = (
  input: ParseCsvSeasonBonusInput,
): Effect.Effect<ParseCsvSeasonBonusOutput, CsvParsingError> =>
  Effect.gen(function* () {
    // Validate CSV is not empty
    if (!input.csvData || input.csvData.trim() === '') {
      return yield* Effect.fail(
        new CsvParsingError({
          message: 'CSV data cannot be empty',
        }),
      );
    }

    // Parse CSV using papaparse
    const parseResult = Papa.parse<CsvRow>(input.csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    // Check for parsing errors (but ignore "UndetectableDelimiter" for header-only CSV)
    const realErrors = parseResult.errors.filter(
      (error) => error.code !== 'UndetectableDelimiter',
    );
    if (realErrors.length > 0) {
      const firstError = realErrors[0];
      return yield* Effect.fail(
        new CsvParsingError({
          message: `CSV parsing error on row ${firstError?.row ?? 'unknown'}: ${firstError?.message ?? 'unknown error'}`,
        }),
      );
    }

    const rows = parseResult.data;

    // Handle empty CSV
    if (rows.length === 0) {
      return {
        entries: [],
        count: 0,
      };
    }

    // Validate that required columns exist
    const firstRow = rows[0];
    if (!firstRow) {
      return {
        entries: [],
        count: 0,
      };
    }

    if (
      !('user_id' in firstRow) ||
      !('season_id' in firstRow) ||
      !('season_bonus' in firstRow)
    ) {
      return yield* Effect.fail(
        new CsvParsingError({
          message:
            "Invalid CSV format. Expected columns: 'user_id', 'season_id', 'season_bonus'",
        }),
      );
    }

    const entries: SeasonBonusEntry[] = [];

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      // Trim all fields
      const trimmedRow = {
        user_id: row.user_id?.trim(),
        season_id: row.season_id?.trim(),
        season_bonus: row.season_bonus?.trim(),
      };

      // Validate required fields
      if (
        !trimmedRow.user_id ||
        !trimmedRow.season_id ||
        !trimmedRow.season_bonus
      ) {
        return yield* Effect.fail(
          new CsvParsingError({
            message: `Missing required field(s) on row ${i + 1}: user_id, season_id, or season_bonus`,
          }),
        );
      }

      // Parse and validate using schema
      const entry = yield* Schema.decodeUnknown(SeasonBonusEntrySchema)(
        trimmedRow,
      ).pipe(
        Effect.mapError(
          (error) =>
            new CsvParsingError({
              message: `Validation error on row ${i + 1}: ${error.message || String(error)}`,
            }),
        ),
      );

      entries.push(entry);
    }

    return {
      entries,
      count: entries.length,
    };
  });
