/*
Responsibility:
- Repository contracts (abstractions).
*/

import type { ResultAsync } from "neverthrow";
import type { ExternalError, PickDomainErrors } from "../domain/error.js";
import type { Event, Order, User } from "../domain/model.js";

export interface IEventRepository {
	getEventById(eventId: Event["id"]): ResultAsync<Event, GetEventByIdErrors>;
	getEvents(): ResultAsync<Event[], GetEventsErrors>;
}

type GetEventByIdErrors = PickDomainErrors<"EventNotFound"> | ExternalError;
type GetEventsErrors = ExternalError;

export interface IOrderRepository {
		getOrders(): ResultAsync<Order[], GetOrdersError>;

		getOrdersOfUser(
			userId: User["id"],
		): ResultAsync<Order[], GetOrdersOfUserError>;
		getOrderById(orderId: Order["id"]): ResultAsync<Order, GetOrderByIdErorr>;

		createOrder(
			eventId: Event["id"],
			userId: User["id"],
		): ResultAsync<Order, CreateOrderError>;

		expireOrder(
			orderId: Order["id"],
			userId: User["id"],
		): ResultAsync<void, ExpireOrderError>;

		cancelOrder(
			orderId: Order["id"],
			userId: User["id"],
		): ResultAsync<void, CancelOrderError>;
	}

type GetOrdersError = ExternalError;
type GetOrdersOfUserError = ExternalError;
type GetOrderByIdErorr =
	| PickDomainErrors<"ReservationNotFound">
	| ExternalError;
type CreateOrderError =
	| PickDomainErrors<"EventClosed" | "InsufficientCapacity">
	| ExternalError;
type ExpireOrderError = PickDomainErrors<
	| "ReservationExpired"
	| "ReservationCancelled"
	| "ReservationNotFound"
	| "NotOwnedReservation"
>;
type CancelOrderError = PickDomainErrors<
	"ReservationCancelled" | "ReservationNotFound" | "NotOwnedReservation"
>;

export interface IUserRepository {
	createUser(
		payload: Omit<User, "id" | "meta">,
	): ResultAsync<User, CreateUserError>;
	getUserByEmail(email: User["email"]): ResultAsync<User, GetUserByEmailError>;
	getUserById(userId: User["id"]): ResultAsync<User, GetUserByIdError>;
	getUsers(): ResultAsync<User[], GetUsersError>;
}

type CreateUserError = PickDomainErrors<"UserAlreadyExists"> | ExternalError;
type GetUserByEmailError =
	| PickDomainErrors<"UserNotFoundByEmail">
	| ExternalError;
type GetUserByIdError = PickDomainErrors<"UserNotFoundById"> | ExternalError;
type GetUsersError = ExternalError;

