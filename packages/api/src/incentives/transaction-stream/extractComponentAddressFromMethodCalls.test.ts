import { describe, it } from "vitest";
import { manifest } from "./fixtures/manifest";
import { extractComponentAddressFromMethodCalls } from "./extractComponentAddressFromMethodCalls";

describe("extractComponentAddressFromMethodCalls", () => {
  it("should extract component address from method calls", () => {
    const componentsCalls = extractComponentAddressFromMethodCalls(manifest);
    expect(componentsCalls).toEqual([
      "component_rdx1cqsr24wactz2jru76kjq5j2mmfarnurwekl77zw23k800unm0l907u",
      "component_rdx1cqddgx9vvkhc6dlp7gng5quh7guueqw326v5f0xr8kgjp7jzr9fy8n",
    ]);
  });
});
