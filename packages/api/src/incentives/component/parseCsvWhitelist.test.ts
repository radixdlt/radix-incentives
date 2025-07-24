import { describe, it, expect } from "vitest";
import { Effect, Exit, Cause } from "effect";
import { parseCsvWhitelist, CsvParsingError } from "./parseCsvWhitelist";

describe("parseCsvWhitelist", () => {
  it("should successfully parse valid CSV with component addresses", async () => {
    const csvData = `#,matched_component,count
1,component_rdx1czaulwngn258tkk5xpvhgsyrfx5e4f7eu4pafhxe0hpkvafndtmwnk,1946834
2,component_rdx1cra2j3w7cv9zkrv4jehjz0qn3xffxdkstucxar4xy9kyu0tpxsvya6,644833
3,component_rdx1cr3psyfptwkktqusfg8ngtupr4wwfg32kz2xvh9tqh4c7pwkvlk2kn,520451`;

    const result = await Effect.runPromiseExit(parseCsvWhitelist({ csvData }));

    expect(Exit.isSuccess(result)).toBe(true);
    if (Exit.isSuccess(result)) {
      expect(result.value.componentAddresses).toEqual([
        "component_rdx1czaulwngn258tkk5xpvhgsyrfx5e4f7eu4pafhxe0hpkvafndtmwnk",
        "component_rdx1cra2j3w7cv9zkrv4jehjz0qn3xffxdkstucxar4xy9kyu0tpxsvya6",
        "component_rdx1cr3psyfptwkktqusfg8ngtupr4wwfg32kz2xvh9tqh4c7pwkvlk2kn",
      ]);
      expect(result.value.count).toBe(3);
    }
  });

  it("should handle empty CSV and return empty array", async () => {
    const csvData = "";

    const result = await Effect.runPromiseExit(parseCsvWhitelist({ csvData }));

    expect(Exit.isSuccess(result)).toBe(true);
    if (Exit.isSuccess(result)) {
      expect(result.value.componentAddresses).toEqual([]);
      expect(result.value.count).toBe(0);
    }
  });

  it("should handle CSV with only header", async () => {
    const csvData = "#,matched_component,count";

    const result = await Effect.runPromiseExit(parseCsvWhitelist({ csvData }));

    expect(Exit.isSuccess(result)).toBe(true);
    if (Exit.isSuccess(result)) {
      expect(result.value.componentAddresses).toEqual([]);
      expect(result.value.count).toBe(0);
    }
  });

  it("should filter out non-component addresses", async () => {
    const csvData = `#,matched_component,count
1,component_rdx1czaulwngn258tkk5xpvhgsyrfx5e4f7eu4pafhxe0hpkvafndtmwnk,1000
2,resource_rdx1tkk83magp3gjyxrpskfsqwkg4g949rmcjee4tu2xmw93ltw2cz94sq,500
3,package_rdx1pkgxenjmhnawgk9pw7rqlqxv2qwmhc5x0u5pddgf5xllpg6gzurzwh,300`;

    const result = await Effect.runPromiseExit(parseCsvWhitelist({ csvData }));

    expect(Exit.isSuccess(result)).toBe(true);
    if (Exit.isSuccess(result)) {
      expect(result.value.componentAddresses).toEqual([
        "component_rdx1czaulwngn258tkk5xpvhgsyrfx5e4f7eu4pafhxe0hpkvafndtmwnk",
      ]);
      expect(result.value.count).toBe(1);
    }
  });

  it("should handle CSV with quoted matched_component header", async () => {
    const csvData = `#,"matched_component",count
1,component_rdx1czaulwngn258tkk5xpvhgsyrfx5e4f7eu4pafhxe0hpkvafndtmwnk,1000`;

    const result = await Effect.runPromiseExit(parseCsvWhitelist({ csvData }));

    expect(Exit.isSuccess(result)).toBe(true);
    if (Exit.isSuccess(result)) {
      expect(result.value.componentAddresses).toEqual([
        "component_rdx1czaulwngn258tkk5xpvhgsyrfx5e4f7eu4pafhxe0hpkvafndtmwnk",
      ]);
      expect(result.value.count).toBe(1);
    }
  });

  it("should skip empty lines", async () => {
    const csvData = `#,matched_component,count
1,component_rdx1czaulwngn258tkk5xpvhgsyrfx5e4f7eu4pafhxe0hpkvafndtmwnk,1000

2,component_rdx1cra2j3w7cv9zkrv4jehjz0qn3xffxdkstucxar4xy9kyu0tpxsvya6,2000`;

    const result = await Effect.runPromiseExit(parseCsvWhitelist({ csvData }));

    expect(Exit.isSuccess(result)).toBe(true);
    if (Exit.isSuccess(result)) {
      expect(result.value.componentAddresses).toEqual([
        "component_rdx1czaulwngn258tkk5xpvhgsyrfx5e4f7eu4pafhxe0hpkvafndtmwnk",
        "component_rdx1cra2j3w7cv9zkrv4jehjz0qn3xffxdkstucxar4xy9kyu0tpxsvya6",
      ]);
      expect(result.value.count).toBe(2);
    }
  });

  it("should fail with CsvParsingError when matched_component column is missing", async () => {
    const csvData = `#,wrong_column,count
1,component_rdx1czaulwngn258tkk5xpvhgsyrfx5e4f7eu4pafhxe0hpkvafndtmwnk,1000`;

    const result = await Effect.runPromiseExit(parseCsvWhitelist({ csvData }));

    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const failure = Cause.failureOption(result.cause);
      expect(failure._tag).toBe("Some");
      if (failure._tag === "Some") {
        expect(failure.value).toBeInstanceOf(CsvParsingError);
        expect(failure.value.message).toBe(
          "Invalid CSV format. Expected 'matched_component' column"
        );
      }
    }
  });

  it("should handle CSV with only matched_component header", async () => {
    const csvData = `matched_component
component_rdx1czaulwngn258tkk5xpvhgsyrfx5e4f7eu4pafhxe0hpkvafndtmwnk
component_rdx1cra2j3w7cv9zkrv4jehjz0qn3xffxdkstucxar4xy9kyu0tpxsvya6`;

    const result = await Effect.runPromiseExit(parseCsvWhitelist({ csvData }));

    expect(Exit.isSuccess(result)).toBe(true);
    if (Exit.isSuccess(result)) {
      expect(result.value.componentAddresses).toEqual([
        "component_rdx1czaulwngn258tkk5xpvhgsyrfx5e4f7eu4pafhxe0hpkvafndtmwnk",
        "component_rdx1cra2j3w7cv9zkrv4jehjz0qn3xffxdkstucxar4xy9kyu0tpxsvya6",
      ]);
      expect(result.value.count).toBe(2);
    }
  });
});
