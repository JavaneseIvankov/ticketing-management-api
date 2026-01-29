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
import type { DomainError } from "../domain/error.js";
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
	// FIXME: refine error types
	ResultAsync<{ reservationId: string }, DomainError>
>;

export type ConfirmReservationUseCase = UseCase<
	{
		reservationId: string;
	},
	// FIXME: refine error types
	ResultAsync<void, DomainError>
>;

export type CancelReservationUseCase = UseCase<
	{
		reservationId: string;
	},
	ResultAsync<void, DomainError>
>;

export type GetEventsUseCase = UseCase<void, ResultAsync<Event[], DomainError>>;

export type GetEventByIdUseCase = UseCase<
	{
		eventId: Event["id"];
	},
	// FIXME: refine error types
	ResultAsync<Event, DomainError>
>;

export type GetReservations = UseCase<void, ResultAsync<Order[], DomainError>>;

export type GetReservationById = UseCase<
	{
		reservationId: Order["id"];
	},
	// FIXME: refine error types
	ResultAsync<Order, DomainError>
>;
