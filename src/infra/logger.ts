export interface ILogger {
	debug(message: string, meta?: Record<string, unknown>): void;
	info(message: string, meta?: Record<string, unknown>): void;
	warn(message: string, meta?: Record<string, unknown>): void;
	error(message: string, error?: Error, meta?: Record<string, unknown>): void;
	fatal(message: string, error?: Error, meta?: Record<string, unknown>): void;
	child?(meta: Record<string, unknown>): ILogger;
}
