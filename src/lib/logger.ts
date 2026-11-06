import pino from "pino";

/**
 * Plain pino only — worker transports like `pino-pretty` fail under
 * Next.js / Turbopack ("unable to determine transport target").
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  ...(process.env.NODE_ENV === "development"
    ? {
        formatters: {
          level(label) {
            return { level: label };
          },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }
    : {}),
});
