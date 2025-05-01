// packages/db/src/seed.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema"; // Adjust the path to your schema file

const connectionString = process.env.DATABASE_URL; // Ensure DATABASE_URL is set in your environment

if (!connectionString) {
  console.error("🔴 Error: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

// Initialize the connection
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql, { schema });

const seedData = async () => {
  console.log("🌱 Seeding database...");

  try {
    // Example: Seeding the 'users' table
    const usersData = [
      {
        id: "user_seed_1", // Use appropriate IDs or let DB generate them if configured
        label: "Seed User One",
        // Add other required fields based on your schema.User definition
        // e.g., email: 'seed1@example.com', createdAt: new Date(), ...
      },
      {
        id: "user_seed_2",
        label: "Seed User Two",
        // Add other required fields
      },
    ];

    console.log(`Inserting ${usersData.length} users...`);
    // Use db.insert() to add data. Adjust 'users' to your actual table name from the schema.
    await db.insert(schema.users).values(usersData).onConflictDoNothing(); // Or use .onConflictDoUpdate() if needed
    console.log("✅ Users seeded successfully.");

    // Add more seeding logic for other tables here...
    // Example: Seeding 'seasons'
    // const seasonsData = [ ... ];
    // await db.insert(schema.seasons).values(seasonsData).onConflictDoNothing();
    // console.log('✅ Seasons seeded successfully.');

    console.log("🌳 Database seeded successfully!");
  } catch (error) {
    console.error("🔴 Error seeding database:", error);
    process.exit(1);
  } finally {
    // Ensure the connection is closed
    await sql.end();
    console.log("🔌 Database connection closed.");
  }
};

// Run the seeding function
void seedData();
