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
const generateAccounts = (): AccountData[] => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const csvPath = path.join(__dirname, 'all_accounts.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  const accountAddresses = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line) => !line.toLowerCase().startsWith('#,address,'))
    .map((line) => {
      const [/* idx */, address] = line.split(',');
      return (address ?? '').replace(/^"|"$/g, '').trim();
    })
    .filter((address) => address.length > 0);

  const accounts: AccountData[] = accountAddresses.map((address) => {
    const userId = randomUUID();
    const createdAt = new Date('2025-01-15T10:00:00.000Z').toISOString();

    return {
      user_id: userId,
      address: address,
      label: 'All-accounts',
      created_at: createdAt,
    };
  });

  return accounts;
};

export const accounts = generateAccounts();


if (import.meta.url === `file://${process.argv[1]}`) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outputPath = path.join(__dirname, 'accounts.json');
  fs.writeFileSync(outputPath, JSON.stringify(accounts, null, 2), 'utf-8');
  console.log(`Saved ${accounts.length} accounts to: ${outputPath}`);
}
