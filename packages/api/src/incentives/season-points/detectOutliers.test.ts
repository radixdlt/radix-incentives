import { BigNumber } from 'bignumber.js';
import { Effect } from 'effect';
import { describe, expect, test } from 'vitest';
import { detectOutliers } from './detectOutliers';

describe('detectOutliers', () => {
  test('should return empty array for empty input', async () => {
    const users: {
      points: BigNumber;
      userId: string;
      multiplier: string;
    }[] = [];

    const result = await Effect.runPromise(
      detectOutliers(users, new BigNumber(0.05), 'test-category'),
    );

    expect(result).toEqual([]);
  });

  test('should return all users when no outliers detected', async () => {
    const users = [
      {
        userId: 'user1',
        points: new BigNumber(100),
        multiplier: '1',
      },
      {
        userId: 'user2',
        points: new BigNumber(100),
        multiplier: '1',
      },
      {
        userId: 'user3',
        points: new BigNumber(100),
        multiplier: '1',
      },
    ];

    const result = await Effect.runPromise(
      detectOutliers(users, new BigNumber(0.5), 'test-category'), // 50% threshold
    );

    expect(result).toEqual(users);
  });

  test('should detect and remove outliers above threshold', async () => {
    const users = [
      {
        userId: 'outlier1',
        points: new BigNumber(1000), // 50% of total
        multiplier: '1',
      },
      {
        userId: 'outlier2',
        points: new BigNumber(800), // 40% of total
        multiplier: '1',
      },
      {
        userId: 'normal1',
        points: new BigNumber(100), // 5% of total
        multiplier: '1',
      },
      {
        userId: 'normal2',
        points: new BigNumber(100), // 5% of total
        multiplier: '1',
      },
    ];

    // Total: 2000, threshold 10% means users with >200 points are outliers
    const result = await Effect.runPromise(
      detectOutliers(users, new BigNumber(0.1), 'test-category'),
    );

    expect(result).toHaveLength(2);
    expect(result.map((u) => u.userId)).toEqual(['normal1', 'normal2']);
  });

  test('should only check top 10 suppliers', async () => {
    // Create 15 users, where user1-user5 are outliers (> 5% threshold)
    // but only top 10 should be checked for outliers
    const users = Array.from({ length: 15 }, (_, i) => ({
      userId: `user${i + 1}`,
      points: new BigNumber(i < 5 ? 200 : 10), // First 5 have 200 points each, others have 10
      multiplier: '1',
    }));

    // Total points: 5*200 + 10*10 = 1100
    // Users 1-5 have 200/1100 ≈ 18.18% each, well above 5% threshold
    const result = await Effect.runPromise(
      detectOutliers(users, new BigNumber(0.05), 'test-category'),
    );

    // Should remove users 1-5 as outliers, leaving users 6-15
    expect(result).toHaveLength(10);
    expect(result.map((u) => u.userId)).toEqual([
      'user6',
      'user7',
      'user8',
      'user9',
      'user10',
      'user11',
      'user12',
      'user13',
      'user14',
      'user15',
    ]);
  });

  test('should handle zero total supply', async () => {
    const users = [
      {
        userId: 'user1',
        points: new BigNumber(0),
        multiplier: '1',
      },
      {
        userId: 'user2',
        points: new BigNumber(0),
        multiplier: '1',
      },
    ];

    const result = await Effect.runPromise(
      detectOutliers(users, new BigNumber(0.05), 'test-category'),
    );

    expect(result).toEqual(users);
  });

  test('should preserve original user order after outlier removal', async () => {
    const users = [
      {
        userId: 'normal1',
        points: new BigNumber(10),
        multiplier: '1',
      },
      {
        userId: 'outlier1',
        points: new BigNumber(1000), // 90.9% of total
        multiplier: '1',
      },
      {
        userId: 'normal2',
        points: new BigNumber(20),
        multiplier: '1',
      },
      {
        userId: 'normal3',
        points: new BigNumber(70),
        multiplier: '1',
      },
    ];

    const result = await Effect.runPromise(
      detectOutliers(users, new BigNumber(0.5), 'test-category'), // 50% threshold
    );

    expect(result).toHaveLength(3);
    expect(result.map((u) => u.userId)).toEqual([
      'normal1',
      'normal2',
      'normal3',
    ]);
  });

  test('should handle edge case with exactly threshold percentage', async () => {
    const users = [
      {
        userId: 'user1',
        points: new BigNumber(50), // exactly 5%
        multiplier: '1',
      },
      {
        userId: 'user2',
        points: new BigNumber(950), // 95%
        multiplier: '1',
      },
    ];

    const result = await Effect.runPromise(
      detectOutliers(users, new BigNumber(0.05), 'test-category'), // 5% threshold
    );

    // user1 has exactly 5% (not greater than), user2 has 95% (greater than)
    expect(result).toHaveLength(1);
    expect(result[0]?.userId).toBe('user1');
  });
});
