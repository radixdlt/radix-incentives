#!/usr/bin/env tsx

import inquirer from "inquirer";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

type QueueType =
  | "event"
  | "snapshot-date-range"
  | "calculate-activity-points"
  | "calculate-season-points";

interface QueueConfig {
  name: string;
  endpoint: string;
  description: string;
  promptFields: Array<{
    name: string;
    type: string;
    message: string;
    validate?: (input: any) => boolean | string;
    default?: any;
  }>;
}

const SERVER_URL = process.env.WORKERS_SERVER_URL || "http://localhost:3003";

const queueConfigs: Record<QueueType, QueueConfig> = {
  event: {
    name: "Event Queue",
    endpoint: "/queues/event/add",
    description: "Process blockchain events by transaction ID and event index",
    promptFields: [
      {
        name: "events",
        type: "input",
        message:
          'Enter events as JSON array (e.g., [{"transactionId": "txid_...", "eventIndex": 0}]):',
        validate: (input) => {
          try {
            const parsed = JSON.parse(input);
            if (!Array.isArray(parsed)) {
              return "Input must be an array";
            }
            for (const event of parsed) {
              if (
                !event.transactionId ||
                typeof event.eventIndex !== "number"
              ) {
                return "Each event must have transactionId (string) and eventIndex (number)";
              }
            }
            return true;
          } catch (e) {
            return "Invalid JSON format";
          }
        },
      },
    ],
  },
  "snapshot-date-range": {
    name: "Snapshot Date Range Queue",
    endpoint: "/queues/snapshot-date-range/add",
    description: "Create snapshots for addresses within a date range",
    promptFields: [
      {
        name: "fromTimestamp",
        type: "input",
        message:
          "Enter start timestamp (ISO format, e.g., 2024-01-01T00:00:00.000Z):",
        validate: (input) => {
          try {
            new Date(input).toISOString();
            return true;
          } catch (e) {
            return "Invalid timestamp format. Use ISO format like 2024-01-01T00:00:00.000Z";
          }
        },
      },
      {
        name: "toTimestamp",
        type: "input",
        message:
          "Enter end timestamp (ISO format, e.g., 2024-01-02T00:00:00.000Z):",
        validate: (input) => {
          try {
            new Date(input).toISOString();
            return true;
          } catch (e) {
            return "Invalid timestamp format. Use ISO format like 2024-01-01T00:00:00.000Z";
          }
        },
      },
      {
        name: "addresses",
        type: "input",
        message: "Enter addresses (comma-separated, optional):",
        validate: (input) => {
          if (!input.trim()) return true; // Optional field
          const addresses = input.split(",").map((addr: string) => addr.trim());
          for (const addr of addresses) {
            if (!addr.startsWith("account_rdx")) {
              return 'All addresses must start with "account_rdx"';
            }
          }
          return true;
        },
      },
      {
        name: "intervalInHours",
        type: "number",
        message: "Enter interval in hours (default: 1):",
        default: 1,
        validate: (input) => input > 0 || "Interval must be greater than 0",
      },
    ],
  },
  "calculate-activity-points": {
    name: "Calculate Activity Points Queue",
    endpoint: "/queues/calculate-activity-points/add",
    description: "Calculate activity points for a specific week",
    promptFields: [
      {
        name: "weekId",
        type: "input",
        message: "Enter week ID (UUID):",
        validate: (input) => {
          const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          return uuidRegex.test(input) || "Invalid UUID format";
        },
      },
      {
        name: "addresses",
        type: "input",
        message: "Enter addresses (comma-separated, optional):",
        validate: (input) => {
          if (!input.trim()) return true; // Optional field
          const addresses = input.split(",").map((addr: string) => addr.trim());
          for (const addr of addresses) {
            if (!addr.startsWith("account_rdx")) {
              return 'All addresses must start with "account_rdx"';
            }
          }
          return true;
        },
      },
    ],
  },
  "calculate-season-points": {
    name: "Calculate Season Points Queue",
    endpoint: "/queues/calculate-season-points/add",
    description: "Calculate season points for a specific season and week",
    promptFields: [
      {
        name: "seasonId",
        type: "input",
        message: "Enter season ID (UUID):",
        validate: (input) => {
          const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          return uuidRegex.test(input) || "Invalid UUID format";
        },
      },
      {
        name: "weekId",
        type: "input",
        message: "Enter week ID (UUID):",
        validate: (input) => {
          const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          return uuidRegex.test(input) || "Invalid UUID format";
        },
      },
      {
        name: "force",
        type: "confirm",
        message: "Force recalculation (overwrite existing data)?",
        default: false,
      },
    ],
  },
};

const buildPayload = (
  queueType: QueueType,
  answers: Record<string, any>
): any => {
  switch (queueType) {
    case "event":
      return JSON.parse(answers.events);

    case "snapshot-date-range":
      return {
        fromTimestamp: answers.fromTimestamp,
        toTimestamp: answers.toTimestamp,
        ...(answers.addresses && {
          addresses: answers.addresses
            .split(",")
            .map((addr: string) => addr.trim()),
        }),
        intervalInHours: answers.intervalInHours,
      };

    case "calculate-activity-points":
      return {
        weekId: answers.weekId,
        ...(answers.addresses && {
          addresses: answers.addresses
            .split(",")
            .map((addr: string) => addr.trim()),
        }),
      };

    case "calculate-season-points":
      return {
        seasonId: answers.seasonId,
        weekId: answers.weekId,
        force: answers.force,
      };

    default:
      throw new Error(`Unknown queue type: ${queueType}`);
  }
};

const sendToQueue = async (
  queueType: QueueType,
  payload: any
): Promise<void> => {
  const config = queueConfigs[queueType];
  const url = `${SERVER_URL}${config.endpoint}`;

  console.log(`\n🚀 Sending request to: ${url}`);
  console.log("📦 Payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.text();
    console.log("✅ Success:", result);
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
};

const main = async (): Promise<void> => {
  console.log("🎯 Queue Item CLI Tool");
  console.log(`📍 Server URL: ${SERVER_URL}`);
  console.log("=".repeat(50));

  try {
    // Check server health
    console.log("🔍 Checking server health...");
    const healthResponse = await fetch(`${SERVER_URL}/health`);
    if (!healthResponse.ok) {
      throw new Error(`Server health check failed: ${healthResponse.status}`);
    }
    console.log("✅ Server is healthy\n");

    // Select queue type
    const { queueType } = await inquirer.prompt([
      {
        type: "list",
        name: "queueType",
        message: "Select a queue to add an item to:",
        choices: Object.entries(queueConfigs).map(([key, config]) => ({
          name: `${config.name} - ${config.description}`,
          value: key,
        })),
      },
    ]);

    const selectedConfig = queueConfigs[queueType as QueueType];
    console.log(`\n📋 Selected: ${selectedConfig.name}`);
    console.log(`💡 Description: ${selectedConfig.description}\n`);

    // Collect input data
    const answers = await inquirer.prompt(selectedConfig.promptFields);

    // Build and send payload
    const payload = buildPayload(queueType as QueueType, answers);
    await sendToQueue(queueType as QueueType, payload);

    // Ask if user wants to add another item
    const { again } = await inquirer.prompt([
      {
        type: "confirm",
        name: "again",
        message: "Would you like to add another item to a queue?",
        default: false,
      },
    ]);

    if (again) {
      console.log("\n" + "=".repeat(50));
      await main();
    }
  } catch (error) {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  }
};

// Check if this module is being run directly
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  main().catch(console.error);
}
