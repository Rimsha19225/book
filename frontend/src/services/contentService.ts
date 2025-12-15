/** Content Service for the Physical AI & Humanoid Robotics Textbook application */
import { contentService as api } from './apiClient';

export interface ModuleResponse {
  modules: Module[];
}

export interface ChapterResponse {
  chapters: Chapter[];
}

export interface QueryResponse {
  response: string;
  sources: Array<{
    content_id: string;
    relevance_score: number;
  }>;
}

/**
 * Fetch all available modules
 * @returns Promise containing an array of modules
 */
export const getAllModules = async (): Promise<Module[]> => {
  try {
    const response = await api.getModules();
    return response.data.modules as Module[];
  } catch (error) {
    console.error('Error fetching modules:', error);
    throw error;
  }
};

/**
 * Fetch chapters for a specific module
 * @param moduleId - The ID of the module
 * @returns Promise containing an array of chapters
 */
export const getChaptersForModule = async (moduleId: string): Promise<Chapter[]> => {
  try {
    const response = await api.getChapters(moduleId);
    return response.data.chapters as Chapter[];
  } catch (error) {
    console.error(`Error fetching chapters for module ${moduleId}:`, error);
    throw error;
  }
};

/**
 * Query content-specific information
 * @param moduleId - The ID of the module
 * @param chapterId - The ID of the chapter
 * @param query - The query string
 * @param selectedText - Optional selected text for context
 * @returns Promise containing the query response
 */
export const queryContent = async (
  moduleId: string,
  chapterId: string,
  query: string,
  selectedText?: string
): Promise<QueryResponse> => {
  try {
    const response = await api.queryContent(moduleId, chapterId, query, selectedText);
    return response.data as QueryResponse;
  } catch (error) {
    console.error(`Error querying content for module ${moduleId}, chapter ${chapterId}:`, error);
    throw error;
  }
};

/**
 * Get content for a specific chapter
 * @param moduleId - The ID of the module
 * @param chapterId - The ID of the chapter
 * @returns Promise containing the chapter content
 */
export const getChapterContent = async (moduleId: string, chapterId: string): Promise<string> => {
  // In a real implementation, this would fetch the actual chapter content
  // For now, we'll return a placeholder
  try {
    // This would typically be a call to get the actual content
    // For example: return (await api.getChapterContent(moduleId, chapterId)).data.content;
    return `Content for module ${moduleId}, chapter ${chapterId}`;
  } catch (error) {
    console.error(`Error fetching content for module ${moduleId}, chapter ${chapterId}:`, error);
    throw error;
  }
};

// Define TypeScript interfaces for content types
export interface Module {
  module_id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_duration_hours?: number;
}

export interface Chapter {
  chapter_id: string;
  title: string;
  content_type: string;
}