import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import FloatingChatButton from '../components/Chatbot/FloatingChatButton';
import { LearningPathProvider } from '../contexts/LearningPathContext';
import { AuthProvider } from '../contexts/AuthContext';

type LayoutProps = {
  children: React.ReactNode;
  [key: string]: any;
};

const LayoutWrapper: React.FC<LayoutProps> = (props) => {
  // Extract potential context parameters from props or URL
  const contextModuleId = null; // Could be extracted from URL if needed
  const contextChapterId = null; // Could be extracted from URL if needed
  const [selectedText, setSelectedText] = React.useState<string | null>(null);

  // Add text selection event listener
  React.useEffect(() => {
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
    <AuthProvider>
      <LearningPathProvider>
        <OriginalLayout {...props}>
          {props.children}
        </OriginalLayout>
        {/* FloatingChatButton will now appear on all Docusaurus pages */}
        <FloatingChatButton
          contextModuleId={contextModuleId}
          contextChapterId={contextChapterId}
          contextSelection={selectedText}
        />
      </LearningPathProvider>
    </AuthProvider>
  );
};

export default LayoutWrapper;