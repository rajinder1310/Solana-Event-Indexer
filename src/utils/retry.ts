
import { logger } from './logger';

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryableErrors?: string[]; // Substrings of error messages that are retryable
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 5,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    retryableErrors = []
  } = options;

  let attempt = 1;
  let delay = initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt >= maxAttempts) {
        throw error;
      }

      // If specific errors are defined, check if this error matches
      if (retryableErrors.length > 0) {
        const errorMessage = error.message || error.toString();
        const isRetryable = retryableErrors.some(err => errorMessage.includes(err));
        if (!isRetryable) {
          throw error;
        }
      }

      logger.warn(`Retry attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms. Error: ${error.message}`);

      await sleep(delay);

      attempt++;
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }
}
