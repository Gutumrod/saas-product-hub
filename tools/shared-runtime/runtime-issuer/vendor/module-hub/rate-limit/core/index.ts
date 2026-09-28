export { createRateLimiter, checkRateLimit } from './limiter.ts';
export { RateLimitError, RateLimitConfigError } from './error.ts';
export { createMemoryStore } from '../adapters/memory-store.ts';
export type { ErrorShape } from './error.js';
export type { RateLimiter } from './limiter.js';
export type {
  CheckRateLimitInput,
  MemoryStoreOptions,
  RateLimitConfig,
  RateLimitResult,
  RateLimitStore,
  StoreConsumeParams,
  StoreConsumeResult,
} from './types.ts';
