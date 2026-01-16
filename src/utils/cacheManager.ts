import { Meal } from '../types';
import { HydrationLog } from '../types';

/**
 * Centralized cache manager for user data
 * Prevents cross-user data leaks by providing a single point to clear all caches
 */
class CacheManager {
    private mealsCache = new Map<string, Meal[]>();
    private hydrationCache = new Map<string, HydrationLog[]>();

    /**
     * Clear all caches - called on logout to prevent data leaks
     */
    clearAll() {
        this.mealsCache.clear();
        this.hydrationCache.clear();
        console.log('🗑️ CacheManager: All caches cleared');
    }

    /**
     * Get the meals cache instance
     */
    getMealsCache() {
        return this.mealsCache;
    }

    /**
     * Get the hydration cache instance
     */
    getHydrationCache() {
        return this.hydrationCache;
    }

    /**
     * Get cache statistics for debugging
     */
    getStats() {
        return {
            mealsKeys: Array.from(this.mealsCache.keys()),
            hydrationKeys: Array.from(this.hydrationCache.keys()),
            mealsCacheSize: this.mealsCache.size,
            hydrationCacheSize: this.hydrationCache.size,
        };
    }
}

// Export singleton instance
export const cacheManager = new CacheManager();
