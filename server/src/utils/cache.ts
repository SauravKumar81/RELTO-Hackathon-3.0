import Redis from 'ioredis';
import logger from '../config/logger';

// Default to localhost if not specified in env
const redisUri = process.env.REDIS_URI || 'redis://localhost:6379';

// Initialize Redis client
export const redis = new Redis(redisUri, {
  retryStrategy(times) {
    // Reconnect after
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  logger.error('❌ Redis connection error', { error: err.message });
});

const DEFAULT_EXPIRATION = 3600; // 1 hour in seconds

/**
 * Get data from cache, or execute the callback to get data, then cache it.
 * @param key The cache key
 * @param cb The callback function that returns the data to be cached (Promise)
 * @param ttl Time to live in seconds (default: 3600)
 */
export const getOrSetCache = async <T>(
  key: string,
  cb: () => Promise<T>,
  ttl: number = DEFAULT_EXPIRATION
): Promise<T> => {
  try {
    const cachedData = await redis.get(key);
    
    if (cachedData) {
      logger.info(`⚡ Cache hit for key: ${key}`);
      return JSON.parse(cachedData) as T;
    }
    
    logger.info(`🐢 Cache miss for key: ${key}`);
    const data = await cb();
    
    // Only cache if data is not null/undefined
    if (data !== null && data !== undefined) {
      await redis.setex(key, ttl, JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    // If Redis fails, just execute the callback directly to not break the app
    logger.error(`Redis cache error for key ${key}`, { error });
    return await cb();
  }
};

/**
 * Invalidate all cache keys matching a pattern
 * @param pattern The pattern to match (e.g., "items:*")
 */
export const invalidateCache = async (pattern: string): Promise<void> => {
  try {
    let cursor = '0';
    const keysToDelete: string[] = [];
    
    do {
      const [newCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = newCursor;
      keysToDelete.push(...keys);
    } while (cursor !== '0');
    
    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete);
      logger.info(`🗑️ Invalidated ${keysToDelete.length} cache keys matching ${pattern}`);
    }
  } catch (error) {
    logger.error(`Failed to invalidate cache for pattern ${pattern}`, { error });
  }
};
