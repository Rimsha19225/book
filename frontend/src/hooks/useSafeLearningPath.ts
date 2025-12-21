import { useContext } from 'react';
import { LearningPathContextType } from '../contexts/LearningPathContext';
import { LearningPathContext } from '../contexts/LearningPathContext';

// Custom hook that safely accesses the LearningPathContext
export const useSafeLearningPath = (): LearningPathContextType | null => {
  try {
    const context = useContext(LearningPathContext);
    if (!context) {
      return null;
    }
    return context;
  } catch (error) {
    // Return null when context is not available
    return null;
  }
};