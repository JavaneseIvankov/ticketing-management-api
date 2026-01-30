// ============================================================================
// Core Error Lib Types
// ============================================================================

/**
 * Base tagged error type that all application errors extend from.
 * Provides a discriminated union pattern via the `_tag` field.
 */
export type TaggedError<
	T extends string,
	Ext extends Record<string, unknown>,
> = {
	_tag: T;
	message: string;
} & Ext;

// ============================================================================
// Error Factory Function
// ============================================================================

/**
 * Creates a type-safe error factory function.
 *
 * @param tag - The unique error tag for discriminated unions
 * @param defaultMessage - Function that generates default message from error properties
 * @returns Factory function that creates error instances
 *
 * @example
 * ```typescript
 * const userNotFound = createError<"UserNotFound", { userId: string }>(
 *   "UserNotFound",
 *   ({ userId }) => `User with ID '${userId}' not found`
 * );
 *
 * const error = userNotFound({ userId: "123" });
 * // { _tag: "UserNotFound", userId: "123", message: "User with ID '123' not found" }
 * ```
 */
// TODO: improve this with curried version for better type inference
export function createError<
	T extends string,
	Ext extends Record<string, unknown>,
>(tag: T, defaultMessage: (props: Ext) => string) {
	return (props: Ext & { message?: string }): TaggedError<T, Ext> => ({
		_tag: tag,
		...props,
		message: props.message ?? defaultMessage(props),
	});
}

// ============================================================================
// Error Definition Builder
// ============================================================================

/**
 * Internal helper for defining error factories.
 * Wraps createError with a cleaner API for batch error definition.
 */
const defineError =
	<T extends string, Extension extends Record<string, unknown>>(
		tag: T,
		msgFn: (props: Extension) => string,
	) =>
	(props: Extension & { message?: string }) =>
		createError(tag, msgFn)(props);

/**
 * Type representing error definition objects.
 * Maps error names to message generator functions.
 */
type ErrorDefs = Record<string, (props: never) => string>;

/**
 * Creates a collection of error factory functions from error definitions.
 * Automatically infers types and creates properly typed factory functions.
 *
 * @param defs - Object mapping error names to additional fields and message generator functions. The param signature passed to the function defines the additional fields for each error.
 * @returns Object with the same keys, but values are error factory functions
 *
 * @example
 * ```typescript
 * const errors = createErrorFactories({
 *   UserNotFound: ({ userId }: { userId: string }) =>
 *     `User with ID '${userId}' not found`,
 *   InvalidEmail: ({ email }: { email: string }) =>
 *     `Email '${email}' is invalid`
 * });
 *
 * const error = errors.UserNotFound({ userId: "123" });
 * // Type: TaggedError<"UserNotFound", { userId: string }>
 * ```
 */
export function createErrorFactories<E extends ErrorDefs, K>(defs: E) {
	const result = {} as {
		[K in keyof E]: (
			props: Parameters<E[K]>[0] & { message?: string },
		) => TaggedError<K & string, Parameters<E[K]>[0]>;
	};

	for (const key in defs) {
		const tag = key as K & string;
		const msgFn = defs[key];
		result[key] = defineError(tag, msgFn);
	}

	return result;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Infers the union type of all errors from a factory object created by createErrorFactories.
 *
 * @example
 * ```typescript
 * const factories = createErrorFactories({
 *   UserNotFound: ({ userId }: { userId: string }) => `User ${userId} not found`,
 *   InvalidEmail: ({ email }: { email: string }) => `Email ${email} is invalid`
 * });
 *
 * type Errors = InferErrors<typeof factories>;
 * // Errors = TaggedError<"UserNotFound", { userId: string }> | TaggedError<"InvalidEmail", { email: string }>
 * ```
 */
export type InferErrors<Factories> =
	Factories extends Record<
		string,
		// biome-ignore lint/suspicious/noExplicitAny: i dono how to fix this for now
		(...args: any[]) => any
	>
		? ReturnType<Factories[keyof Factories]>
		: never;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Safely converts unknown values to Error instances.
 * Useful for catch blocks where error type is unknown.
 *
 * @param e - The unknown error value
 * @returns A proper Error instance
 *
 * @example
 * ```typescript
 * try {
 *   riskyOperation();
 * } catch (e) {
 *   const error = toError(e);
 *   console.log(error.message, error.stack);
 * }
 * ```
 */
export const toError = (e: unknown): Error =>
	e instanceof Error
		? e
		: new Error(
				typeof e === "string" ? e : `Unknown error: ${JSON.stringify(e)}`,
			);

// ============================================================================
// Infrastructure Error Types
// ============================================================================

/**
 * External errors represent failures outside our control:
 * - Database crashes
 * - Network timeouts
 * - Third-party API failures
 * - File system errors
 *
 * These are EXPECTED operational failures, not bugs.
 * They should be retried, logged, and handled gracefully.
 */
export type ExternalError = TaggedError<
	"ExternalError",
	{
		operation: string;
		cause: string;
		stack?: string;
	}
>;

/**
 * Unexpected errors represent bugs or programmer errors:
 * - Null pointer exceptions
 * - Type errors
 * - Assertion failures
 *
 * These should NEVER happen in production.
 * They indicate a bug that needs fixing.
 * This should only be caught at error boundaries.
 */
export type UnexpectedError = TaggedError<
	"UnexpectedError",
	{
		cause: string;
		stack?: string;
	}
>;

// ============================================================================
// Infrastructure Error Factory Functions
// ============================================================================

/**
 * Creates an ExternalError for operations that fail due to external factors.
 */
export const externalError = createError<
	"ExternalError",
	{ operation: string; cause: string; stack?: string }
>(
	"ExternalError",
	({ operation, cause }) =>
		`External operation '${operation}' failed: ${cause}`,
);

/**
 * Helper to create an ExternalError from a caught error object.
 *
 * @param operation - The operation that failed (e.g., "database:query", "api:fetch")
 * @param error - The caught error (Error object or unknown)
 * @returns ExternalError instance with stack trace preserved
 *
 * @example
 * ```typescript
 * try {
 *   await database.query('SELECT * FROM users');
 * } catch (error) {
 *    // do not throw, return the error for graceful handling
 *   return externalErrorFromCatch('database:query', error);
 * }
 * ```
 */
export function externalErrorFromCatch(
	operation: string,
	error: unknown,
): ExternalError {
	const cause = error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : undefined;
	return externalError({ operation, cause, stack });
}

/**
 * Creates an UnexpectedError for bugs and programmer errors.
 */
export const unexpectedError = createError<
	"UnexpectedError",
	{ cause: string; stack?: string }
>("UnexpectedError", ({ cause }) => `Unexpected error (bug): ${cause}`);

/**
 * Helper to create an UnexpectedError from a caught error object.
 * This should ONLY be called at error boundaries (.onError handlers).
 *
 * @param error - The caught error (Error object or unknown)
 * @returns UnexpectedError instance with stack trace preserved
 *
 * @example
 * ```typescript
 * app.onError((error, c) => {
 *   if (!isAppError(error)) {
 *     const unexpectedErr = unexpectedErrorFromCatch(error);
 *     logger.error(unexpectedErr);
 *     return c.json({ error: 'Internal server error' }, 500);
 *   }
 *   // Handle known app errors...
 * });
 * ```
 */
export function unexpectedErrorFromCatch(error: unknown): UnexpectedError {
	const cause = error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : undefined;
	return unexpectedError({ cause, stack });
}
