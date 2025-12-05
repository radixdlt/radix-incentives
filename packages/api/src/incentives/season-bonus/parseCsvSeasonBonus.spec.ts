import { Cause, Effect, Exit } from 'effect';
import { describe, expect, it } from 'vitest';
import { CsvParsingError, parseCsvSeasonBonus } from './parseCsvSeasonBonus';

describe('parseCsvSeasonBonus', () => {
  const validUserId = '00a04a65-6730-4e6b-8b46-e0ac93bab49b';
  const validSeasonId = 'd83eac55-6754-4bf6-8d3f-8ff5252f30ba';

  it('should successfully parse valid CSV with season bonuses', async () => {
    const csvData = `user_id,season_id,season_bonus
${validUserId},${validSeasonId},0.14532
2b25129e-ec6f-4001-b066-f1f2c3992062,${validSeasonId},0.14398`;

    const result = await Effect.runPromiseExit(
      parseCsvSeasonBonus({ csvData }),
    );

    expect(Exit.isSuccess(result)).toBe(true);
    if (Exit.isSuccess(result)) {
      expect(result.value.entries).toEqual([
        {
          userId: validUserId,
          seasonId: validSeasonId,
          seasonBonus: 0.14532,
        },
        {
          userId: '2b25129e-ec6f-4001-b066-f1f2c3992062',
          seasonId: validSeasonId,
          seasonBonus: 0.14398,
        },
      ]);
      expect(result.value.count).toBe(2);
    }
  });

  it('should handle empty CSV and return empty array', async () => {
    const csvData = '';

    const result = await Effect.runPromiseExit(
      parseCsvSeasonBonus({ csvData }),
    );

    expect(Exit.isSuccess(result)).toBe(true);
    if (Exit.isSuccess(result)) {
      expect(result.value.entries).toEqual([]);
      expect(result.value.count).toBe(0);
    }
  });

  it('should handle CSV with only header', async () => {
    const csvData = 'user_id,season_id,season_bonus';

    const result = await Effect.runPromiseExit(
      parseCsvSeasonBonus({ csvData }),
    );

    expect(Exit.isSuccess(result)).toBe(true);
    if (Exit.isSuccess(result)) {
      expect(result.value.entries).toEqual([]);
      expect(result.value.count).toBe(0);
    }
  });

  it('should handle CSV with quoted headers', async () => {
    const csvData = `"user_id","season_id","season_bonus"
${validUserId},${validSeasonId},0.1`;

    const result = await Effect.runPromiseExit(
      parseCsvSeasonBonus({ csvData }),
    );

    expect(Exit.isSuccess(result)).toBe(true);
    if (Exit.isSuccess(result)) {
      expect(result.value.entries).toEqual([
        {
          userId: validUserId,
          seasonId: validSeasonId,
          seasonBonus: 0.1,
        },
      ]);
      expect(result.value.count).toBe(1);
    }
  });

  it('should skip empty lines', async () => {
    const csvData = `user_id,season_id,season_bonus
${validUserId},${validSeasonId},0.05

2b25129e-ec6f-4001-b066-f1f2c3992062,${validSeasonId},0.1`;

    const result = await Effect.runPromiseExit(
      parseCsvSeasonBonus({ csvData }),
    );

    expect(Exit.isSuccess(result)).toBe(true);
    if (Exit.isSuccess(result)) {
      expect(result.value.entries).toHaveLength(2);
      expect(result.value.count).toBe(2);
    }
  });

  it('should accept bonus value of 0', async () => {
    const csvData = `user_id,season_id,season_bonus
${validUserId},${validSeasonId},0`;

    const result = await Effect.runPromiseExit(
      parseCsvSeasonBonus({ csvData }),
    );

    expect(Exit.isSuccess(result)).toBe(true);
    if (Exit.isSuccess(result)) {
      expect(result.value.entries[0]?.seasonBonus).toBe(0);
    }
  });

  it('should accept bonus value of 0.2 (20% max)', async () => {
    const csvData = `user_id,season_id,season_bonus
${validUserId},${validSeasonId},0.2`;

    const result = await Effect.runPromiseExit(
      parseCsvSeasonBonus({ csvData }),
    );

    expect(Exit.isSuccess(result)).toBe(true);
    if (Exit.isSuccess(result)) {
      expect(result.value.entries[0]?.seasonBonus).toBe(0.2);
    }
  });

  it('should fail when required columns are missing', async () => {
    const csvData = `user_id,season_id
${validUserId},${validSeasonId}`;

    const result = await Effect.runPromiseExit(
      parseCsvSeasonBonus({ csvData }),
    );

    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const failure = Cause.failureOption(result.cause);
      expect(failure._tag).toBe('Some');
      if (failure._tag === 'Some') {
        expect(failure.value).toBeInstanceOf(CsvParsingError);
        expect(failure.value.message).toContain(
          "Invalid CSV format. Expected columns: 'user_id', 'season_id', 'season_bonus'",
        );
      }
    }
  });

  it('should fail when user_id is not a valid UUID', async () => {
    const csvData = `user_id,season_id,season_bonus
invalid-uuid,${validSeasonId},0.1`;

    const result = await Effect.runPromiseExit(
      parseCsvSeasonBonus({ csvData }),
    );

    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const failure = Cause.failureOption(result.cause);
      expect(failure._tag).toBe('Some');
      if (failure._tag === 'Some') {
        expect(failure.value).toBeInstanceOf(CsvParsingError);
        expect(failure.value.message).toContain('Invalid user_id format');
      }
    }
  });

  it('should fail when season_id is not a valid UUID', async () => {
    const csvData = `user_id,season_id,season_bonus
${validUserId},not-a-uuid,0.1`;

    const result = await Effect.runPromiseExit(
      parseCsvSeasonBonus({ csvData }),
    );

    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const failure = Cause.failureOption(result.cause);
      expect(failure._tag).toBe('Some');
      if (failure._tag === 'Some') {
        expect(failure.value).toBeInstanceOf(CsvParsingError);
        expect(failure.value.message).toContain('Invalid season_id format');
      }
    }
  });

  it('should fail when season_bonus is not a number', async () => {
    const csvData = `user_id,season_id,season_bonus
${validUserId},${validSeasonId},not-a-number`;

    const result = await Effect.runPromiseExit(
      parseCsvSeasonBonus({ csvData }),
    );

    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const failure = Cause.failureOption(result.cause);
      expect(failure._tag).toBe('Some');
      if (failure._tag === 'Some') {
        expect(failure.value).toBeInstanceOf(CsvParsingError);
        expect(failure.value.message).toContain('Invalid season_bonus value');
      }
    }
  });

  it('should fail when season_bonus is negative', async () => {
    const csvData = `user_id,season_id,season_bonus
${validUserId},${validSeasonId},-0.1`;

    const result = await Effect.runPromiseExit(
      parseCsvSeasonBonus({ csvData }),
    );

    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const failure = Cause.failureOption(result.cause);
      expect(failure._tag).toBe('Some');
      if (failure._tag === 'Some') {
        expect(failure.value).toBeInstanceOf(CsvParsingError);
        expect(failure.value.message).toContain(
          'Season bonus must be between 0 and 0.2',
        );
      }
    }
  });

  it('should fail when season_bonus exceeds 0.2 (20%)', async () => {
    const csvData = `user_id,season_id,season_bonus
${validUserId},${validSeasonId},0.21`;

    const result = await Effect.runPromiseExit(
      parseCsvSeasonBonus({ csvData }),
    );

    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const failure = Cause.failureOption(result.cause);
      expect(failure._tag).toBe('Some');
      if (failure._tag === 'Some') {
        expect(failure.value).toBeInstanceOf(CsvParsingError);
        expect(failure.value.message).toContain(
          'Season bonus must be between 0 and 0.2',
        );
      }
    }
  });

  it('should fail when season_bonus is greater than 1', async () => {
    const csvData = `user_id,season_id,season_bonus
${validUserId},${validSeasonId},1.5`;

    const result = await Effect.runPromiseExit(
      parseCsvSeasonBonus({ csvData }),
    );

    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const failure = Cause.failureOption(result.cause);
      expect(failure._tag).toBe('Some');
      if (failure._tag === 'Some') {
        expect(failure.value).toBeInstanceOf(CsvParsingError);
        expect(failure.value.message).toContain(
          'Season bonus must be between 0 and 0.2',
        );
      }
    }
  });
});
