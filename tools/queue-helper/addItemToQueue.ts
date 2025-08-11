#!/usr/bin/env tsx

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ActivityId } from 'data';
import { db } from 'db/incentives';
import inquirer from 'inquirer';
// @ts-ignore - inquirer-autocomplete-prompt doesn't have types
import autocomplete from 'inquirer-autocomplete-prompt';

// Register the autocomplete prompt type
inquirer.registerPrompt('autocomplete', autocomplete);

type QueueType =
  | 'event'
  | 'snapshot'
  | 'snapshot-date-range'
  | 'calculate-activity-points'
  | 'calculate-season-points'
  | 'calculate-season-points-multiplier'
  | 'scheduled-calculations'
  | 'populate-leaderboard-cache';

type PromptAnswer = string | number | boolean;

interface QueueConfig {
  name: string;
  endpoint: string;
  description: string;
  promptFields: Array<{
    name: string;
    type: string;
    message: string;
    validate?: (input: PromptAnswer) => boolean | string;
    default?: PromptAnswer;
    choices?: Array<{ name: string; value: string }>;
  }>;
}

const SERVER_URL = process.env.WORKERS_SERVER_URL || 'http://localhost:3003';

// Function to fetch seasons and weeks from database
const fetchSeasonsAndWeeks = async () => {
  try {
    const seasonsData = await db.query.seasons.findMany({
      orderBy: (seasons, { desc }) => [desc(seasons.name)],
    });

    const weeksData = await db.query.weeks.findMany({
      with: {
        season: true,
      },
      orderBy: (weeks, { desc }) => [desc(weeks.startDate)],
    });

    return { seasons: seasonsData, weeks: weeksData };
  } catch (error) {
    console.error('Failed to fetch data from database:', error);
    throw error;
  }
};

// Function to fetch active week for defaults
const fetchActiveWeek = async () => {
  try {
    const activeWeek = await db.query.weeks.findFirst({
      where: (weeks, { eq }) => eq(weeks.processed, false),
      orderBy: (weeks, { desc }) => [desc(weeks.startDate)],
    });
    return activeWeek;
  } catch (error) {
    console.error('Failed to fetch active week from database:', error);
    return null;
  }
};

