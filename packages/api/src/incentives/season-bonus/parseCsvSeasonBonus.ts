import { Effect } from 'effect';

export class CsvParsingError {
  readonly _tag = 'CsvParsingError';
  constructor(readonly message: string) {}
}

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

/**
 * Parses a CSV file containing user season bonuses.
 * Expected format: user_id,season_id,season_bonus
 * Validates that season_bonus is between 0 and 0.2 (20%)
 */
export const parseCsvSeasonBonus = (
  input: ParseCsvSeasonBonusInput,
): Effect.Effect<ParseCsvSeasonBonusOutput, CsvParsingError> =>
  Effect.gen(function* () {
    const lines = input.csvData.trim().split('\n');
    const entries: SeasonBonusEntry[] = [];

    // Handle empty CSV
    if (lines.length === 0 || (lines.length === 1 && !lines[0]?.trim())) {
      return {
        entries: [],
        count: 0,
      };
    }

    const header = lines[0];

    // Validate header
    if (
      !header?.includes('user_id') ||
      !header?.includes('season_id') ||
      !header?.includes('season_bonus')
    ) {
      return yield* Effect.fail(
        new CsvParsingError(
          "Invalid CSV format. Expected columns: 'user_id', 'season_id', 'season_bonus'",
        ),
      );
    }

    // Find column indices
    const headers = header.split(',').map((h) => h.trim().replace(/"/g, ''));
    const userIdIndex = headers.findIndex((h) => h === 'user_id');
    const seasonIdIndex = headers.findIndex((h) => h === 'season_id');
    const seasonBonusIndex = headers.findIndex((h) => h === 'season_bonus');

    if (userIdIndex === -1 || seasonIdIndex === -1 || seasonBonusIndex === -1) {
      return yield* Effect.fail(
        new CsvParsingError('Required columns not found in CSV'),
      );
    }

    // Parse entries from CSV
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      const columns = line
        .split(',')
        .map((col) => col.trim().replace(/"/g, ''));

      const userId = columns[userIdIndex];
      const seasonId = columns[seasonIdIndex];
      const seasonBonusStr = columns[seasonBonusIndex];

      // Validate required fields
      if (!userId || !seasonId || !seasonBonusStr) {
        return yield* Effect.fail(
          new CsvParsingError(
            `Missing required field(s) on line ${i + 1}: user_id, season_id, or season_bonus`,
          ),
        );
      }

      // Validate UUID format for user_id and season_id
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        return yield* Effect.fail(
          new CsvParsingError(
            `Invalid user_id format on line ${i + 1}: ${userId}`,
          ),
        );
      }
      if (!uuidRegex.test(seasonId)) {
        return yield* Effect.fail(
          new CsvParsingError(
            `Invalid season_id format on line ${i + 1}: ${seasonId}`,
          ),
        );
      }

      // Parse and validate season_bonus
      const seasonBonus = Number.parseFloat(seasonBonusStr);
      if (Number.isNaN(seasonBonus)) {
        return yield* Effect.fail(
          new CsvParsingError(
            `Invalid season_bonus value on line ${i + 1}: ${seasonBonusStr}`,
          ),
        );
      }

      // Validate season_bonus range (0 to 0.2 = 0% to 20%)
      if (seasonBonus < 0 || seasonBonus > 0.2) {
        return yield* Effect.fail(
          new CsvParsingError(
            `Season bonus must be between 0 and 0.2 (20%) on line ${i + 1}: ${seasonBonus}`,
          ),
        );
      }

      entries.push({
        userId,
        seasonId,
        seasonBonus,
      });
    }

    return {
      entries,
      count: entries.length,
    };
  });
