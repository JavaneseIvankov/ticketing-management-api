/*
Responsibility:
- parse request, input validation, context extraction
- call domain layer
- format response, error handling
*/

import { createRoute, z } from "@hono/zod-openapi";
import { OrderSchema, UserSchema } from "../domain/model.js";
import app from "../http/app.js";

// Reserve Ticket Handler
const ParamsSchema = z.object({
	id: OrderSchema.shape.id,
});

const BodySchema = z.object({
	userId: UserSchema.shape.id,
});

const route = createRoute({
	method: "post",
	path: "/events/{id}/reserve",
	request: {
		params: ParamsSchema,
		body: {
			content: {
				"application/json": {
					schema: BodySchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "Ticket reservation successful",
			content: {
				"application/json": {
					schema: z.object({
						reservationId: OrderSchema.shape.id,
					}),
				},
			},
		},
		400: {
			description: "Ticket reservation failed",
			content: {
				"application/json": {
					schema: z.object({
						error: z.string().optional(),
					}),
				},
			},
		},
	},
});

// FIXME: finalize this later, this is only demo
app.openapi(route, async (c) => {
	const param = c.req.valid("param");
	const body = c.req.valid("json");

	const reservationId = `reservation-${param.id}-${body.userId}-${Date.now()}`;

	return c.json({ reservationId }, 200);
});