const queueConfigs: Record<QueueType, QueueConfig> = {
  event: {
    name: 'Event Queue',
    endpoint: '/queues/event/add',
    description: 'Process blockchain events by transaction ID and event index',
    promptFields: [
      {
        name: 'events',
        type: 'input',
        message:
          'Enter events as JSON array (e.g., [{"transactionId": "txid_...", "eventIndex": 0}]):',
        validate: (input) => {
          try {
            const parsed = JSON.parse(input as string);
            if (!Array.isArray(parsed)) {
              return 'Input must be an array';
            }
            for (const event of parsed) {
              if (
                !event.transactionId ||
                typeof event.eventIndex !== 'number'
              ) {
                return 'Each event must have transactionId (string) and eventIndex (number)';
              }
            }
            return true;
          } catch (_e) {
            return 'Invalid JSON format';
          }
        },
      },
    ],
  },
  snapshot: {
    name: 'Snapshot Queue',
    endpoint: '/queues/snapshot/add',
    description:
      'Create a snapshot for specific addresses at a given timestamp',
    promptFields: [
      {
        name: 'timestamp',
        type: 'input',
        message:
          'Enter timestamp (ISO format, e.g., 2024-01-01T00:00:00.000Z):',
        default: new Date().toISOString(),
        validate: (input) => {
          try {
            new Date(input as string).toISOString();
            return true;
          } catch (_e) {
            return 'Invalid timestamp format. Use ISO format like 2024-01-01T00:00:00.000Z';
          }
        },
      },
      {
        name: 'addresses',
        type: 'input',
        message: 'Enter addresses (comma-separated, optional):',
        validate: (input) => {
          if (!(input as string).trim()) return true; // Optional field
          const addresses = (input as string)
            .split(',')
            .map((addr: string) => addr.trim());
          for (const addr of addresses) {
            if (!addr.startsWith('account_rdx')) {
              return 'All addresses must start with "account_rdx"';
            }
          }
          return true;
        },
      },
      {
        name: 'addDummyData',
        type: 'confirm',
        message: 'Add dummy data?',
        default: false,
      },
      {
        name: 'includeActivityIds',
        type: 'autocomplete',
        message:
          'Enter activity ID patterns (comma-separated, optional, supports wildcards):\n' +
          'Examples: c9_*, *_ho_*, dp_lp_*, oc_tr_xrd-xusdc\n' +
          'Available prefixes: c9 (CaviarNine), dp (DefiPlaza), oc (Ociswap), ro (RootFinance), su (Surge), we (WeftFinance)\n' +
          'Categories: ho (holding), lp (liquidity), tr (trading), le (lending)',
        source: async (
          _answers: Record<string, PromptAnswer>,
          input: string,
        ) => {
          if (!input || !input.trim()) {
            return [
              {
                name: 'Press Enter to skip (include all activities)',
                value: '',
              },
            ];
          }

          const patterns = input
            .split(',')
            .map((pattern: string) => pattern.trim())
            .filter((pattern: string) => pattern.length > 0);

          if (patterns.length === 0) {
            return [
              {
                name: 'Press Enter to skip (include all activities)',
                value: '',
              },
            ];
          }

          const matchedIds = matchActivityPatterns(patterns);
          const matchCount = matchedIds.length;

          if (matchCount === 0) {
            return [
              {
                name: `No matches found for: ${input}`,
                value: input,
              },
            ];
          }

          // Show the current input with match count
          const choices = [
            {
              name: `Use current patterns: ${input} (${matchCount} matches)`,
              value: input,
            },
          ];

          // Show preview of matches
          if (matchCount <= 5) {
            choices.push({
              name: `  Matches: ${matchedIds.join(', ')}`,
              value: input,
              disabled: true,
            });
          } else {
            choices.push({
              name: `  Preview: ${matchedIds.slice(0, 5).join(', ')}... and ${matchCount - 5} more`,
              value: input,
              disabled: true,
            });
          }

          return choices;
        },
        suggestOnly: true,
        validate: (input) => {
          if (!(input as string).trim()) return true; // Optional field

          const patterns = (input as string)
            .split(',')
            .map((pattern: string) => pattern.trim())
            .filter((pattern: string) => pattern.length > 0);

          if (patterns.length === 0) return true;

          const matchedIds = matchActivityPatterns(patterns);
          if (matchedIds.length === 0) {
            return 'No activity IDs match the provided patterns';
          }

          return true;
        },
      },
      {
        name: 'usdThreshold',
        type: 'input',
        message: 'Enter USD threshold (optional, e.g., 50):',
        validate: (input) => {
          if (!(input as string).trim()) return true; // Optional field
          const num = Number(input);
          if (Number.isNaN(num) || num < 0) {
            return 'USD threshold must be a positive number';
          }
          return true;
        },
      },
      {
        name: 'batchSize',
        type: 'number',
        message: 'Enter batch size (optional, default: 10000):',
        default: 10000,
        validate: (input) => {
          if (!input) return true; // Optional field
          if ((input as number) <= 0) {
            return 'Batch size must be greater than 0';
          }
          return true;
        },
      },
    ],
  },
  'snapshot-date-range': {
    name: 'Snapshot Date Range Queue',
    endpoint: '/queues/snapshot-date-range/add',
    description: 'Create snapshots for addresses within a date range',
    promptFields: [
      {
        name: 'fromTimestamp',
        type: 'input',
        message:
          'Enter start timestamp (ISO format, e.g., 2024-01-01T00:00:00.000Z):',
        validate: (input) => {
          try {
            new Date(input as string).toISOString();
            return true;
          } catch (_e) {
            return 'Invalid timestamp format. Use ISO format like 2024-01-01T00:00:00.000Z';
          }
        },
      },
      {
        name: 'toTimestamp',
        type: 'input',
        message:
          'Enter end timestamp (ISO format, e.g., 2024-01-02T00:00:00.000Z):',
        validate: (input) => {
          try {
            new Date(input as string).toISOString();
            return true;
          } catch (_e) {
            return 'Invalid timestamp format. Use ISO format like 2024-01-01T00:00:00.000Z';
          }
        },
      },
      {
        name: 'addresses',
        type: 'input',
        message: 'Enter addresses (comma-separated, optional):',
        validate: (input) => {
          if (!(input as string).trim()) return true; // Optional field
          const addresses = (input as string)
            .split(',')
            .map((addr: string) => addr.trim());
          for (const addr of addresses) {
            if (!addr.startsWith('account_rdx')) {
              return 'All addresses must start with "account_rdx"';
            }
          }
          return true;
        },
      },
      {
        name: 'intervalInHours',
        type: 'number',
        message: 'Enter interval in hours (default: 1):',
        default: 1,
        validate: (input) =>
          (input as number) > 0 || 'Interval must be greater than 0',
      },
      {
        name: 'addDummyData',
        type: 'confirm',
        message: 'Add dummy data?',
        default: false,
      },
      {
        name: 'includeActivityIds',
        type: 'autocomplete',
        message:
          'Enter activity ID patterns (comma-separated, optional, supports wildcards):\n' +
          'Examples: c9_*, *_ho_*, dp_lp_*, oc_tr_xrd-xusdc\n' +
          'Available prefixes: c9 (CaviarNine), dp (DefiPlaza), oc (Ociswap), ro (RootFinance), su (Surge), we (WeftFinance)\n' +
          'Categories: ho (holding), lp (liquidity), tr (trading), le (lending)',
        source: async (
          _answers: Record<string, PromptAnswer>,
          input: string,
        ) => {
          if (!input || !input.trim()) {
            return [
              {
                name: 'Press Enter to skip (include all activities)',
                value: '',
              },
            ];
          }

          const patterns = input
            .split(',')
            .map((pattern: string) => pattern.trim())
            .filter((pattern: string) => pattern.length > 0);

          if (patterns.length === 0) {
            return [
              {
                name: 'Press Enter to skip (include all activities)',
                value: '',
              },
            ];
          }

          const matchedIds = matchActivityPatterns(patterns);
          const matchCount = matchedIds.length;

          if (matchCount === 0) {
            return [
              {
                name: `No matches found for: ${input}`,
                value: input,
              },
            ];
          }

          // Show the current input with match count
          const choices = [
            {
              name: `Use current patterns: ${input} (${matchCount} matches)`,
              value: input,
            },
          ];

          // Show preview of matches
          if (matchCount <= 5) {
            choices.push({
              name: `  Matches: ${matchedIds.join(', ')}`,
              value: input,
              disabled: true,
            });
          } else {
            choices.push({
              name: `  Preview: ${matchedIds.slice(0, 5).join(', ')}... and ${matchCount - 5} more`,
              value: input,
              disabled: true,
            });
          }

          return choices;
        },
        suggestOnly: true,
        validate: (input) => {
          if (!(input as string).trim()) return true; // Optional field

          const patterns = (input as string)
            .split(',')
            .map((pattern: string) => pattern.trim())
            .filter((pattern: string) => pattern.length > 0);

          if (patterns.length === 0) return true;

          const matchedIds = matchActivityPatterns(patterns);
          if (matchedIds.length === 0) {
            return 'No activity IDs match the provided patterns';
          }

          return true;
        },
      },
      {
        name: 'usdThreshold',
        type: 'input',
        message: 'Enter USD threshold (optional, e.g., 50):',
        validate: (input) => {
          if (!(input as string).trim()) return true; // Optional field
          const num = Number(input);
          if (Number.isNaN(num) || num < 0) {
            return 'USD threshold must be a positive number';
          }
          return true;
        },
      },
      {
        name: 'batchSize',
        type: 'number',
        message: 'Enter batch size (optional, default: 10000):',
        default: 10000,
        validate: (input) => {
          if (!input) return true; // Optional field
          if ((input as number) <= 0) {
            return 'Batch size must be greater than 0';
          }
          return true;
        },
      },
    ],
  },
  'calculate-activity-points': {
    name: 'Calculate Activity Points Queue',
    endpoint: '/queues/calculate-activity-points/add',
    description: 'Calculate activity points for a specific week',
    promptFields: [
      {
        name: 'weekId',
        type: 'list',
        message: 'Select a week:',
      },
      {
        name: 'addresses',
        type: 'input',
        message: 'Enter addresses (comma-separated, optional):',
        validate: (input) => {
          if (!(input as string).trim()) return true; // Optional field
          const addresses = (input as string)
            .split(',')
            .map((addr: string) => addr.trim());
          for (const addr of addresses) {
            if (!addr.startsWith('account_rdx')) {
              return 'All addresses must start with "account_rdx"';
            }
          }
          return true;
        },
      },
    ],
  },
  'calculate-season-points': {
    name: 'Calculate Season Points Queue',
    endpoint: '/queues/calculate-season-points/add',
    description: 'Calculate season points for a specific week',
    promptFields: [
      {
        name: 'weekId',
        type: 'list',
        message: 'Select a week:',
      },
      {
        name: 'force',
        type: 'confirm',
        message: 'Force recalculation (overwrite existing data)?',
        default: false,
      },
      {
        name: 'markAsProcessed',
        type: 'confirm',
        message: 'Mark week as processed after calculation?',
        default: false,
      },
    ],
  },
  'calculate-season-points-multiplier': {
    name: 'Calculate Season Points Multiplier Queue',
    endpoint: '/queues/calculate-season-points-multiplier/add',
    description: 'Calculate season points multiplier for a specific week',
    promptFields: [
      {
        name: 'weekId',
        type: 'list',
        message: 'Select a week:',
      },
      {
        name: 'userIds',
        type: 'input',
        message: 'Enter user IDs (comma-separated, optional):',
        validate: (input) => {
          if (!(input as string).trim()) return true; // Optional field
          const userIds = (input as string)
            .split(',')
            .map((id: string) => id.trim());
          const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          for (const id of userIds) {
            if (!uuidRegex.test(id)) {
              return 'All user IDs must be valid UUIDs';
            }
          }
          return true;
        },
      },
    ],
  },
  'scheduled-calculations': {
    name: 'Scheduled Calculations Queue',
    endpoint: '/queues/scheduled-calculations/add',
    description: 'Manually trigger the scheduled calculations job.',
    promptFields: [
      {
        name: 'weekId',
        type: 'list',
        message: 'Select a week (optional):',
      },
      {
        name: 'force',
        type: 'confirm',
        message: 'Force recalculation (overwrite existing data)?',
        default: false,
      },
      {
        name: 'markAsProcessed',
        type: 'confirm',
        message: 'Mark week as processed after calculation?',
        default: false,
      },
      {
        name: 'includeSPCalculations',
        type: 'confirm',
        message: 'Include season points calculations (admin processing)?',
        default: false,
      },
    ],
  },
  'populate-leaderboard-cache': {
    name: 'Populate Leaderboard Cache Queue',
    endpoint: '/queues/populate-leaderboard-cache/add',
    description:
      'Populate leaderboard cache for specific season, week, or all data.',
    promptFields: [
      {
        name: 'scope',
        type: 'list',
        message: 'What would you like to populate?',
        choices: [
          { name: 'All seasons and weeks', value: 'all' },
          { name: 'Specific season', value: 'season' },
          { name: 'Specific week', value: 'week' },
        ],
      },
      {
        name: 'seasonId',
        type: 'list',
        message: 'Select a season:',
      },
      {
        name: 'weekId',
        type: 'list',
        message: 'Select a week:',
      },
    ],
  },
};

