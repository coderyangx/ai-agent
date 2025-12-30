import winston from "winston";
import path from "node:path";
import { format } from "date-fns";

const LOGS_DIR = path.join(process.env.HOME, "applogs/ai-agent");

export const getLogger = (id?: string) => {
  const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.json(),
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp }) => {
        return `${timestamp} ${level.toUpperCase()}: ${message}`;
      }),
    ),
    defaultMeta: { app: "ai-agent" },
    transports: [
      new winston.transports.File({
        filename: `error-${format(new Date(), "yyyy-MM-dd_HH")}${id ? "-" + id : ""}.log`,
        dirname: LOGS_DIR,
        level: "error",
      }),
      new winston.transports.File({
        filename: `info-${format(new Date(), "yyyy-MM-dd_HH")}${id ? "-" + id : ""}.log`,
        dirname: LOGS_DIR,
        level: "info",
      }),
    ],
  });

  if (process.env.NODE_ENV !== "production") {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    );
  }

  return logger;
};

export const logger = getLogger();
