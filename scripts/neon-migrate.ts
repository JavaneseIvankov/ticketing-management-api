import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import env from "@/src/infra/env.js";

// This function will run migration for neon
// I need this because somehow i can't use drizzle-kit cli to connect to neon when it's connected to home wifi
async function runMigrations() {
	console.log("Running migrations...");

	const databaseUrl = env.DATABASE_URL;
	if (!databaseUrl) {
		console.error("DATABASE_URL is not set");
		process.exit(1);
	}

	const sql = neon(databaseUrl);
	const db = drizzle(sql);

	try {
		// we can safely ignore this error
		await migrate(db, { migrationsFolder: "./drizzle" });

		console.log("Migrations completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("Migration failed:", error);
		process.exit(1);
	}
}

runMigrations();
