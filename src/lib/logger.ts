/**
 * Structured logger — thin wrapper over console with JSON output.
 * Usage: log.error("api/appointments POST", { error: err.message, userId })
 */

type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  msg: string;
  ts: string;
  [key: string]: unknown;
}

function emit(level: LogLevel, msg: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    msg,
    ts: new Date().toISOString(),
    ...data,
  };

  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const log = {
  info: (msg: string, data?: Record<string, unknown>) => emit("info", msg, data),
  warn: (msg: string, data?: Record<string, unknown>) => emit("warn", msg, data),
  error: (msg: string, data?: Record<string, unknown>) => emit("error", msg, data),
};
