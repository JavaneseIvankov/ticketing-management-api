import type { DomainErrors, ExternalError } from "../domain/error.js";
import type { ErrorResponse } from "./types.js";

export function mapDomainErrorToHttp(error: DomainErrors): {
		status: number;
		body: ErrorResponse<DomainErrors>;
	} {
		const statusMap: Record<DomainErrors["_tag"], number> = {
			EventNotFound: 404,
			ReservationNotFound: 404,
			UserNotFoundByEmail: 404,
			UserNotFoundById: 404,
			NotOwnedReservation: 403,
			EventClosed: 409,
			InsufficientCapacity: 409,
			ReservationExpired: 409,
			ReservationCancelled: 409,
			DuplicateRequest: 409,
			InvalidState: 409,
			UserAlreadyExists: 409,
		};

		return {
			status: statusMap[error._tag],
			body: {
				// TODO: in the future, add redactor / tighten error-message system
				error: {
					code: error._tag,
					message: error.message,
					details: error,
				},
			},
		};
	}

export function mapExternalErrorToHttp(error: ExternalError): {
	status: number;
	body: ErrorResponse;
} {
	return {
		status: 503,
		body: {
			error: {
				code: "SERVICE_UNAVAILABLE",
				message: "Service temporarily unavailable. Please try again later.",
				details: undefined,
			},
		},
	};
}