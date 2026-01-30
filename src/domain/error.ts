import { createErrorFactories, type InferErrors } from "../lib/error-lib.js";


export type {
	ExternalError,
	UnexpectedError,
} from "../lib/error-lib.js";
export {
	externalErrorFromCatch,
	unexpectedErrorFromCatch,
} from "../lib/error-lib.js";

export type DomainErrors = InferErrors<typeof domainErrorFactories>;
export type DomainErrorTags = DomainErrors["_tag"];
export type PickDomainErrors<TTags extends DomainErrorTags> = Extract<
	DomainErrors,
	{ _tag: TTags }
>;

const domainErrorFactories = createErrorFactories({
	EventNotFound: ({ eventId }: { eventId: string }) =>
		`Event with ID '${eventId}' not found`,

	ReservationNotFound: ({ reservationId }: { reservationId: string }) =>
		`Reservation with ID '${reservationId}' not found`,

	NotOwnedReservation: ({
		reservationId,
		userId,
	}: {
		reservationId: string;
		userId: string;
	}) => `Reservation '${reservationId}' does not belong to user '${userId}'`,

	EventClosed: ({
		eventId,
		closedAt,
	}: {
		eventId: string;
		closedAt?: string;
	}) =>
		closedAt
			? `Event '${eventId}' was closed at ${closedAt}`
			: `Event '${eventId}' is closed for reservations`,

	InsufficientCapacity: ({
		eventId,
		requested,
		available,
	}: {
		eventId: string;
		requested: number;
		available: number;
	}) =>
		`Event '${eventId}': insufficient capacity (requested: ${requested}, available: ${available})`,

	ReservationExpired: ({
		reservationId,
		expiredAt,
	}: {
		reservationId: string;
		expiredAt?: string;
	}) =>
		expiredAt
			? `Reservation '${reservationId}' expired at ${expiredAt}`
			: `Reservation '${reservationId}' has expired`,

	ReservationCancelled: ({
		reservationId,
		cancelledAt,
	}: {
		reservationId: string;
		cancelledAt?: string;
	}) =>
		cancelledAt
			? `Reservation '${reservationId}' was cancelled at ${cancelledAt}`
			: `Reservation '${reservationId}' was cancelled`,

	DuplicateRequest: ({ requestId }: { requestId: string }) =>
		`Duplicate request detected: '${requestId}'`,

	InvalidState: ({
		resource,
		expected,
		actual,
	}: {
		resource: string;
		expected?: string;
		actual?: string;
	}) =>
		expected && actual
			? `Resource '${resource}' is in invalid state (expected: ${expected}, actual: ${actual})`
			: `Resource '${resource}' is in an invalid state`,

	UserAlreadyExists: ({ email }: { email: string }) =>
		`User with email '${email}' already exists`,

	UserNotFoundByEmail: ({ email }: { email: string }) =>
		`User with email '${email}' not found`,

	UserNotFoundById: ({ userId }: { userId: string }) =>
		`User with ID '${userId}' not found`,
});

export default domainErrorFactories;