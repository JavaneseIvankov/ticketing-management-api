export type ErrorResponse<TDetails = undefined> = {
	error: {
		code: string;
		message: string;
		details: TDetails;
	};
};

export type SuccessResponse<TData, TMeta = undefined> = {
	data: TData;
	meta?: TMeta;
};

export type ApiResponse<T, E = unknown> = SuccessResponse<T> | ErrorResponse<E>;
