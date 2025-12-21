import React from 'react';
import { LearningPathProvider } from './contexts/LearningPathContext';

const RootWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LearningPathProvider>
      {children}
    </LearningPathProvider>
  );
};

export default RootWrapper;