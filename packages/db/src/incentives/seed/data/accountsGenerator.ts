import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export type AccountData = {
  user_id: string;
  address: string;
  label: string;
  created_at: string;
};

/**
 * Reads the c9holders.csv file and generates account data
 */
const generateAccountsC9xUsdcHolders = (): AccountData[] => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const csvPath = path.join(__dirname, "weftv2xUsdcHolders.csv");
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  // Split by lines and filter out empty lines
  const accountAddresses = csvContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const accounts: AccountData[] = accountAddresses.map(address => {
    const userId = randomUUID();
    const createdAt = new Date('2025-01-15T10:00:00.000Z').toISOString();

    return {
      user_id: userId,
      address: address,
      label: "Weft v2 xUSDC Holder",
      created_at: createdAt,
    };
  });

  return accounts;
};

export const accountsC9xUsdcHolders = generateAccountsC9xUsdcHolders();

// For debugging
if (import.meta.url === `file://${process.argv[1]}`) {
 
  console.log(accountsC9xUsdcHolders);
} 