export type DomainError =
	| EventNotFound
	| ReservationNotFound
	| NotOwnedReservation
	| EventClosed
	| InsufficientCapacity
	| ReservationExpired
	| ReservationCancelled
	| DuplicateRequest
	| InvalidState
	| UserAlreadyExists;

type TaggedError<T extends string, Ext extends Record<string, unknown>> = {
	_tag: T;
	message?: string;
} & Ext;

export type EventNotFound = TaggedError<"EventNotFound", { eventId: string }>;

export type ReservationNotFound = TaggedError<
	"ReservationNotFound",
	{ reservationId: string }
>;

export type NotOwnedReservation = TaggedError<
	"NotOwnedReservation",
	{ reservationId: string; userId: string }
>;

export type EventClosed = TaggedError<
	"EventClosed",
	{ eventId: string; closedAt?: string }
>;

export type InsufficientCapacity = TaggedError<
	"InsufficientCapacity",
	{ eventId: string; requested: number; available: number }
>;

export type ReservationExpired = TaggedError<
	"ReservationExpired",
	{ reservationId: string; expiredAt?: string }
>;

export type ReservationCancelled = TaggedError<
	"ReservationCancelled",
	{ reservationId: string; cancelledAt?: string }
>;

export type DuplicateRequest = TaggedError<
	"DuplicateRequest",
	{ requestId: string }
>;

export type InvalidState = TaggedError<
	"InvalidState",
	{
		resource: string;
		expected?: string;
		actual?: string;
	}
>;

export type UserAlreadyExists = TaggedError<
	"UserAlreadyExists",
	{ email: string }
>;

export type UserNotFound<E extends { email: string } | { userId: string }> =
	TaggedError<"UserNotFound", E>;
