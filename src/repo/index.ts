/*
Responsibility:
- Repository contracts (abstractions).
*/

import type { Result } from "neverthrow";
import type { ExternalError, PickDomainErrors } from "../domain/error.js";
import type { Event, Order, User } from "../domain/model.js";

export interface IEventRepository {
		getEventById(
			eventId: Event["id"],
		): Promise<Result<Event, GetEventByIdErrors>>;
		getEvents(): Promise<Result<Event[], GetEventsErrors>>;
	}

type GetEventByIdErrors = PickDomainErrors<"EventNotFound"> | ExternalError;
type GetEventsErrors = ExternalError;

export interface IOrderRepository {
		getOrders(): Promise<Result<Order[], GetOrdersError>>;

		getOrdersOfUser(
			userId: User["id"],
		): Promise<Result<Order[], GetOrdersOfUserError>>;
		getOrderById(
			orderId: Order["id"],
		): Promise<Result<Order, GetOrderByIdErorr>>;

		createOrder(
			eventId: Event["id"],
			userId: User["id"],
		): Promise<Result<Order, CreateOrderError>>;

		expireOrder(
			orderId: Order["id"],
			userId: User["id"],
		): Promise<Result<void, ExpireOrderError>>;

		cancelOrder(
			orderId: Order["id"],
			userId: User["id"],
		): Promise<Result<void, CancelOrderError>>;

		confirmOrder(
			orderId: Order["id"],
			userId: User["id"],
		): Promise<Result<void, ConfirmOrderError>>;
	}

type GetOrdersError = ExternalError;
type GetOrdersOfUserError = ExternalError;
type GetOrderByIdErorr =
	| PickDomainErrors<"ReservationNotFound">
	| ExternalError;
type CreateOrderError =
	| PickDomainErrors<"EventClosed" | "InsufficientCapacity">
	| ExternalError;
type ExpireOrderError =
	| PickDomainErrors<
			| "ReservationExpired"
			| "ReservationCancelled"
			| "ReservationNotFound"
			| "NotOwnedReservation"
	  >
	| ExternalError;
type CancelOrderError =
	| PickDomainErrors<
			"ReservationCancelled" | "ReservationNotFound" | "NotOwnedReservation"
	  >
	| ExternalError;
type ConfirmOrderError =
	| PickDomainErrors<
			"ReservationNotFound" | "ReservationExpired" | "ReservationCancelled"
	  >
	| ExternalError;

export interface IUserRepository {
		createUser(
			payload: Omit<User, "id" | "meta">,
		): Promise<Result<User, CreateUserError>>;
		getUserByEmail(
			email: User["email"],
		): Promise<Result<User, GetUserByEmailError>>;
		getUserById(userId: User["id"]): Promise<Result<User, GetUserByIdError>>;
		getUsers(): Promise<Result<User[], GetUsersError>>;
	}

type CreateUserError = PickDomainErrors<"UserAlreadyExists"> | ExternalError;
type GetUserByEmailError =
	| PickDomainErrors<"UserNotFoundByEmail">
	| ExternalError;
type GetUserByIdError = PickDomainErrors<"UserNotFoundById"> | ExternalError;
type GetUsersError = ExternalError;

