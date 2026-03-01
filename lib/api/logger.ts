export type Logger = {
  info: (event: string, payload?: Record<string, unknown>) => void;
  warn: (event: string, payload?: Record<string, unknown>) => void;
  error: (event: string, payload?: Record<string, unknown>) => void;
};

type LoggerOptions = {
  requestId?: string;
};

function emit(level: "info" | "warn" | "error", scope: string, event: string, payload?: Record<string, unknown>) {
  const message = {
    level,
    scope,
    event,
    ...(payload ?? {}),
  };

  if (level === "error") {
    console.error(message);
    return;
  }

  if (level === "warn") {
    console.warn(message);
    return;
  }

  console.log(message);
}

export function createLogger(scope: string, options: LoggerOptions = {}): Logger {
  const basePayload = options.requestId ? { requestId: options.requestId } : undefined;

  return {
    info(event, payload) {
      emit("info", scope, event, { ...(basePayload ?? {}), ...(payload ?? {}) });
    },
    warn(event, payload) {
      emit("warn", scope, event, { ...(basePayload ?? {}), ...(payload ?? {}) });
    },
    error(event, payload) {
      emit("error", scope, event, { ...(basePayload ?? {}), ...(payload ?? {}) });
    },
  };
}

