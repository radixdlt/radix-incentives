import { spawn } from "node:child_process";
import fs from "node:fs";

export type DumpOptions = {
  excludeTables?: string[];
  outputPath?: string;
};

export const dumpDatabase = async (
  databaseUrl: string,
  outputPath: string,
  options: DumpOptions = {}
): Promise<void> => {
  const { excludeTables = ["account_balances"] } = options;

  return new Promise((resolve, reject) => {
    // Build pg_dump arguments
    const args = [databaseUrl];

    // Add excluded tables
    for (const table of excludeTables) {
      args.push("--exclude-table", table);
    }

    // Create write stream
    const writeStream = fs.createWriteStream(outputPath);

    // Spawn pg_dump process
    const pgDump = spawn("pg_dump", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    // Pipe stdout to file
    pgDump.stdout.pipe(writeStream);

    // Handle stderr
    let errorOutput = "";
    pgDump.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    // Handle process completion
    pgDump.on("close", (code) => {
      writeStream.end();

      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`pg_dump failed with code ${code}: ${errorOutput}`));
      }
    });

    // Handle process errors
    pgDump.on("error", (error) => {
      writeStream.end();
      reject(new Error(`Failed to start pg_dump: ${error.message}`));
    });
  });
};
