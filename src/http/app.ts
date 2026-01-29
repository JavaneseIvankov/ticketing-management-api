/*
Responsibility:
- initialize hono app, middleware, infra-wiring 
*/

import { OpenAPIHono } from "@hono/zod-openapi";
import { sql } from "drizzle-orm";
import db from "../infra/db/db.js";

const app = new OpenAPIHono();

app.get("/health", async (c) => {
	const startTime = Date.now();
	try {
		await db.execute(sql`SELECT 1`);
	} catch {
		return c.json(
			{
				status: "unhealthy",
				timestamp: new Date().toISOString(),
				checks: {
					database: "unhealthy",
				},
			},
			503,
		);
	}
	return c.json({
		status: "healthy",
		timestamp: new Date().toISOString(),
		version: "0.1.0",
		checks: {
			database: "healthy",
		},
		responseTimeMs: Date.now() - startTime,
	});
});

app.doc("/doc", {
	openapi: "3.0.0",
	info: {
		title: "Ticketing Management API",
		version: "0.1.0",
	},
});

export default app;
