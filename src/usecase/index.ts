/** biome-ignore-all lint/correctness/noUnusedVariables: temporary, will be deleted after implemented */

/*
Responsibility:
- orchestration logic
- enforce business rules
- call domain
- call repos
- idempotency, concurrency control
*/

import { type Result, err as errResult, ok as okResult } from "neverthrow";
import err, {
	type ExternalError,
	type PickDomainErrors,
} from "../domain/error.js";
import type { Event, Order, User } from "../domain/model.js";
import type { AtomicKeyValueStore } from "../infra/key-value-store.js";
import type { ILogger } from "../infra/logger.js";
import type {
	IEventRepository,
	IOrderRepository,
	IUserRepository,
} from "../repo/index.js";

type UseCase<Input, Output> = (input: Input) => Output;

type UseCaseBuilder<Dependencies, Input, Output> = (
	deps: Dependencies,
) => UseCase<Input, Output>;

type Builder<Input, Output> = (deps: Input) => Output;

export type ReserveTicketUseCase = UseCase<
	{
		eventId: Event["id"];
		userId: User["id"];
	},
	Promise<Result<{ reservationId: string }, ReserveTicketErrors>>
>;

type ReserveTicketErrors =
	| PickDomainErrors<
			| "EventNotFound"
			| "UserNotFoundById"
			| "EventClosed"
			| "InsufficientCapacity"
			| "DuplicateRequest"
	  >
	| ExternalError;

export type ConfirmReservationUseCase = UseCase<
	{
		reservationId: string;
	},
	Promise<Result<void, ConfirmReservationErrors>>
>;

type ConfirmReservationErrors =
	| PickDomainErrors<
			| "ReservationNotFound"
			| "ReservationExpired"
			| "ReservationCancelled"
			| "InvalidState"
	  >
	| ExternalError;

export type CancelReservationUseCase = UseCase<
	{
		reservationId: string;
	},
	Promise<Result<void, CancelReservationErrors>>
>;

type CancelReservationErrors =
	| PickDomainErrors<
			"ReservationNotFound" | "ReservationCancelled" | "NotOwnedReservation"
	  >
	| ExternalError;

export type GetEventsUseCase = UseCase<
	void,
	Promise<Result<Event[], GetEventsErrors>>
>;

type GetEventsErrors = ExternalError;

export type GetEventByIdUseCase = UseCase<
	{
		eventId: Event["id"];
	},
	Promise<Result<Event, GetEventByIdErrors>>
>;

type GetEventByIdErrors = PickDomainErrors<"EventNotFound"> | ExternalError;

export type GetReservations = UseCase<
	void,
	Promise<Result<Order[], GetReservationsErrors>>
>;

type GetReservationsErrors = ExternalError;

export type GetReservationById = UseCase<
	{
		reservationId: Order["id"];
	},
	Promise<Result<Order, GetReservationByIdErrors>>
>;

type GetReservationByIdErrors =
	| PickDomainErrors<"ReservationNotFound">
	| ExternalError;

// Use Case Builders

export type BuildReserveTicketDeps = {
	userRepo: IUserRepository;
	orderRepo: IOrderRepository;
	atomicKVStore: AtomicKeyValueStore<{
		status: "pending" | "completed";
		reservationId: string;
	}>;
	logger: ILogger;
	idempotencyKeyGenerator: (
		input: Parameters<ReserveTicketUseCase>[0],
	) => string;
};

export const buildReserveTicketUseCase: Builder<
	BuildReserveTicketDeps,
	ReserveTicketUseCase
> = (deps) => {
	return async (params) => {
		const {
			atomicKVStore: store,
			idempotencyKeyGenerator,
			orderRepo,
			logger,
		} = deps;
		const key = idempotencyKeyGenerator(params);
		const res = await store.trySet(
			key,
			{
				status: "pending",
				reservationId: "",
			},
			{ ttlMs: 20 * 1000 },
		); // 20 sec
		if (!res) return errResult(err.DuplicateRequest({ requestId: key }));

		const orderRes = await orderRepo.createOrder(params.eventId, params.userId);

		if (orderRes.isErr()) {
			store.delete(key); // no need await :p
			return errResult(orderRes.error);
		}

		await store.set(key, {
			status: "completed",
			reservationId: orderRes.value.id,
		});

		return okResult({
			reservationId: orderRes.value.id,
		});
	};
};

type BuildConfirmReservationDeps = {
	orderRepo: IOrderRepository;
	logger: ILogger;
};

