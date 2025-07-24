import { Effect } from "effect";

export class CsvParsingError {
  readonly _tag = "CsvParsingError";
  constructor(readonly message: string) {}
}

export type ParseCsvWhitelistInput = {
  csvData: string;
};

export type ParseCsvWhitelistOutput = {
  componentAddresses: string[];
  count: number;
};

export const parseCsvWhitelist = (
  input: ParseCsvWhitelistInput
): Effect.Effect<ParseCsvWhitelistOutput, CsvParsingError> =>
  Effect.gen(function* () {
    const lines = input.csvData.trim().split("\n");
    const componentAddresses: string[] = [];

    // Handle empty CSV (clears whitelist)
    if (lines.length === 0 || (lines.length === 1 && !lines[0]?.trim())) {
      return {
        componentAddresses: [],
        count: 0,
      };
    }

    const header = lines[0];

    if (!header?.includes("matched_component")) {
      return yield* Effect.fail(
        new CsvParsingError(
          "Invalid CSV format. Expected 'matched_component' column"
        )
      );
    }

    // Find the column index for matched_component
    const headers = header.split(",").map((h) => h.trim());
    const componentIndex = headers.findIndex(
      (h) => h === "matched_component" || h === '"matched_component"'
    );

    if (componentIndex === -1) {
      return yield* Effect.fail(
        new CsvParsingError("Component address column not found")
      );
    }

    // Parse component addresses from CSV
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      const columns = line
        .split(",")
        .map((col) => col.trim().replace(/"/g, ""));
      const componentAddress = columns[componentIndex];

      if (componentAddress?.startsWith("component_")) {
        componentAddresses.push(componentAddress);
      }
    }

    return {
      componentAddresses,
      count: componentAddresses.length,
    };
  });
