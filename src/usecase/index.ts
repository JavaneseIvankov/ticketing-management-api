/** biome-ignore-all lint/correctness/noUnusedVariables: temporary, will be deleted after implemented */

/*
Responsibility:
- orchestration logic
- enforce business rules
- call domain
- call repos
- idempotency, concurrency control
*/

import type { ResultAsync } from "neverthrow";
import type { ExternalError, PickDomainErrors } from "../domain/error.js";
import type { Event, Order, User } from "../domain/model.js";

type UseCase<Input, Output> = (input: Input) => Output;

type UseCaseBuilder<Dependencies, Input, Output> = (
	deps: Dependencies,
) => UseCase<Input, Output>;

export type ReserveTicketUseCase = UseCase<
		{
			eventId: Event["id"];
			userId: User["id"];
		},
		ResultAsync<{ reservationId: string }, ReserveTicketErrors>
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
		ResultAsync<void, ConfirmReservationErrors>
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
		ResultAsync<void, CancelReservationErrors>
	>;

type CancelReservationErrors =
	| PickDomainErrors<"ReservationNotFound" | "ReservationCancelled">
	| ExternalError;

export type GetEventsUseCase = UseCase<
	void,
	ResultAsync<Event[], GetEventsErrors>
>;

type GetEventsErrors = ExternalError;

export type GetEventByIdUseCase = UseCase<
		{
			eventId: Event["id"];
		},
		ResultAsync<Event, GetEventByIdErrors>
	>;

type GetEventByIdErrors = PickDomainErrors<"EventNotFound"> | ExternalError;

export type GetReservations = UseCase<
	void,
	ResultAsync<Order[], GetReservationsErrors>
>;

type GetReservationsErrors = ExternalError;

export type GetReservationById = UseCase<
		{
			reservationId: Order["id"];
		},
		ResultAsync<Order, GetReservationByIdErrors>
	>;

type GetReservationByIdErrors =
	| PickDomainErrors<"ReservationNotFound">
	| ExternalError;
