import fs from "node:fs";
import path from "node:path";
import inquirer from "inquirer";

export type DumpInfo = {
  name: string;
  path: string;
  size: number;
  modified: Date;
};

export const getDumpsDirectory = (): string => {
  return path.join(process.cwd(), "dumps");
};

export const ensureDumpsDirectory = (): void => {
  const dumpsDir = getDumpsDirectory();
  if (!fs.existsSync(dumpsDir)) {
    fs.mkdirSync(dumpsDir, { recursive: true });
  }
};

export const listAvailableDumps = (): DumpInfo[] => {
  const dumpsDir = getDumpsDirectory();

  if (!fs.existsSync(dumpsDir)) {
    return [];
  }

  const files = fs.readdirSync(dumpsDir);
  const dumpFiles = files.filter((file) => file.endsWith(".dump"));

  return dumpFiles
    .map((file) => {
      const filePath = path.join(dumpsDir, file);
      const stats = fs.statSync(filePath);

      return {
        name: file,
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
      };
    })
    .sort((a, b) => b.modified.getTime() - a.modified.getTime()); // Most recent first
};

export const formatFileSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export const formatDumpInfo = (dump: DumpInfo): string => {
  const size = formatFileSize(dump.size);
  const date = dump.modified.toLocaleDateString();
  const time = dump.modified.toLocaleTimeString();

  return `${dump.name} (${size}, modified ${date} ${time})`;
};

type DumpChoice =
  | { type: "existing"; path: string }
  | { type: "new-default" }
  | { type: "new-custom" };

export const selectDumpInteractively = async (): Promise<{
  dumpPath: string | null;
  customDbUrl?: string;
}> => {
  const dumps = listAvailableDumps();

  if (dumps.length === 0) {
    console.log("📂 No SQL dumps found in the dumps/ directory.");

    // Show options even when no dumps exist
    const choices = [
      {
        name: "📥 Create new dump from database",
        value: { type: "new-default" },
      },
      {
        name: "🔗 Create new dump from custom database",
        value: { type: "new-custom" },
      },
      { name: "❌ Exit", value: { type: "exit" } },
    ];

    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "selectedOption",
        message: "No dumps available. What would you like to do?",
        choices,
      },
    ]);

    const selectedOption = answer.selectedOption;

    if (selectedOption.type === "exit") {
      console.log("👋 Exiting...");
      process.exit(0);
    }

    if (selectedOption.type === "new-custom") {
      const dbUrlAnswer = await inquirer.prompt([
        {
          type: "input",
          name: "databaseUrl",
          message: "Enter database connection string:",
          validate: (input: string) => {
            if (!input.trim()) {
              return "Database URL is required";
            }
            if (
              !input.startsWith("postgresql://") &&
              !input.startsWith("postgres://")
            ) {
              return "Database URL must start with postgresql:// or postgres://";
            }
            return true;
          },
        },
      ]);

      return { dumpPath: null, customDbUrl: dbUrlAnswer.databaseUrl };
    }

    // For "new-default", return null to create new dump
    return { dumpPath: null };
  }

  const choices: Array<{ name: string; value: DumpChoice }> = dumps.map(
    (dump) => ({
      name: formatDumpInfo(dump),
      value: { type: "existing", path: dump.path },
    })
  );

  choices.push({
    name: "📥 Create new dump from database",
    value: { type: "new-default" },
  });

  choices.push({
    name: "🔗 Create new dump from custom database",
    value: { type: "new-custom" },
  });

  const answer = await inquirer.prompt([
    {
      type: "list",
      name: "selectedOption",
      message: "Select a SQL dump to use:",
      choices,
      pageSize: 10,
    },
  ]);

  const selectedOption = answer.selectedOption;

  if (selectedOption.type === "existing") {
    return { dumpPath: selectedOption.path };
  }

  if (selectedOption.type === "new-default") {
    return { dumpPath: null };
  }

  if (selectedOption.type === "new-custom") {
    const dbUrlAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "databaseUrl",
        message: "Enter database connection string:",
        validate: (input: string) => {
          if (!input.trim()) {
            return "Database URL is required";
          }
          if (
            !input.startsWith("postgresql://") &&
            !input.startsWith("postgres://")
          ) {
            return "Database URL must start with postgresql:// or postgres://";
          }
          return true;
        },
      },
    ]);

    return { dumpPath: null, customDbUrl: dbUrlAnswer.databaseUrl };
  }

  return { dumpPath: null };
};

export const generateDumpFileName = (prefix = "dump"): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  return `${prefix}_${timestamp}.dump`;
};

export const findDumpByName = (name: string): string | null => {
  const dumps = listAvailableDumps();

  // Try exact match first
  let dump = dumps.find((d) => d.name === name);
  if (dump) return dump.path;

  // Try with .dump extension
  if (!name.endsWith(".dump")) {
    dump = dumps.find((d) => d.name === `${name}.dump`);
    if (dump) return dump.path;
  }

  // Try partial match (case insensitive)
  dump = dumps.find((d) => d.name.toLowerCase().includes(name.toLowerCase()));
  if (dump) return dump.path;

  return null;
};
