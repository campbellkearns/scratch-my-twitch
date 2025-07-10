/**
 * Category Repository
 * 
 * Handles caching of Twitch categories for offline use.
 * Implements 24-48 hour cache strategy as defined in the PRD.
 */

import type { StreamCategory } from '@/types/Profile';
import { STORAGE_KEYS, CACHE_SETTINGS } from '@/types/constants';
import { getDB } from '@/lib/db/indexedDB';
import type { RepositoryResult } from './ProfileRepository';

/**
 * Cached category with metadata
 */
interface CachedCategory extends StreamCategory {
  cachedAt: Date;
  lastFetched: Date;
}

/**
 * Category search result for API responses
 */
interface CategorySearchResult {
  categories: StreamCategory[];
  hasMore: boolean;
  cursor?: string;
}

/**
 * Category Repository Implementation
 */
export class CategoryRepository {
  private readonly storeName = STORAGE_KEYS.CATEGORIES_STORE;

  /**
   * Get all cached categories
   */
  async getAll(): Promise<RepositoryResult<StreamCategory[]>> {
    try {
      const db = await getDB();
      const cachedCategories = await db.getAll<CachedCategory>(this.storeName);
      
      // Convert cached categories to stream categories
      const categories = cachedCategories.map(cached => ({
        id: cached.id,
        name: cached.name,
        boxArtUrl: cached.boxArtUrl
      }));

      return {
        success: true,
        data: categories
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch cached categories',
          code: 'STORAGE_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Search categories by name (cached first, then API if needed)
   */
  async search(query: string): Promise<RepositoryResult<StreamCategory[]>> {
    try {
      // First, search in cache
      const cachedResult = await this.searchCached(query);
      
      if (cachedResult.success && cachedResult.data && cachedResult.data.length > 0) {
        return cachedResult;
      }

      // TODO: Phase 5 - If no cached results, search via Twitch API
      // For now, return empty results in local mode
      return {
        success: true,
        data: []
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to search categories',
          code: 'STORAGE_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Search only in cached categories
   */
  private async searchCached(query: string): Promise<RepositoryResult<StreamCategory[]>> {
    try {
      const allResult = await this.getAll();
      
      if (!allResult.success || !allResult.data) {
        return allResult;
      }

      const filteredCategories = allResult.data.filter(category =>
        category.name.toLowerCase().includes(query.toLowerCase())
      );

      return {
        success: true,
        data: filteredCategories
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to search cached categories',
          code: 'STORAGE_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Get a category by ID
   */
  async getById(id: string): Promise<RepositoryResult<StreamCategory>> {
    try {
      const db = await getDB();
      const cached = await db.get<CachedCategory>(this.storeName, id);

      if (!cached) {
        return {
          success: false,
          error: {
            message: 'Category not found',
            code: 'CATEGORY_NOT_FOUND'
          }
        };
      }

      const category: StreamCategory = {
        id: cached.id,
        name: cached.name,
        boxArtUrl: cached.boxArtUrl
      };

      return {
        success: true,
        data: category
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch category',
          code: 'STORAGE_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Cache categories from API response
   */
  async cacheCategories(categories: StreamCategory[]): Promise<RepositoryResult<void>> {
    try {
      const db = await getDB();
      const now = new Date();

      for (const category of categories) {
        const cachedCategory: CachedCategory = {
          ...category,
          cachedAt: now,
          lastFetched: now
        };

        await db.put(this.storeName, cachedCategory);
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to cache categories',
          code: 'STORAGE_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Check if cache needs refresh (24-48 hours old)
   */
  async needsRefresh(): Promise<boolean> {
    try {
      const db = await getDB();
      const categories = await db.getAll<CachedCategory>(this.storeName);

      if (categories.length === 0) {
        return true; // No cache, needs refresh
      }

      // Check if oldest category is beyond TTL
      const oldestCategory = categories.reduce((oldest, current) => {
        return new Date(current.cachedAt) < new Date(oldest.cachedAt) ? current : oldest;
      });

      const cacheAge = Date.now() - new Date(oldestCategory.cachedAt).getTime();
      return cacheAge > CACHE_SETTINGS.CATEGORIES_TTL;
    } catch {
      return true; // Error means we should refresh
    }
  }

  /**
   * Clear all cached categories
   */
  async clearCache(): Promise<RepositoryResult<void>> {
    try {
      const db = await getDB();
      await db.clear(this.storeName);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to clear category cache',
          code: 'STORAGE_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<RepositoryResult<{
    totalCategories: number;
    oldestCache: Date | null;
    newestCache: Date | null;
    needsRefresh: boolean;
  }>> {
    try {
      const db = await getDB();
      const categories = await db.getAll<CachedCategory>(this.storeName);

      if (categories.length === 0) {
        return {
          success: true,
          data: {
            totalCategories: 0,
            oldestCache: null,
            newestCache: null,
            needsRefresh: true
          }
        };
      }

      const dates = categories.map(c => new Date(c.cachedAt));
      const oldestCache = new Date(Math.min(...dates.map(d => d.getTime())));
      const newestCache = new Date(Math.max(...dates.map(d => d.getTime())));
      const needsRefresh = await this.needsRefresh();

      return {
        success: true,
        data: {
          totalCategories: categories.length,
          oldestCache,
          newestCache,
          needsRefresh
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to get cache stats',
          code: 'STORAGE_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Get popular/default categories for initial setup
   */
  getDefaultCategories(): StreamCategory[] {
    return [
      { id: '509658', name: 'Just Chatting' },
      { id: '26936', name: 'Music' },
      { id: '509660', name: 'Art' },
      { id: '509670', name: 'Science & Technology' },
      { id: '509659', name: 'ASMR' },
      { id: '488191', name: 'Podcast' },
      { id: '417752', name: 'Talk Shows & Podcasts' },
      { id: '509663', name: 'Special Events' },
      { id: '21548', name: 'World of Warcraft' },
      { id: '32982', name: 'Grand Theft Auto V' },
      { id: '511224', name: 'Apex Legends' },
      { id: '33214', name: 'Fortnite' }
    ];
  }
}

// Singleton instance
let categoryRepositoryInstance: CategoryRepository | null = null;

/**
 * Get the category repository instance
 */
export const getCategoryRepository = (): CategoryRepository => {
  if (!categoryRepositoryInstance) {
    categoryRepositoryInstance = new CategoryRepository();
  }
  return categoryRepositoryInstance;
};

/**
 * Reset the category repository instance (useful for testing)
 */
export const resetCategoryRepository = (): void => {
  categoryRepositoryInstance = null;
};
