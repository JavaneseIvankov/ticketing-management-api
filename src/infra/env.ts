// /** biome-ignore-all lint/suspicious/noExplicitAny: will be parsed */
import z, { ZodError } from "zod";
import type { ILogger } from "./logger.js";
import rootLogger from "./pino-logger.js";

const EnvSchema = z.object({
	APP_PORT: z.coerce.number(),
	DATABASE_URL: z.string(),
});
export type Env = z.infer<typeof EnvSchema>;

const initEnv = (logger: ILogger) => {
	try {
		return EnvSchema.parse({
			APP_PORT: process.env.APP_PORT,
			DATABASE_URL: process.env.DATABASE_URL,
		});
	} catch (e: unknown) {
		if (e instanceof ZodError) {
			logger.fatal("Failed to parse env", e);
		} else if (e instanceof Error) {
			logger.fatal("Unexpected error in env", e);
		} else {
			logger.fatal("Unexpected non-error thrown in env", undefined, {
				error: e,
			});
		}
		process.exit(1);
	}
};

const env = initEnv(rootLogger);

export default env;
