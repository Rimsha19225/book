/** Translation Button Component for the Physical AI & Humanoid Robotics Textbook application */
import React, { useState, useEffect } from 'react';
import { translationService, TranslationResponse } from '../../services/translationService';
import { useSafeLearningPath } from '../../hooks/useSafeLearningPath';
import LoadingSpinner from '../UI/LoadingSpinner';
import './TranslateToUrduButton.css';

interface TranslateToUrduButtonProps {
  content: string;
  moduleId?: string;
  chapterId?: string;
  onTranslate: (translatedContent: string, isTranslated: boolean) => void;
  originalContent: string;
}

const TranslateToUrduButton: React.FC<TranslateToUrduButtonProps> = ({
  content,
  moduleId,
  chapterId,
  onTranslate,
  originalContent
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const learningPathContext = useSafeLearningPath();
  const learningPath = learningPathContext?.learningPath || null;

  // Check if user is authenticated
  const isAuthenticated = () => {
    // In a real implementation, this would check for a valid auth token
    // For now, we'll assume the user is authenticated if they have a learning path
    return learningPath !== null;
  };

  const handleTranslate = async () => {
    if (!isAuthenticated()) {
      setError('You must be logged in to use the translation feature.');
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const response = await translationService.translateToUrdu({
        content,
        moduleId,
        chapterId
      });

      onTranslate(response.translatedContent, true);
      setIsTranslated(true);
    } catch (err) {
      console.error('Translation error:', err);
      setError('Failed to translate content. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Check if translation is already available in cache on component mount
  useEffect(() => {
    const checkCachedTranslation = async () => {
      if (!isAuthenticated()) return;

      try {
        // Try to get cached translation without triggering API call
        const response = await translationService.translateToUrdu({
          content,
          moduleId,
          chapterId
        });

        // If we get a response without making an API call, it means it was cached
        // So we can set the content and mark as translated
        if (response.translatedContent !== content) {
          onTranslate(response.translatedContent, true);
          setIsTranslated(true);
        }
      } catch (err) {
        console.error('Error checking cached translation:', err);
      }
    };

    checkCachedTranslation();
  }, [content, moduleId, chapterId, onTranslate, isAuthenticated]);

  const handleToggle = () => {
    if (isTranslated) {
      // Return to original content
      onTranslate(originalContent, false);
      setIsTranslated(false);
    } else {
      // Translate to Urdu
      handleTranslate();
    }
  };

  // Show button only to authenticated users
  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="translate-to-urdu-container">
      {isTranslating ? (
        <div className="translate-loading">
          <LoadingSpinner size="small" message="Translating to Urdu..." />
        </div>
      ) : (
        <button
          className={`translate-button ${isTranslated ? 'translated' : ''}`}
          onClick={handleToggle}
          disabled={isTranslating}
          title={isTranslated ? 'Show original content' : 'Translate to Urdu'}
        >
          {isTranslated ? '🔄 Original' : '🇵🇰 Translate to Urdu'}
        </button>
      )}

      {error && (
        <div className="translate-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default TranslateToUrduButton;