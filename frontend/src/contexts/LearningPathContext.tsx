


/** Learning Path Context for the Physical AI & Humanoid Robotics Textbook application */
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Define the types for our learning path data
export interface Chapter {
  chapter_id: string;
  title: string;
  content_type: string;
  completed: boolean;
}

export interface Module {
  module_id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_duration_hours?: number;
  chapters: Chapter[];
  completed: boolean;
}

export interface LearningProgress {
  student_id: string;
  total_sessions: number;
  current_module?: string;
  current_chapter?: string;
  overall_progress: number;
  completed_modules: number;
  total_modules: number;
  completed_chapters: string[];
  time_spent_seconds: number;
}

export interface LearningPathData {
  student_id: string;
  overall_progress: number;
  current_module?: string;
  current_chapter?: string;
  modules: Module[];
}

// Define the actions for our reducer
type LearningPathAction =
  | { type: 'SET_LEARNING_PATH'; payload: LearningPathData }
  | { type: 'SET_PROGRESS'; payload: LearningProgress }
  | { type: 'UPDATE_CHAPTER_STATUS'; module_id: string; chapter_id: string; completed: boolean }
  | { type: 'UPDATE_MODULE_STATUS'; module_id: string; completed: boolean }
  | { type: 'SET_CURRENT_LOCATION'; module_id?: string; chapter_id?: string }
  | { type: 'RESET_PROGRESS' };

// Define the context state type
interface LearningPathState {
  learningPath: LearningPathData | null;
  progress: LearningProgress | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: LearningPathState = {
  learningPath: null,
  progress: null,
  loading: false,
  error: null,
};

// Reducer function
const learningPathReducer = (state: LearningPathState, action: LearningPathAction): LearningPathState => {
  switch (action.type) {
    case 'SET_LEARNING_PATH':
      return {
        ...state,
        learningPath: action.payload,
        loading: false,
        error: null,
      };

    case 'SET_PROGRESS':
      return {
        ...state,
        progress: action.payload,
        loading: false,
        error: null,
      };

    case 'UPDATE_CHAPTER_STATUS': {
      if (!state.learningPath) return state;

      const updatedModules = state.learningPath.modules.map(module => {
        if (module.module_id === action.module_id) {
          const updatedChapters = module.chapters.map(chapter =>
            chapter.chapter_id === action.chapter_id
              ? { ...chapter, completed: action.completed }
              : chapter
          );

          // Check if all chapters in this module are completed
          const allChaptersCompleted = updatedChapters.every(ch => ch.completed);

          return {
            ...module,
            chapters: updatedChapters,
            completed: allChaptersCompleted
          };
        }
        return module;
      });

      return {
        ...state,
        learningPath: {
          ...state.learningPath,
          modules: updatedModules,
        }
      };
    }

    case 'UPDATE_MODULE_STATUS': {
      if (!state.learningPath) return state;

      const updatedModules = state.learningPath.modules.map(module =>
        module.module_id === action.module_id
          ? { ...module, completed: action.completed }
          : module
      );

      return {
        ...state,
        learningPath: {
          ...state.learningPath,
          modules: updatedModules,
        }
      };
    }

    case 'SET_CURRENT_LOCATION': {
      if (!state.learningPath) return state;

      return {
        ...state,
        learningPath: {
          ...state.learningPath,
          current_module: action.module_id,
          current_chapter: action.chapter_id,
        }
      };
    }

    case 'RESET_PROGRESS':
      return initialState;

    default:
      return state;
  }
};

// Create the context
interface LearningPathContextType extends LearningPathState {
  setLearningPath: (path: LearningPathData) => void;
  setProgress: (progress: LearningProgress) => void;
  updateChapterStatus: (moduleId: string, chapterId: string, completed: boolean) => void;
  updateModuleStatus: (moduleId: string, completed: boolean) => void;
  setCurrentLocation: (moduleId?: string, chapterId?: string) => void;
  resetProgress: () => void;
  getChapter: (moduleId: string, chapterId: string) => Chapter | undefined;
  getModule: (moduleId: string) => Module | undefined;
  getOverallProgress: () => number;
}

const LearningPathContext = createContext<LearningPathContextType | undefined>(undefined);

// Provider component
interface LearningPathProviderProps {
  children: ReactNode;
}

export const LearningPathProvider: React.FC<LearningPathProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(learningPathReducer, initialState);

  const setLearningPath = (path: LearningPathData) => {
    dispatch({ type: 'SET_LEARNING_PATH', payload: path });
  };

  const setProgress = (progress: LearningProgress) => {
    dispatch({ type: 'SET_PROGRESS', payload: progress });
  };

  const updateChapterStatus = (moduleId: string, chapterId: string, completed: boolean) => {
    dispatch({
      type: 'UPDATE_CHAPTER_STATUS',
      module_id: moduleId,
      chapter_id: chapterId,
      completed,
    });
  };

  const updateModuleStatus = (moduleId: string, completed: boolean) => {
    dispatch({
      type: 'UPDATE_MODULE_STATUS',
      module_id: moduleId,
      completed,
    });
  };

  const setCurrentLocation = (moduleId?: string, chapterId?: string) => {
    dispatch({
      type: 'SET_CURRENT_LOCATION',
      module_id: moduleId,
      chapter_id: chapterId,
    });
  };

  const resetProgress = () => {
    dispatch({ type: 'RESET_PROGRESS' });
  };

  const getChapter = (moduleId: string, chapterId: string): Chapter | undefined => {
    if (!state.learningPath) return undefined;

    const module = state.learningPath.modules.find(m => m.module_id === moduleId);
    if (!module) return undefined;

    return module.chapters.find(c => c.chapter_id === chapterId);
  };

  const getModule = (moduleId: string): Module | undefined => {
    if (!state.learningPath) return undefined;

    return state.learningPath.modules.find(m => m.module_id === moduleId);
  };

  const getOverallProgress = (): number => {
    if (state.progress) {
      return state.progress.overall_progress;
    }

    if (state.learningPath) {
      // Calculate progress based on completed modules and chapters
      const totalChapters = state.learningPath.modules.reduce(
        (sum, module) => sum + module.chapters.length, 0
      );

      const completedChapters = state.learningPath.modules.reduce(
        (sum, module) => sum + module.chapters.filter(c => c.completed).length, 0
      );

      return totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
    }

    return 0;
  };

  const contextValue: LearningPathContextType = {
    ...state,
    setLearningPath,
    setProgress,
    updateChapterStatus,
    updateModuleStatus,
    setCurrentLocation,
    resetProgress,
    getChapter,
    getModule,
    getOverallProgress,
  };

  return (
    <LearningPathContext.Provider value={contextValue}>
      {children}
    </LearningPathContext.Provider>
  );
};

// Custom hook to use the context
export const useLearningPath = (): LearningPathContextType => {
  const context = useContext(LearningPathContext);
  if (context === undefined) {
    throw new Error('useLearningPath must be used within a LearningPathProvider');
  }
  return context;
};