export const buildConfirmReservationUseCase: Builder<
	BuildConfirmReservationDeps,
	ConfirmReservationUseCase
> = (deps) => {
	return async (params) => {
		const { orderRepo, logger } = deps;

		const orderRes = await orderRepo.getOrderById(params.reservationId);

		if (orderRes.isErr()) {
			return errResult(orderRes.error);
		}

		const order = orderRes.value;

		// Check if already cancelled
		if (order.meta.cancelledAt) {
			return errResult(
				err.ReservationCancelled({
					reservationId: order.id,
					cancelledAt: order.meta.cancelledAt.toISOString(),
				}),
			);
		}

		// Check if expired
		if (order.meta.expiredAt) {
			return errResult(
				err.ReservationExpired({
					reservationId: order.id,
					expiredAt: order.meta.expiredAt.toISOString(),
				}),
			);
		}

		// Check if already confirmed
		if (order.meta.confirmedAt) {
			return errResult(
				err.InvalidState({
					resource: `Reservation ${order.id}`,
					expected: "PENDING",
					actual: "CONFIRMED",
				}),
			);
		}

		// TODO: Implement confirm logic in repository
		logger.info("Confirming reservation", { reservationId: order.id });

		return okResult(undefined);
	};
};

export type BuildCancelReservationDeps = {
	orderRepo: IOrderRepository;
	logger: ILogger;
};

export const buildCancelReservationUseCase: Builder<
	BuildCancelReservationDeps,
	CancelReservationUseCase
> = (deps) => {
	return async (params) => {
		const { orderRepo, logger } = deps;

		const orderRes = await orderRepo.getOrderById(params.reservationId);

		if (orderRes.isErr()) {
			return errResult(orderRes.error);
		}

		const order = orderRes.value;

		// Check if already cancelled
		if (order.meta.cancelledAt) {
			return errResult(
				err.ReservationCancelled({
					reservationId: order.id,
					cancelledAt: order.meta.cancelledAt.toISOString(),
				}),
			);
		}

		// Cancel the reservation
		const cancelRes = await orderRepo.cancelOrder(
			order.id,
			order.userId, // In real scenario, this would come from authenticated user context
		);

		if (cancelRes.isErr()) {
			return errResult(cancelRes.error);
		}

		logger.info("Reservation cancelled", { reservationId: order.id });

		return okResult(undefined);
	};
};

export type BuildGetEventsUseCaseDeps = {
	eventRepo: IEventRepository;
	logger: ILogger;
};

export const buildGetEventsUseCase: Builder<
	BuildGetEventsUseCaseDeps,
	GetEventsUseCase
> = (deps) => {
	return async () => {
		const { eventRepo } = deps;

		const eventsRes = await eventRepo.getEvents();

		if (eventsRes.isErr()) {
			return errResult(eventsRes.error);
		}

		return okResult(eventsRes.value);
	};
};

export type BuildGetEventByIdUseCaseDeps = {
	eventRepo: IEventRepository;
	logger: ILogger;
};

export const buildGetEventByIdUseCase: Builder<
	BuildGetEventByIdUseCaseDeps,
	GetEventByIdUseCase
> = (deps) => {
	return async (params) => {
		const { eventRepo } = deps;

		const eventRes = await eventRepo.getEventById(params.eventId);

		if (eventRes.isErr()) {
			return errResult(eventRes.error);
		}

		return okResult(eventRes.value);
	};
};

export type BuildGetReservationsDeps = {
	orderRepo: IOrderRepository;
	logger: ILogger;
};

export const buildGetReservations: Builder<
	BuildGetReservationsDeps,
	GetReservations
> = (deps) => {
	return async () => {
		const { orderRepo } = deps;

		const ordersRes = await orderRepo.getOrders();

		if (ordersRes.isErr()) {
			return errResult(ordersRes.error);
		}

		return okResult(ordersRes.value);
	};
};

export type BuildGetReservationByIdDeps = {
	orderRepo: IOrderRepository;
	logger: ILogger;
};

export const buildGetReservationById: Builder<
	BuildGetReservationByIdDeps,
	GetReservationById
> = (deps) => {
	return async (params) => {
		const { orderRepo } = deps;

		const orderRes = await orderRepo.getOrderById(params.reservationId);

		if (orderRes.isErr()) {
			return errResult(orderRes.error);
		}

		return okResult(orderRes.value);
	};
};
