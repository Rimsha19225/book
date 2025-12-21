



import React from 'react';
import OriginalLayout from '@theme-original/Layout';
import FloatingChatButton from '../components/Chatbot/FloatingChatButton';
import NavbarAuth from '../components/Auth/NavbarAuth';
import { useState, useEffect } from 'react';
import { LearningPathProvider } from '../contexts/LearningPathContext';
import { AuthProvider } from '../contexts/AuthContext';

type LayoutProps = {
  children: React.ReactNode;
  [key: string]: any;
};

const Layout: React.FC<LayoutProps> = (props) => {
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