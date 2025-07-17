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

    // Use custom format for better restore options
    args.push("-Fc");

    // Add excluded table data (keeps schema but excludes data)
    for (const table of excludeTables) {
      args.push("--exclude-table-data", table);
    }

    // Add output file
    args.push("-f", outputPath);

    // Spawn pg_dump process
    const pgDump = spawn("pg_dump", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    // Handle stderr
    let errorOutput = "";
    pgDump.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    // Handle process completion
    pgDump.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`pg_dump failed with code ${code}: ${errorOutput}`));
      }
    });

    // Handle process errors
    pgDump.on("error", (error) => {
      reject(new Error(`Failed to start pg_dump: ${error.message}`));
    });
  });
};
