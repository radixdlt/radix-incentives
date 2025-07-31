// Set a placeholder DATABASE_URL before any imports to prevent drizzle config errors
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder";

import { describe, it, expect } from "vitest";
import { getAccountHoldersForResource } from "./utils.js";

describe("Resource Holders Integration Test", { retry: 0 }, () => {
  it("should get account holders for NFT resource and include expected account", async () => {
    const resourceAddress = "resource_rdx1nft63kjp38agw0z8nnwkyjhcgpzwjer84945h5z8yr663fgukjyp3l";
    const expectedAccount = "account_rdx168rkx0shgda9r6ku3zrsvevm477le2qlpnmrlurqma0k9lxh9662wh";

    console.log(`Testing resource address: ${resourceAddress}`);
    console.log(`Looking for expected account: ${expectedAccount}`);

    const accountHolders = await getAccountHoldersForResource(resourceAddress);

    console.log(`Found ${accountHolders.length} account holders:`, accountHolders);

    // Check that we got some results
    expect(accountHolders).toBeDefined();
    expect(Array.isArray(accountHolders)).toBe(true);
    expect(accountHolders.length).toBeGreaterThan(0);

    // Check that the expected account is in the results
    expect(accountHolders).toContain(expectedAccount);

    // Verify all returned addresses are account addresses
    for (const address of accountHolders) {
      expect(address).toMatch(/^account_rdx[a-z0-9]+$/);
    }

    console.log(`✅ Successfully found expected account ${expectedAccount} among ${accountHolders.length} holders`);
  },  300000 );


});
