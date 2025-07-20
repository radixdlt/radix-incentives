#!/usr/bin/env node

import { Command } from "commander";
import { runPreview } from "./index.js";
import { dumpDatabase } from "./dump.js";
import {
  ensureDumpsDirectory,
  selectDumpInteractively,
  generateDumpFileName,
  findDumpByName,
  listAvailableDumps,
  formatDumpInfo,
  getDumpsDirectory,
} from "./dumps.js";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import inquirer from "inquirer";

const program = new Command();

type LoadDumpOptions = {
  singleTransaction?: boolean;
  stopOnError?: boolean;
  noPrivileges?: boolean;
  noOwner?: boolean;
};

const loadDumpToDatabase = async (
  databaseUrl: string,
  dumpPath: string,
  options: LoadDumpOptions = {}
): Promise<void> => {
  const {
    singleTransaction = true,
    stopOnError = true,
    noPrivileges = true,
    noOwner = true,
  } = options;

  return new Promise((resolve, reject) => {
    // Build pg_restore arguments
    const args = ["-d", databaseUrl];

    // Add options
    if (singleTransaction) {
      args.push("--single-transaction");
    }

    if (stopOnError) {
      args.push("--exit-on-error");
    }

    // Add user access control options
    if (noPrivileges) {
      args.push("--no-privileges");
    }

    if (noOwner) {
      args.push("--no-owner");
    }

    // Add the dump file
    args.push(dumpPath);

    // Spawn pg_restore process
    const pgRestore = spawn("pg_restore", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    // Handle stdout - collect output for potential logging
    let outputData = "";
    pgRestore.stdout.on("data", (data) => {
      outputData += data.toString();
    });

    // Handle stderr
    let errorOutput = "";
    pgRestore.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    // Handle process completion
    pgRestore.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(`pg_restore failed with code ${code}: ${errorOutput}`)
        );
      }
    });

    // Handle process errors
    pgRestore.on("error", (error) => {
      reject(new Error(`Failed to start pg_restore: ${error.message}`));
    });
  });
};

program
  .name("preview")
  .description(
    "Radix Incentives Preview Tool - Test season points calculations"
  )
  .version("1.0.0");

