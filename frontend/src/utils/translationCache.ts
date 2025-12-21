/** Cache utility for the Physical AI & Humanoid Robotics Textbook application */
export class TranslationCache {
  private static readonly CACHE_KEY_PREFIX = 'translation_';
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Generate a unique cache key based on content and target language
  static generateCacheKey(content: string, targetLanguage: string, moduleId?: string, chapterId?: string): string {
    const contentHash = this.generateHash(content);
    const keyParts = [this.CACHE_KEY_PREFIX, contentHash, targetLanguage];

    if (moduleId) keyParts.push(moduleId);
    if (chapterId) keyParts.push(chapterId);

    return keyParts.join('_');
  }

  // Generate a simple hash of the content for the cache key
  private static generateHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Check if a translation is in cache and not expired
  static getFromCache(cacheKey: string): string | null {
    try {
      const cachedItem = localStorage.getItem(cacheKey);
      if (!cachedItem) return null;

      const parsed = JSON.parse(cachedItem);
      const now = Date.now();

      // Check if the cached item is still valid
      if (now - parsed.timestamp < this.CACHE_DURATION) {
        return parsed.content;
      } else {
        // Remove expired item
        this.removeFromCache(cacheKey);
        return null;
      }
    } catch (error) {
      console.error('Error retrieving from cache:', error);
      return null;
    }
  }

  // Store a translation in cache
  static setToCache(cacheKey: string, content: string): void {
    try {
      const cacheItem = {
        content,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error storing in cache:', error);
    }
  }

  // Remove a translation from cache
  static removeFromCache(cacheKey: string): void {
    try {
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Error removing from cache:', error);
    }
  }

  // Clear all translation cache
  static clearAll(): void {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}