import type { Logger as PinoLogger } from "pino";
import type { ILogger } from "./logger.js";

export function createPinoLogger(logger: PinoLogger): ILogger {
	return {
		debug(message: string, meta?: unknown): void {
			logger.debug(meta ?? {}, message);
		},

		info(message: string, meta?: unknown): void {
			logger.info(meta ?? {}, message);
		},

		warn(message: string, meta?: unknown): void {
			logger.warn(meta ?? {}, message);
		},

		error(message: string, error?: Error, meta?: unknown): void {
			if (error) {
				logger.error({ err: error, ...(meta as object) }, message);
			} else {
				logger.error(meta ?? {}, message);
			}
		},

		fatal(message: string, error?: Error, meta?: unknown): void {
			if (error) {
				logger.fatal({ err: error, ...(meta as object) }, message);
			} else {
				logger.fatal(meta ?? {}, message);
			}
		},

		child(meta: Record<string, unknown>): ILogger {
			return createPinoLogger(logger.child(meta));
		},
	};
}
