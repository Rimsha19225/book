/** Translation Service for the Physical AI & Humanoid Robotics Textbook application */
import apiClient from './apiClient';
import { TranslationCache } from '../utils/translationCache';

export interface TranslationRequest {
  content: string;
  targetLanguage: string;
  moduleId?: string;
  chapterId?: string;
}

export interface TranslationResponse {
  translatedContent: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: string;
}

// Translation service functions
export const translationService = {
  // Translate content to Urdu
  translateToUrdu: async (request: Omit<TranslationRequest, 'targetLanguage'>): Promise<TranslationResponse> => {
    // Generate cache key
    const cacheKey = TranslationCache.generateCacheKey(
      request.content,
      'ur',
      request.moduleId,
      request.chapterId
    );

    // Check if translation is already in cache
    const cachedTranslation = TranslationCache.getFromCache(cacheKey);
    if (cachedTranslation) {
      return {
        translatedContent: cachedTranslation,
        sourceLanguage: 'en',
        targetLanguage: 'ur',
        timestamp: new Date().toISOString()
      };
    }

    // If not in cache, make API call
    const response = await apiClient.post('/content/translate', {
      ...request,
      targetLanguage: 'ur'
    });

    // Store the result in cache
    TranslationCache.setToCache(cacheKey, response.data.translatedContent);

    return response.data;
  },

  // Check if user is authenticated for translation features
  isAuthenticated: (): boolean => {
    // Check if user has a valid authentication token
    const token = localStorage.getItem('auth_token');
    return token !== null && token !== '';
  }
};