/** biome-ignore-all lint/correctness/noUnusedVariables: temporary, will be deleted after implemented */

/*
Responsibility:
- orchestration logic
- enforce business rules
- call domain
- call repos
- idempotency, concurrency control
*/

import type { Result } from "neverthrow";
import type { DomainError } from "../domain/error.js";
import type { Event, Order, User } from "../domain/model.js";

type UseCase<Input, Output> = (input: Input) => Promise<Output>;

type UseCaseBuilder<Dependencies, Input, Output> = (
	deps: Dependencies,
) => UseCase<Input, Output>;

type ReserveTicketUseCase = UseCase<
	{
		eventId: Event["id"];
		userId: User["id"];
	},
	// FIXME: refine error types
	Result<{ reservationId: string }, DomainError>
>;

type ConfirmReservationUseCase = UseCase<
	{
		reservationId: string;
	},
	// FIXME: refine error types
	Result<void, DomainError>
>;

type CancelReservationUseCase = UseCase<
	{
		reservationId: string;
	},
	Result<void, DomainError>
>;

type GetEventsUseCase = UseCase<void, Result<Event[], DomainError>>;

type GetEventByIdUseCase = UseCase<
	{
		eventId: Event["id"];
	},
	// FIXME: refine error types
	Result<Event, DomainError>
>;

type GetReservations = UseCase<void, Result<Order[], DomainError>>;

type GetReservationById = UseCase<
	{
		reservationId: Order["id"];
	},
	// FIXME: refine error types
	Result<Order, DomainError>
>;
