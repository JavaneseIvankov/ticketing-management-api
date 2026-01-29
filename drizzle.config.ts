import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./drizzle",
	schema: "./src/infra/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		// FIXME: env.ts is not available before app start, so we have to use process.env directly here
		url: process.env.DATABASE_URL!,
	},
});