type QueuePayload = Record<string, unknown>;

// Function to convert glob patterns to matching activity IDs
const matchActivityPatterns = (patterns: string[]): string[] => {
  const allActivityIds = Object.keys(ActivityId);
  const matchedIds = new Set<string>();

  for (const pattern of patterns) {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*') // Replace * with .*
      .replace(/\?/g, '.'); // Replace ? with .

    const regex = new RegExp(`^${regexPattern}$`);

    for (const activityId of allActivityIds) {
      if (regex.test(activityId)) {
        matchedIds.add(activityId);
      }
    }
  }

  return Array.from(matchedIds);
};

const buildPayload = (
  queueType: QueueType,
  answers: Record<string, PromptAnswer>,
): QueuePayload => {
  switch (queueType) {
    case 'event':
      return JSON.parse(answers.events as string);

    case 'snapshot':
      return {
        timestamp: answers.timestamp,
        ...(answers.addresses && {
          addresses: (answers.addresses as string)
            .split(',')
            .map((addr: string) => addr.trim())
            .filter((addr: string) => addr.length > 0),
        }),
        addDummyData: answers.addDummyData,
        ...(answers.includeActivityIds && {
          includeActivityIds: (() => {
            const patterns = (answers.includeActivityIds as string)
              .split(',')
              .map((pattern: string) => pattern.trim())
              .filter((pattern: string) => pattern.length > 0);

            return patterns.length > 0
              ? matchActivityPatterns(patterns)
              : undefined;
          })(),
        }),
        ...(answers.usdThreshold && {
          usdThreshold: answers.usdThreshold,
        }),
        ...(answers.batchSize && {
          batchSize: answers.batchSize,
        }),
      };

    case 'snapshot-date-range':
      return {
        fromTimestamp: answers.fromTimestamp,
        toTimestamp: answers.toTimestamp,
        ...(answers.addresses && {
          addresses: (answers.addresses as string)
            .split(',')
            .map((addr: string) => addr.trim()),
        }),
        intervalInHours: answers.intervalInHours,
        addDummyData: answers.addDummyData,
        ...(answers.includeActivityIds && {
          includeActivityIds: (() => {
            const patterns = (answers.includeActivityIds as string)
              .split(',')
              .map((pattern: string) => pattern.trim())
              .filter((pattern: string) => pattern.length > 0);

            return patterns.length > 0
              ? matchActivityPatterns(patterns)
              : undefined;
          })(),
        }),
        ...(answers.usdThreshold && {
          usdThreshold: answers.usdThreshold,
        }),
        ...(answers.batchSize && {
          batchSize: answers.batchSize,
        }),
      };

    case 'calculate-activity-points':
      return {
        weekId: answers.weekId,
        ...(answers.addresses && {
          addresses: (answers.addresses as string)
            .split(',')
            .map((addr: string) => addr.trim()),
        }),
      };

    case 'calculate-season-points':
      return {
        weekId: answers.weekId,
        force: answers.force,
        markAsProcessed: answers.markAsProcessed,
      };

    case 'calculate-season-points-multiplier':
      return {
        weekId: answers.weekId,
        ...(answers.userIds && {
          userIds: (answers.userIds as string)
            .split(',')
            .map((id: string) => id.trim()),
        }),
      };

    case 'scheduled-calculations':
      return {
        ...(answers.weekId &&
          answers.weekId !== '' && { weekId: answers.weekId }),
        force: answers.force,
        markAsProcessed: answers.markAsProcessed,
        includeSPCalculations: answers.includeSPCalculations,
      };

    case 'populate-leaderboard-cache': {
      const payload: Record<string, unknown> = {};

      if (answers.scope === 'season' && answers.seasonId) {
        payload.seasonId = answers.seasonId;
      } else if (answers.scope === 'week' && answers.weekId) {
        payload.weekId = answers.weekId;
      }
      // For "all", we don't add seasonId or weekId, so it processes everything

      return payload;
    }

    default:
      throw new Error(`Unknown queue type: ${queueType}`);
  }
};

