<<<<<<< HEAD




import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import FloatingChatButton from '../components/Chatbot/FloatingChatButton';
import NavbarAuth from '../components/Auth/NavbarAuth';
import { useState, useEffect } from 'react';
import { LearningPathProvider } from '../contexts/LearningPathContext';
import { AuthProvider } from '../contexts/AuthContext';
=======
import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import FloatingChatButton from '../components/Chatbot/FloatingChatButton';
import { LearningPathProvider } from '../contexts/LearningPathContext';
>>>>>>> a41aa7c0f54b06c462509757a37ea0a4503e9962

type LayoutProps = {
  children: React.ReactNode;
  [key: string]: any;
};

<<<<<<< HEAD
const Layout: React.FC<LayoutProps> = (props) => {
  const [selectedText, setSelectedText] = useState<string | null>(null);

  // Add text selection event listener
  useEffect(() => {
=======
const LayoutWrapper: React.FC<LayoutProps> = (props) => {
  // Extract potential context parameters from props or URL
  const contextModuleId = null; // Could be extracted from URL if needed
  const contextChapterId = null; // Could be extracted from URL if needed
  const [selectedText, setSelectedText] = React.useState<string | null>(null);

  // Add text selection event listener
  React.useEffect(() => {
>>>>>>> a41aa7c0f54b06c462509757a37ea0a4503e9962
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
<<<<<<< HEAD
    <AuthProvider>
      <LearningPathProvider>
        <OriginalLayout {...props}>
          {props.children}
        </OriginalLayout>
        <FloatingChatButton
          contextModuleId={undefined}
          contextChapterId={undefined}
          contextSelection={selectedText || undefined}
        />
      </LearningPathProvider>
    </AuthProvider>
  );
};

export default Layout;
=======
    <LearningPathProvider>
      <OriginalLayout {...props}>
        {props.children}
        {/* FloatingChatButton will now appear on all Docusaurus pages */}
        <FloatingChatButton
          contextModuleId={contextModuleId}
          contextChapterId={contextChapterId}
          contextSelection={selectedText}
        />
      </OriginalLayout>
    </LearningPathProvider>
  );
};

export default LayoutWrapper;
>>>>>>> a41aa7c0f54b06c462509757a37ea0a4503e9962
