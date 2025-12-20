/** Content Renderer Component for the Physical AI & Humanoid Robotics Textbook application */
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS for math rendering
import { useSafeLearningPath } from '../../hooks/useSafeLearningPath';
import ProgressIndicator from './ProgressIndicator';
import LoadingSpinner from '../UI/LoadingSpinner';
import TranslateToUrduButton from './TranslateToUrduButton';
import './ContentRenderer.css'; // Import component-specific styles

interface ContentRendererProps {
  content: string;
  moduleId?: string;
  chapterId?: string;
  onTextSelect?: (selectedText: string) => void;
  loading?: boolean;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  moduleId,
  chapterId,
  onTextSelect,
  loading = false
}) => {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const learningPathContext = useSafeLearningPath();
  const updateChapterStatus = learningPathContext?.updateChapterStatus || (() => {});
  const getChapter = learningPathContext?.getChapter || (() => undefined);

  // Handle text selection - enhanced for mobile
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim() !== '') {
        const text = selection.toString();
        setSelectedText(text);
        if (onTextSelect) {
          onTextSelect(text);
        }
      } else {
        setSelectedText(null);
      }
    };

    // Add both mouse and touch event listeners for better mobile support
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
    };
  }, [onTextSelect]);

  // Mark chapter as started when content is loaded
  useEffect(() => {
    if (moduleId && chapterId) {
      // Mark chapter as in-progress
      // We could add logic here to track when a user starts reading a chapter
    }
  }, [moduleId, chapterId]);

  // Process the content for any special textbook features
  const processContent = (content: string): string => {
    // Add any preprocessing of the content here if needed
    // For example, replacing special textbook syntax with React components
    return content;
  };

  // Check if the current chapter is completed
  const currentChapter = moduleId && chapterId ? getChapter(moduleId, chapterId) : undefined;
  const isCompleted = currentChapter?.completed || false;

  // Handle translation
  const handleTranslation = (translated: string, isTranslated: boolean) => {
    setTranslatedContent(translated);
  };

  // Custom components for ReactMarkdown
  const renderers = {
    // Override default heading behavior if needed
    h1: (props: any) => <h1 className="textbook-h1" {...props} />,
    h2: (props: any) => <h2 className="textbook-h2" {...props} />,
    h3: (props: any) => <h3 className="textbook-h3" {...props} />,
    p: (props: any) => <p className="textbook-paragraph" {...props} />,
    code: (props: any) => <code className="textbook-code" {...props} />,
    pre: (props: any) => <pre className="textbook-pre" {...props} />,
    li: (props: any) => <li className="textbook-list-item" {...props} />,
  };

  if (loading) {
    return (
      <div className="content-renderer">
        <div className="content-header">
          <div className="progress-indicator-small">
            <ProgressIndicator size="small" showPercentage={true} showModules={false} />
          </div>
        </div>
        <div className="content-loading">
          <LoadingSpinner size="medium" message="Loading chapter content..." />
        </div>
      </div>
    );
  }

  return (
    <div className="content-renderer">
      <div className="content-header">
        <div className="progress-indicator-small">
          <ProgressIndicator size="small" showPercentage={true} showModules={false} />
        </div>
        {isCompleted && (
          <div className="chapter-completed-badge">
            ✓ Completed
          </div>
        )}
      </div>

      <div className="content-area"
           style={{ userSelect: 'text' }} // Ensure text selection works properly
      >
        <TranslateToUrduButton
          content={content}
          moduleId={moduleId}
          chapterId={chapterId}
          onTranslate={handleTranslation}
          originalContent={content}
        />

        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={renderers}
        >
          {processContent(translatedContent || content)}
        </ReactMarkdown>
      </div>

      {selectedText && (
        <div className="selection-indicator">
          Selected: "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
        </div>
      )}
    </div>
  );
};

export default ContentRenderer;