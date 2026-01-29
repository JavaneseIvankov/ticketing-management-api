/*
Responsibility:
- Repository contracts (abstractions).
*/

import type { ResultAsync } from "neverthrow";
import type {
	EventClosed,
	EventNotFound,
	InsufficientCapacity,
	NotOwnedReservation,
	ReservationCancelled,
	ReservationExpired,
	ReservationNotFound,
	UserAlreadyExists,
	UserNotFound,
} from "../domain/error.js";
import type { Event, Order, User } from "../domain/model.js";

export interface IEventRepository {
	getEventById(eventId: Event["id"]): ResultAsync<Event, EventNotFound>;
	getEvents(): ResultAsync<Event[], never>;
}

export interface IOrderRepository {
	getOrders(): ResultAsync<Order[], never>;
	getOrdersOfUser(userId: User["id"]): ResultAsync<Order[], never>;
	getOrderById(orderId: Order["id"]): ResultAsync<Order, ReservationNotFound>;
	createOrder(
		eventId: Event["id"],
		userId: User["id"],
	): ResultAsync<Order, EventClosed | InsufficientCapacity>;
	expireOrder(
		orderId: Order["id"],
		userId: User["id"],
	): ResultAsync<
		void,
		| ReservationExpired
		| ReservationCancelled
		| ReservationNotFound
		| NotOwnedReservation
	>;
	cancelOrder(
		orderId: Order["id"],
		userId: User["id"],
	): ResultAsync<
		void,
		ReservationCancelled | ReservationNotFound | NotOwnedReservation
	>;
}

export interface IUserRepository {
	createUser(
		payload: Omit<User, "id" | "meta">,
	): ResultAsync<User, UserAlreadyExists>;
	getUserByEmail(
		email: User["email"],
	): ResultAsync<User, UserNotFound<{ email: User["email"] }>>;
	getUserById(
		userId: User["id"],
	): ResultAsync<User, UserNotFound<{ userId: User["id"] }>>;
	getUsers(): ResultAsync<User[], never>;
}