program
  .command("run")
  .description("Dump database and run season points calculation preview")
  .option(
    "-d, --database-url <url>",
    "PostgreSQL database connection URL (defaults to DATABASE_URL env var)"
  )
  .option(
    "-o, --output <path>",
    "Output directory for results",
    path.join(process.cwd(), "output")
  )
  .option("--dump <name>", "Use specific dump by name (from dumps/ folder)")
  .option(
    "--skip-dump",
    "Skip database dump and use existing dump.sql file (legacy)"
  )
  .option("--dump-only", "Only dump the database, don't run calculations")
  .action(async (options) => {
    try {
      console.log("🚀 Starting Radix Incentives Preview Tool\n");

      // Ensure dumps directory exists
      ensureDumpsDirectory();

      // Ensure output directory exists
      if (!fs.existsSync(options.output)) {
        fs.mkdirSync(options.output, { recursive: true });
        console.log(`📁 Created output directory: ${options.output}`);
      }

      let dumpPath: string;

      // Determine which dump to use
      if (options.skipDump) {
        // Legacy mode - use dump.sql in current directory
        dumpPath = path.join(process.cwd(), "dump.sql");
        console.log("⏭️  Using legacy dump.sql file");

        if (!fs.existsSync(dumpPath)) {
          console.error(
            "❌ Error: dump.sql file not found. Remove --skip-dump or create the dump file first."
          );
          process.exit(1);
        }
      } else if (options.dump) {
        // Use specific named dump
        const foundDump = findDumpByName(options.dump);
        if (!foundDump) {
          console.error(
            `❌ Error: Dump '${options.dump}' not found in dumps/ directory.`
          );
          console.log("\n📂 Available dumps:");
          const dumps = listAvailableDumps();
          if (dumps.length === 0) {
            console.log("   No dumps found. Create one with: pnpm cli dump");
          } else {
            for (const dump of dumps) {
              console.log(`   - ${formatDumpInfo(dump)}`);
            }
          }
          process.exit(1);
        }
        dumpPath = foundDump;
        console.log(`📂 Using dump: ${path.basename(dumpPath)}`);
      } else {
        // Default behavior - interactive selection
        const selection = await selectDumpInteractively();
        if (!selection.dumpPath) {
          // User chose to create new dump
          const databaseUrl =
            selection.customDbUrl ||
            options.databaseUrl ||
            process.env.DATABASE_URL;
          if (!databaseUrl) {
            console.error(
              "❌ Error: Database URL must be provided via --database-url option or DATABASE_URL environment variable"
            );
            process.exit(1);
          }

          const fileName = generateDumpFileName();
          dumpPath = path.join(getDumpsDirectory(), fileName);
          console.log(`📤 Creating new dump: ${fileName}`);
          if (selection.customDbUrl) {
            console.log(
              `🔗 Using custom database: ${selection.customDbUrl.replace(/\/\/[^@]*@/, "//***@")}`
            );
          }
          await dumpDatabase(databaseUrl, dumpPath);
          console.log("✅ Database dump completed");
        } else {
          dumpPath = selection.dumpPath;
          console.log(`📂 Using selected dump: ${path.basename(dumpPath)}`);
        }
      }

      // Stop here if dump-only
      if (options.dumpOnly) {
        console.log("🎯 Dump-only mode: Database dumped successfully");
        return;
      }

      // Step 2: Run preview calculation
      console.log("\n🧮 Running season points calculation...");
      await runPreview(dumpPath, options.output);

      console.log("\n🎉 Preview completed successfully!");
      console.log(
        `📊 Results saved to: ${path.join(options.output, "results.json")}`
      );
      process.exit(0);
    } catch (error) {
      console.error("\n❌ Error running preview:");
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command("dump")
  .description("Create a new database dump")
  .option(
    "-d, --database-url <url>",
    "PostgreSQL database connection URL (defaults to DATABASE_URL env var)"
  )
  .option(
    "-n, --name <name>",
    "Custom name for the dump file (without .dump extension)"
  )
  .action(async (options) => {
    try {
      // Determine database URL from option or environment variable
      const databaseUrl = options.databaseUrl || process.env.DATABASE_URL;

      if (!databaseUrl) {
        console.error(
          "❌ Error: Database URL must be provided via --database-url option or DATABASE_URL environment variable"
        );
        process.exit(1);
      }

      // Ensure dumps directory exists
      ensureDumpsDirectory();

      // Generate dump file name
      const fileName = options.name
        ? `${options.name}.sql`
        : generateDumpFileName();

      const dumpPath = path.join(getDumpsDirectory(), fileName);

      console.log(`📤 Creating dump: ${fileName}`);
      await dumpDatabase(databaseUrl, dumpPath);
      console.log(`✅ Database dumped to: dumps/${fileName}`);
    } catch (error) {
      console.error("❌ Error dumping database:");
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command("load")
  .description("Load a database dump into a database")
  .option(
    "-d, --database-url <url>",
    "PostgreSQL database connection URL (defaults to DATABASE_URL env var)"
  )
  .option(
    "--dump <name>",
    "Specific dump file to load (without .dump extension)"
  )
  .option(
    "--single-transaction",
    "Execute the dump as a single transaction (safer)",
    true
  )
  .option("--stop-on-error", "Stop immediately on any error", true)
  .option(
    "--no-privileges",
    "Skip loading of access privileges (grant/revoke commands) (default: true)",
    true
  )
  .option(
    "--with-privileges",
    "Include loading of access privileges (overrides --no-privileges)",
    false
  )
  .option(
    "--no-owner",
    "Skip restoration of object ownership (default: true)",
    true
  )
  .option(
    "--with-owner",
    "Include restoration of object ownership (overrides --no-owner)",
    false
  )
  .action(async (options) => {
    try {
      console.log("🔄 Loading database dump into database\n");

      // Ensure dumps directory exists
      ensureDumpsDirectory();

      const dumps = listAvailableDumps();
      if (dumps.length === 0) {
        console.error("❌ Error: No database dumps found in dumps/ directory");
        console.log("   Create one with: pnpm cli dump");
        process.exit(1);
      }

      let selectedDumpPath: string;

      // Select dump file
      if (options.dump) {
        const foundDump = findDumpByName(options.dump);
        if (!foundDump) {
          console.error(
            `❌ Error: Dump '${options.dump}' not found in dumps/ directory.`
          );
          console.log("\n📂 Available dumps:");
          for (const dump of dumps) {
            console.log(`   - ${formatDumpInfo(dump)}`);
          }
          process.exit(1);
        }
        selectedDumpPath = foundDump;
      } else {
        // Interactive selection
        const choices = dumps.map((dump, index) => ({
          name: `${formatDumpInfo(dump)}${index === 0 ? " 🆕" : ""}`,
          value: dump.path,
        }));

        const { selectedDump } = await inquirer.prompt([
          {
            type: "list",
            name: "selectedDump",
            message: "Select a dump file to load:",
            choices: choices,
          },
        ]);

        selectedDumpPath = selectedDump;
      }

      console.log(`📂 Selected dump: ${path.basename(selectedDumpPath)}`);

      // Get database URL
      let databaseUrl = options.databaseUrl || process.env.DATABASE_URL;

      if (!databaseUrl) {
        const { inputUrl } = await inquirer.prompt([
          {
            type: "input",
            name: "inputUrl",
            message: "Enter database URL:",
            validate: (input) => {
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
        databaseUrl = inputUrl;
      }

      // Mask password in URL for logging
      const maskedUrl = databaseUrl.replace(/\/\/[^@]*@/, "//***@");
      console.log(`🔗 Target database: ${maskedUrl}`);

      // Confirm before loading
      const { confirmed } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirmed",
          message: "⚠️  This will load data into the database. Continue?",
          default: false,
        },
      ]);

      if (!confirmed) {
        console.log("❌ Operation cancelled");
        process.exit(0);
      }

      // Load the dump
      console.log("\n📥 Loading dump into database...");
      await loadDumpToDatabase(databaseUrl, selectedDumpPath, {
        singleTransaction: options.singleTransaction,
        stopOnError: options.stopOnError,
        noPrivileges: options.withPrivileges ? false : options.noPrivileges,
        noOwner: options.withOwner ? false : options.noOwner,
      });

      console.log("✅ Dump loaded successfully!");
    } catch (error) {
      console.error("\n❌ Error loading dump:");
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command("list")
  .description("List available database dumps")
  .action(() => {
    const dumps = listAvailableDumps();

    if (dumps.length === 0) {
      console.log("📂 No database dumps found in dumps/ directory");
      console.log("   Create one with: pnpm cli dump");
      return;
    }

    console.log("📂 Available database dumps:");
    for (const [index, dump] of dumps.entries()) {
      const marker = index === 0 ? "🆕" : "  ";
      console.log(`${marker} ${formatDumpInfo(dump)}`);
    }
  });

// Show help if no command provided
if (process.argv.length <= 2) {
  program.help();
}

program.parse();
