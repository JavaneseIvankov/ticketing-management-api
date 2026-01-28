import { z } from "zod";

// Schemas

export const EventStatusSchema = z.enum(["OPEN", "CLOSED"]);
export type EventStatus = z.infer<typeof EventStatusSchema>;

export const ResourceMetaSchema = z.object({
	createdAt: z.date(),
	updatedAt: z.date(),
	deletedAt: z.date().optional(),
});
export type ResourceMeta = z.infer<typeof ResourceMetaSchema>;

export const EventSchema = z.object({
	id: z.uuidv7(),
	name: z.string().min(1).max(255),
	status: EventStatusSchema,
	capacity: z.number().int().positive(),
	allocated: z.number().int().min(0),
	meta: ResourceMetaSchema,
});
export type Event = z.infer<typeof EventSchema>;

export const UserSchema = z.object({
	id: z.uuidv7(),
	fullname: z.string().min(1).max(255),
	nickname: z.string().min(1).max(100),
	email: z.email(),
	meta: ResourceMetaSchema,
});
export type User = z.infer<typeof UserSchema>;

export const OrderStatusSchema = z.enum(["PENDING", "CONFIRMED", "CANCELLED"]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderSchema = z.object({
	id: z.uuidv7(),
	userId: z.uuidv7(),
	eventId: z.uuidv7(),
	ttl: z.number().int().positive(), // time to live in seconds
	status: OrderStatusSchema,
	meta: ResourceMetaSchema.extend({
		expiredAt: z.date().optional(),
		cancelledAt: z.date().optional(),
		confirmedAt: z.date().optional(),
	}),
});
export type Order = z.infer<typeof OrderSchema>;

// logical expiration check
export const isLogicallyExpired = (order: Order, now: number): boolean => {
	if (order.meta.expiredAt && order.meta.expiredAt.getTime() <= now) {
		return true;
	}
	const createdAt = order.meta.createdAt;
	const ttlMilliseconds = order.ttl * 1000;
	if (createdAt.getTime() + ttlMilliseconds <= now) {
		return true;
	}
	return false;
};
