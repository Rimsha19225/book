/** Custom DocContent component for the Physical AI & Humanoid Robotics Textbook application */
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '@docusaurus/router';
import OriginalDocContent from '@theme/DocPage/Content';
import { useSafeLearningPath } from '../../hooks/useSafeLearningPath';
import TranslateToUrduButton from '../../components/Textbook/TranslateToUrduButton';
import type { Props } from '@theme/DocPage/Content';

// This component wraps the default DocContent to add translation functionality
const DocContent = (props: Props): JSX.Element => {
  const location = useLocation();
  const learningPathContext = useSafeLearningPath();

  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslated, setIsTranslated] = useState<boolean>(false);
  const [originalContent, setOriginalContent] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Extract module and chapter info from URL
  const pathParts = location.pathname.split('/').filter(part => part);
  const isDocPage = pathParts.includes('docs');

  // Extract module and chapter IDs from the path
  let moduleId: string | undefined;
  let chapterId: string | undefined;

  if (isDocPage && pathParts.length >= 3) {
    // URL structure: /book/docs/{module}/{chapter}
    const docsIndex = pathParts.indexOf('docs');
    if (docsIndex >= 0 && docsIndex + 1 < pathParts.length) {
      moduleId = pathParts[docsIndex + 1];
      if (docsIndex + 2 < pathParts.length) {
        chapterId = pathParts[docsIndex + 2];
      }
    }
  }

  // Extract content when component mounts
  useEffect(() => {
    if (isDocPage) {
      // Extract content from the document after it renders
      const extractContent = () => {
        const contentElement = document.querySelector('main .markdown');
        if (contentElement) {
          setOriginalContent(contentElement.textContent || contentElement.innerHTML || '');
        }
      };

      // Try to extract content immediately
      extractContent();

      // Also try after a brief delay to ensure content is loaded
      const timer = setTimeout(extractContent, 100);

      return () => clearTimeout(timer);
    }
  }, [isDocPage, location.pathname]);

  // Handle content updates from translation button
  const handleContentUpdate = (content: string, translated: boolean) => {
    setTranslatedContent(content);
    setIsTranslated(translated);
  };

  // Check if this is a documentation page that should have the translation button
  if (isDocPage && learningPathContext && learningPathContext.learningPath) {
    return (
      <div className="textbook-doc-wrapper">
        <TranslateToUrduButton
          content={originalContent}
          moduleId={moduleId}
          chapterId={chapterId}
          onTranslate={handleContentUpdate}
          originalContent={originalContent}
        />
        <div className="translated-content-wrapper">
          {isTranslated && translatedContent ? (
            <div
              className="markdown translated-content"
              dangerouslySetInnerHTML={{ __html: translatedContent }}
            />
          ) : (
            <div ref={contentRef}>
              <OriginalDocContent {...props} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // For non-doc pages or when context is not available, return the original content
  return <OriginalDocContent {...props} />;
};

export default DocContent;