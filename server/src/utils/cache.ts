import { redis } from '../config/redis';
import { logger } from '../utils/logger';

const DEFAULT_EXPIRATION = 300; // 5 minutes in seconds

/**
 * Get data from cache, or execute the callback to get data, then cache it.
 * @param key The cache key
 * @param cb The callback function that returns the data to be cached (Promise)
 * @param ttl Time to live in seconds (default: 300)
 */
export const getOrSet = async <T>(
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
export const invalidate = async (pattern: string): Promise<void> => {
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
