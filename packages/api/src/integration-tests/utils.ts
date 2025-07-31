import { activitiesData, activityCategoriesData } from "data";
import type { Activity } from "db/incentives";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Effect, Layer } from "effect";
import { GetResourceHoldersService } from "../common/gateway/getResourceHolders.js";
import { GatewayApiClientLive } from "../common/gateway/gatewayApiClient.js";
import type { ResourceHoldersCollectionItem } from "@radixdlt/babylon-gateway-api-sdk";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const runMigration = async (db: any) => {

    // Setup database and run migrations - use dynamic imports


    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const migrationFolderPath = path.join(
        __dirname,
        "../../../db/src/incentives/drizzle"
    );

    await migrate(db, { migrationsFolder: migrationFolderPath });
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const seedData = async (db: any): Promise<boolean> => {

    const {
        activities,
        activityCategories,
        activityWeeks,
        seasons,
        weeks,
    } = await import("db/incentives");
    // Seed required data
    await db
        .insert(activityCategories)
        .values(activityCategoriesData)
        .returning()
        .onConflictDoUpdate({
            target: [activityCategories.id],
            set: {
                name: sql`excluded.name`,
            },
        });

    const activityResults: Activity[] = await db
        .insert(activities)
        .values(activitiesData)
        .returning()
        .onConflictDoUpdate({
            target: [activities.id],
            set: {
                name: sql`excluded.name`,
                category: sql`excluded.category`,
            },
        });

    const SEASON_ID = "b8b73145-4d93-44eb-b2ba-01b079fd8a5c";

    await db
        .insert(seasons)
        .values([
            {
                name: "Season 1",
                status: "active",
                id: SEASON_ID,
            },
        ])
        .returning()
        .onConflictDoNothing();

    const weekResults = await db
        .insert(weeks)
        .values([
            {
                startDate: new Date("2025-07-07 00:00:00+00"),
                endDate: new Date("2025-07-13 23:59:59+00"),
                seasonId: SEASON_ID,
                id: "30da196b-7602-4b06-a558-bbb5b5441186",
            },
        ])
        .returning()
        .onConflictDoNothing();

    // Seed activity weeks
    for (const week of weekResults) {
        await db
            .insert(activityWeeks)
            .values(
                activityResults
                    .map((item) => ({
                        activityId: item.id,
                        weekId: week.id,
                        pointsPool: 100_000,
                        status: "active" as const,
                    }))
                    .filter(
                        (item) =>
                            item.activityId !== "common" && !item.activityId.includes("hold_")
                    )
            )
            .returning()
            .onConflictDoNothing();
    }
    return true;

}

/**
 * Truncates all tables in the database, respecting foreign key constraints
 * @param db - Database client
 * @param dbUrl - Database URL
 */
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const truncateAllTables = async (db: any,dbUrl: string) => {
    // Safety check: only allow truncation on localhost
    const databaseUrl = dbUrl;
    const isLocalhost = databaseUrl.includes('@localhost:') ||
        !databaseUrl; // Allow if no URL (likely using testDbUrl from inject)

    if (!isLocalhost) {
        throw new Error(`Refusing to truncate tables: Database is not on localhost. URL: ${databaseUrl.replace(/\/\/.*@/, '//***@')}`);
    }

    const {
        accounts,
        users,
        activityWeeks,
        weeks,
        seasons,
        activities,
        activityCategories,
        accountBalances,
    } = await import("db/incentives");

    console.log("Truncating all tables...");

    // Truncate in order to respect foreign key constraints
    // Dependent tables first, then parent tables
    await db.delete(accountBalances);
    await db.delete(accounts);
    await db.delete(users);
    await db.delete(activityWeeks);
    await db.delete(weeks);
    await db.delete(seasons);
    await db.delete(activities);
    await db.delete(activityCategories);

    console.log("All tables truncated successfully");
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const createTestUserAndAccounts = async (db: any, accountAddresses: string[]) => {

    const {
        accounts,
        users,
    } = await import("db/incentives");
    // Create test user and accounts for the snapshot worker
    const TEST_USER_ID = "12345678-1234-1234-1234-123456789abc";
    const TEST_IDENTITY_ADDRESS = "identity_rdx1test12345678901234567890123456789012345678901234567890";


    await db
        .insert(users)
        .values([
            {
                id: TEST_USER_ID,
                identityAddress: TEST_IDENTITY_ADDRESS,
                label: "Test User",
            },
        ])
        .onConflictDoNothing();

    await db
        .insert(accounts)
        .values(
            accountAddresses.map((address) => ({
                userId: TEST_USER_ID,
                address: address,
                label: `Test Account ${address.slice(-8)}`,
            }))
        )
        .onConflictDoNothing();

    console.log("Test user and accounts created");
}

/**
 * Gets account holders for a specific resource address
 * @param resourceAddress - The resource address to get holders for (e.g., resource_rdx1t4upr78guuapv5ept7d7ptekk9mqhy605zgms33mcszen8l9fac8vf)
 * @returns Promise<string[]> - Array of account addresses that hold the resource
 */
export const getAccountHoldersForResource = async (resourceAddress: string): Promise<string[]> => {
    try {
        console.log(`Getting holders for resource: ${resourceAddress}`);

        // Set up the GetResourceHoldersService
        const getResourceHoldersEffect = Effect.provide(
            GetResourceHoldersService,
            GetResourceHoldersService.Default.pipe(
                Layer.provide(GatewayApiClientLive)
            )
        );

        // Get resource holders
        const resourceHoldersEffect = Effect.gen(function* () {
            const getResourceHolders = yield* getResourceHoldersEffect;

            const result = yield* getResourceHolders({
                resourceAddress: resourceAddress,
            });

            return result;
        });

        const holders = await Effect.runPromise(resourceHoldersEffect);

        // Filter to only include account addresses (exclude component addresses)
        const accountHolders = holders
            .filter((holder: ResourceHoldersCollectionItem) => holder.holder_address.startsWith("account_rdx"))
            .map((holder: ResourceHoldersCollectionItem) => holder.holder_address);

        console.log(`Found ${accountHolders.length} account holders out of ${holders.length} total holders`);

        return accountHolders;

    } catch (error) {
        console.error("Error getting account holders for resource:", error);
        throw error;
        // return [];  
    }
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const getTotalUsdValueForActivity = async (client: any, weftActivityId: string) => {
    // Check if account_balances table exists and what's in it
    const accountBalanceCount = await client`
            SELECT COUNT(*) as count FROM account_balances
            `;
    console.log("Total records in account_balances:", accountBalanceCount[0]?.count);

    type ActivityIdRow = { activity_id: string };

    // Get list of all activity IDs in the database
    const activityIds: ActivityIdRow[] = await client`
            SELECT DISTINCT activity_item->>'activityId' AS activity_id
            FROM account_balances ab
            CROSS JOIN jsonb_array_elements(ab.data) AS activity_item
            WHERE ab.data IS NOT NULL AND jsonb_typeof(ab.data) = 'array'
            ORDER BY activity_id
            `;
    console.log("Available activity IDs:", activityIds.map((row: ActivityIdRow) => row.activity_id));

    const accountBalanceRowCount = await client`
            SELECT COUNT(*) as count FROM account_balances
            `;
    console.log("Total records in account_balances:", accountBalanceRowCount[0]?.count);

    type QueryResultRow = {
        timestamp: string;
        account_address: string;
        activity_id: string;
        usd_value: string;
    };
    // Now try our original query
    const queryResult: QueryResultRow[] = await client`
            SELECT 
                ab.timestamp,
                ab.account_address,
                activity_item->>'activityId' AS activity_id,
                (activity_item->>'usdValue')::decimal AS usd_value
            FROM account_balances ab
            CROSS JOIN jsonb_array_elements(ab.data) AS activity_item
            ORDER BY ab.account_address, activity_id
            `;

    //filter for the weft activity id
    const weftQueryResult: QueryResultRow[] = queryResult.filter(row => row.activity_id === weftActivityId);
    console.log(`Found ${weftQueryResult.length} account balance records for ${weftActivityId}`);

    //sum up the usd_value for each account_address
    const totalUsdValue = weftQueryResult.reduce((acc: number, row: QueryResultRow) => acc + Number(row.usd_value), 0);
    console.log(`Total USD value for ${weftActivityId}: ${totalUsdValue}`);
    return totalUsdValue;
}
