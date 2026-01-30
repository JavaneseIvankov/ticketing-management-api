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
import type { IOrderRepository, IUserRepository } from "../repo/index.js";

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

const buildReserveTicketUseCase: Builder<
	{
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
	},
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
			await store.delete(key);
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
	| PickDomainErrors<"ReservationNotFound" | "ReservationCancelled">
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
