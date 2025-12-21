import React, { useState, useEffect } from 'react';
import { LearningPathProvider } from './contexts/LearningPathContext';
import FloatingChatButton from './components/Chatbot/FloatingChatButton';

const RootWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedText, setSelectedText] = useState<string | null>(null);

  // Add text selection event listener
  useEffect(() => {
    const handleGlobalTextSelection = () => {
      const selectedText = window.getSelection()?.toString().trim();
      if (selectedText) {
        setSelectedText(selectedText);
      }
    };

    document.addEventListener('mouseup', handleGlobalTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleGlobalTextSelection);
    };
  }, []);

  return (
    <LearningPathProvider>
      <>
        {children}
        <FloatingChatButton
          contextModuleId={null}
          contextChapterId={null}
          contextSelection={selectedText}
        />
      </>
    </LearningPathProvider>
  );
};

export default RootWrapper;