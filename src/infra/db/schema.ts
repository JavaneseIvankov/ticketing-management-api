import { sql } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";

const uuidv7 = sql`uuid_generate_v7()`;

const timestamps = {
	createdAt: p.timestamp().defaultNow().notNull(),
	updatedAt: p.timestamp().defaultNow(),
	deletedAt: p
		.timestamp()
		.defaultNow()
		.$onUpdateFn(() => new Date()),
};

export const users = p.pgTable("users", {
	id: p.uuid("id").primaryKey().default(uuidv7),
	name: p.varchar({ length: 255 }).notNull(),
	age: p.integer().notNull(),
	email: p.varchar({ length: 255 }).notNull().unique(),
	...timestamps,
});

export const events = p.pgTable("events", {
	id: p.uuid("id").primaryKey().default(uuidv7),
	capacity: p.integer().notNull(),
	allocated: p.integer().notNull().default(0),
	closedAt: p.timestamp(),
	...timestamps,
});

export const orders = p.pgTable("orders", {
	id: p.uuid("id").primaryKey().default(uuidv7),
	userId: p.uuid("id").references(() => users.id),
	eventId: p.uuid("id").references(() => events.id),
	cancelledAt: p.timestamp(),
	expiredAt: p.timestamp(),
	confirmedAt: p.timestamp(),
	...timestamps,
});
