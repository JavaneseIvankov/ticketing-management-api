/*
Responsibility:
- initialize hono app, middleware, infra-wiring 
*/

import { OpenAPIHono } from "@hono/zod-openapi";

const app = new OpenAPIHono();

app.doc("/doc", {
	openapi: "3.0.0",
	info: {
		title: "Ticketing Management API",
		version: "0.1.0",
	},
});

export default app;