const sendToQueue = async (
  queueType: QueueType,
  payload: QueuePayload,
): Promise<void> => {
  const config = queueConfigs[queueType];
  const url = `${SERVER_URL}${config.endpoint}`;

  console.log(`\n🚀 Sending request to: ${url}`);
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.text();
    console.log('✅ Success:', result);
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};

const main = async (): Promise<void> => {
  console.log('🎯 Queue Item CLI Tool');
  console.log(`📍 Server URL: ${SERVER_URL}`);
  console.log('='.repeat(50));

  try {
    // Check server health
    console.log('🔍 Checking server health...');
    const healthResponse = await fetch(`${SERVER_URL}/health`);
    if (!healthResponse.ok) {
      throw new Error(`Server health check failed: ${healthResponse.status}`);
    }
    console.log('✅ Server is healthy\n');

    // Select queue type
    const { queueType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'queueType',
        message: 'Select a queue to add an item to:',
        choices: Object.entries(queueConfigs).map(([key, config]) => ({
          name: `${config.name} - ${config.description}`,
          value: key,
        })),
      },
    ]);

    const selectedConfig = queueConfigs[queueType as QueueType];
    console.log(`\n📋 Selected: ${selectedConfig.name}`);
    console.log(`💡 Description: ${selectedConfig.description}\n`);

    let promptFields = selectedConfig.promptFields;

    // Handle queues that require database-driven choices for weekId
    const requiresDatabaseChoices = [
      'scheduled-calculations',
      'calculate-activity-points',
      'calculate-season-points',
      'calculate-season-points-multiplier',
      'populate-leaderboard-cache',
    ];

    if (requiresDatabaseChoices.includes(queueType)) {
      console.log('🔍 Fetching seasons and weeks from database...');
      const { seasons: seasonsData, weeks: weeksData } =
        await fetchSeasonsAndWeeks();

      const weekChoices = weeksData.map((week) => {
        const processingStatus = week.processed ? 'processed' : 'not processed';
        return {
          name: `Week ${week.startDate.toISOString().split('T')[0]} to ${week.endDate.toISOString().split('T')[0]} (${processingStatus}) - Season: ${week.season?.name || 'Unknown'}`,
          value: week.id,
        };
      });

      const seasonChoices = seasonsData.map((season) => ({
        name: `${season.name} (${season.status})`,
        value: season.id,
      }));

      // Add "None" option for scheduled-calculations weekId (which is optional)
      if (queueType === 'scheduled-calculations') {
        weekChoices.unshift({
          name: 'None (process all unprocessed weeks)',
          value: '',
        });
      }

      // Update prompt fields with database choices
      promptFields = promptFields.map((field) => {
        if (field.name === 'weekId' && field.type === 'list') {
          return {
            ...field,
            choices: weekChoices,
          };
        }
        if (field.name === 'seasonId' && field.type === 'list') {
          return {
            ...field,
            choices: seasonChoices,
          };
        }
        return field;
      });
    }

    // Handle snapshot-date-range queue with active week defaults
    if (queueType === 'snapshot-date-range') {
      console.log('🔍 Fetching active week for defaults...');
      const activeWeek = await fetchActiveWeek();

      if (activeWeek) {
        console.log(
          `✅ Found unprocessed week: ${activeWeek.startDate.toISOString().split('T')[0]} to ${activeWeek.endDate.toISOString().split('T')[0]}`,
        );

        // Update prompt fields with active week defaults
        promptFields = promptFields.map((field) => {
          if (field.name === 'fromTimestamp') {
            return {
              ...field,
              default: activeWeek.startDate.toISOString(),
              message: `Enter start timestamp (default: unprocessed week start - ${activeWeek.startDate.toISOString()}):`,
            };
          }
          if (field.name === 'toTimestamp') {
            return {
              ...field,
              default: activeWeek.endDate.toISOString(),
              message: `Enter end timestamp (default: unprocessed week end - ${activeWeek.endDate.toISOString()}):`,
            };
          }
          return field;
        });
      } else {
        console.log('⚠️  No unprocessed week found, using manual input');
      }
    }

    // Handle dynamic prompting for populate-leaderboard-cache
    let answers: Record<string, PromptAnswer>;

    if (queueType === 'populate-leaderboard-cache') {
      // First, ask for scope
      const scopeAnswer = await inquirer.prompt([
        promptFields.find((field) => field.name === 'scope')!,
      ]);

      // Then ask for additional fields based on scope
      const additionalFields: Array<{
        name: string;
        type: string;
        message: string;
        validate?: (input: PromptAnswer) => boolean | string;
        default?: PromptAnswer;
        choices?: Array<{ name: string; value: string }>;
      }> = [];

      if (scopeAnswer.scope === 'season') {
        additionalFields.push(
          promptFields.find((field) => field.name === 'seasonId')!,
        );
      } else if (scopeAnswer.scope === 'week') {
        additionalFields.push(
          promptFields.find((field) => field.name === 'weekId')!,
        );
      }
      // For "all", no additional fields needed

      const additionalAnswers = await inquirer.prompt(additionalFields);
      answers = { ...scopeAnswer, ...additionalAnswers };
    } else {
      // Collect input data normally for other queues
      answers = await inquirer.prompt(promptFields);
    }

    // Handle empty weekId for scheduled-calculations
    const processedAnswers: Record<string, PromptAnswer> =
      queueType === 'scheduled-calculations' && answers.weekId === ''
        ? { ...answers, weekId: '' }
        : answers;

    // Build and send payload
    const payload = buildPayload(queueType as QueueType, processedAnswers);
    await sendToQueue(queueType as QueueType, payload);

    // Ask if user wants to add another item
    const { again } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'again',
        message: 'Would you like to add another item to a queue?',
        default: false,
      },
    ]);

    if (again) {
      console.log(`\n${'='.repeat(50)}`);
      await main();
    }
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
};

// Check if this module is being run directly
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  main().catch(console.error);
}
