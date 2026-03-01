import type { ToolGateway } from "./types";

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export class RetryingToolGateway implements ToolGateway {
  async execute<T>(
    operation: () => Promise<T>,
    options?: { retries?: number; backoffMs?: number },
  ): Promise<{ result: T; retries: number }> {
    const retries = options?.retries ?? 0;
    const backoffMs = options?.backoffMs ?? 0;
    let attempt = 0;

    while (true) {
      try {
        const result = await operation();
        return { result, retries: attempt };
      } catch (error) {
        if (attempt >= retries) {
          throw error;
        }
        attempt += 1;
        await wait(backoffMs * attempt);
      }
    }
  }
}

