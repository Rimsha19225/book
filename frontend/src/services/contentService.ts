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
    // Return mock data if API fails
    console.warn('Using mock data for modules since API is unavailable');
    return [
      {
        module_id: 'welcome',
        title: 'Welcome',
        description: 'Welcome to the Physical AI & Humanoid Robotics Textbook',
        order_index: 0
      },
      {
        module_id: 'introductory',
        title: 'Introductory Concepts',
        description: 'Introduction to Physical AI and Robotics',
        order_index: 1
      },
      {
        module_id: 'module-1-ros2',
        title: 'Module 1: ROS 2 Fundamentals',
        description: 'Learn the basics of Robot Operating System 2',
        order_index: 2
      },
      {
        module_id: 'module-2-gazebo-unity',
        title: 'Module 2: Simulation Environments',
        description: 'Gazebo and Unity for robotics simulation',
        order_index: 3
      },
      {
        module_id: 'module-3-nvidia-isaac',
        title: 'Module 3: NVIDIA Isaac Platform',
        description: 'Using NVIDIA Isaac for robotics development',
        order_index: 4
      },
      {
        module_id: 'module-4-vla',
        title: 'Module 4: Vision-Language-Action Models',
        description: 'Understanding VLA models in robotics',
        order_index: 5
      }
    ];
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
    // Return mock data if API fails
    console.warn(`Using mock data for chapters in module ${moduleId} since API is unavailable`);
    // Return different mock chapters based on the module
    const mockChapters: Record<string, Chapter[]> = {
      'welcome': [
        { chapter_id: 'welcome-intro', title: 'Introduction', content_type: 'text' },
        { chapter_id: 'welcome-overview', title: 'Course Overview', content_type: 'text' }
      ],
      'introductory': [
        { chapter_id: 'intro-ai', title: 'Introduction to AI', content_type: 'text' },
        { chapter_id: 'intro-robotics', title: 'Introduction to Robotics', content_type: 'text' },
        { chapter_id: 'intro-physical-ai', title: 'Physical AI Concepts', content_type: 'text' }
      ],
      'module-1-ros2': [
        { chapter_id: 'ros2-intro', title: 'ROS 2 Introduction', content_type: 'text' },
        { chapter_id: 'ros2-nodes', title: 'Nodes and Topics', content_type: 'text' },
        { chapter_id: 'ros2-services', title: 'Services and Actions', content_type: 'text' }
      ],
      'module-2-gazebo-unity': [
        { chapter_id: 'simulation-intro', title: 'Simulation Introduction', content_type: 'text' },
        { chapter_id: 'gazebo-basics', title: 'Gazebo Basics', content_type: 'text' },
        { chapter_id: 'unity-basics', title: 'Unity Basics', content_type: 'text' }
      ],
      'module-3-nvidia-isaac': [
        { chapter_id: 'isaac-intro', title: 'NVIDIA Isaac Introduction', content_type: 'text' },
        { chapter_id: 'isaac-navigation', title: 'Navigation with Isaac', content_type: 'text' }
      ],
      'module-4-vla': [
        { chapter_id: 'vla-intro', title: 'VLA Models Introduction', content_type: 'text' },
        { chapter_id: 'vla-applications', title: 'VLA Applications', content_type: 'text' }
      ]
    };

    return mockChapters[moduleId] || [
      { chapter_id: `${moduleId}-chapter-1`, title: 'Chapter 1', content_type: 'text' },
      { chapter_id: `${moduleId}-chapter-2`, title: 'Chapter 2', content_type: 'text' }
    ];
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
  // For now, we'll return meaningful mock content
  try {
    // This would typically be a call to get the actual content
    // For example: return (await api.getChapterContent(moduleId, chapterId)).data.content;
    const mockContent: Record<string, string> = {
      'welcome-intro': `# Welcome to Physical AI & Humanoid Robotics Textbook

Welcome to an exciting journey into the world of Physical AI and Humanoid Robotics! This interactive textbook will guide you through the fundamental concepts, tools, and applications in this cutting-edge field.

## What You'll Learn

- The fundamentals of Physical AI
- Robot Operating System (ROS 2) concepts
- Simulation environments like Gazebo and Unity
- NVIDIA Isaac robotics platform
- Vision-Language-Action (VLA) models

## How to Use This Textbook

This textbook features interactive elements, including:
- Navigation between modules and chapters
- Progress tracking
- An AI-powered chatbot to answer your questions
- Hands-on exercises and examples

Let's begin exploring the fascinating world of Physical AI and robotics!`,
      'intro-ai': `# Introduction to AI

Artificial Intelligence (AI) is a branch of computer science that aims to create software or machines that exhibit human-like intelligence. This can include learning from experience, understanding natural language, solving problems, and recognizing patterns.

## Key Concepts

- **Machine Learning**: Algorithms that allow computers to learn from and make predictions based on data
- **Deep Learning**: A subset of machine learning using neural networks with multiple layers
- **Natural Language Processing**: Technology that enables computers to understand and respond to human language
- **Computer Vision**: The ability for computers to interpret and understand visual information

## Applications in Robotics

AI plays a crucial role in robotics, enabling robots to:
- Perceive their environment
- Make decisions based on sensor data
- Learn from interactions
- Adapt to new situations`,
      'ros2-intro': `# ROS 2 Introduction

ROS 2 (Robot Operating System 2) is flexible framework for writing robot software. It's a collection of tools, libraries, and conventions that aim to simplify the task of creating complex and robust robot behavior across a wide variety of robot platforms.

## Key Features

- **Distributed computing**: Multiple processes can be run on different machines
- **Real-time support**: For time-critical applications
- **Platform support**: Runs on various operating systems
- **Middleware**: Uses DDS (Data Distribution Service) for communication

## Basic Concepts

- **Nodes**: Processes that perform computation
- **Topics**: Named buses over which nodes exchange messages
- **Messages**: Data structures exchanged by nodes
- **Services**: Synchronous request/reply communication
- **Actions**: Asynchronous goal-oriented communication`
    };

    return mockContent[chapterId] || `# ${moduleId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

## Chapter: ${chapterId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

This is the content for ${moduleId}, chapter ${chapterId}. In a full implementation, this would contain detailed educational content, examples, exercises, and interactive elements relevant to the topic.

## Learning Objectives

- Understand the key concepts
- Apply the principles in practical scenarios
- Connect with other topics in the curriculum

## Summary

This chapter covered important concepts related to this topic. Continue to the next chapter to build on these foundations.`;
  } catch (error) {
    console.error(`Error fetching content for module ${moduleId}, chapter ${chapterId}:`, error);
    return `Content for module ${moduleId}, chapter ${chapterId} (error occurred while fetching)`;
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