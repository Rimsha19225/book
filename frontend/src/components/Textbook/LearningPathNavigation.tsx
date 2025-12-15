/** Learning Path Navigation Component for the Physical AI & Humanoid Robotics Textbook application */
import React from 'react';
import { useLearningPath } from '../../contexts/LearningPathContext.tsx';
import './LearningPathNavigation.css';

interface LearningPathNavigationProps {
  onModuleSelect?: (moduleId: string) => void;
  onChapterSelect?: (moduleId: string, chapterId: string) => void;
  currentModuleId?: string;
  currentChapterId?: string;
}

const LearningPathNavigation: React.FC<LearningPathNavigationProps> = ({
  onModuleSelect,
  onChapterSelect,
  currentModuleId,
  currentChapterId
}) => {
  const { learningPath } = useLearningPath();

  if (!learningPath) {
    return (
      <div className="learning-path-navigation">
        <p>Loading learning path...</p>
      </div>
    );
  }

  const handleModuleClick = (moduleId: string) => {
    if (onModuleSelect) {
      onModuleSelect(moduleId);
    }
  };

  const handleChapterClick = (moduleId: string, chapterId: string) => {
    if (onChapterSelect) {
      onChapterSelect(moduleId, chapterId);
    }
  };

  return (
    <div className="learning-path-navigation">
      <h3 className="navigation-title">Learning Path</h3>

      <div className="path-modules">
        {learningPath.modules.map((module) => (
          <div
            key={module.module_id}
            className={`module-path-item ${module.module_id === currentModuleId ? 'current-module' : ''} ${module.completed ? 'completed-module' : ''}`}
          >
            <div
              className="module-header"
              onClick={() => handleModuleClick(module.module_id)}
            >
              <div className="module-progress-indicator">
                {module.completed ? (
                  <span className="completed-icon">✓</span>
                ) : (
                  <span className="pending-icon">○</span>
                )}
              </div>
              <div className="module-info">
                <h4 className="module-title">{module.title}</h4>
                <p className="module-description">{module.description}</p>
              </div>
              <div className="module-order">Step {module.order_index}</div>
            </div>

            <div className="module-chapters">
              {module.chapters.map((chapter) => (
                <div
                  key={chapter.chapter_id}
                  className={`chapter-path-item ${chapter.chapter_id === currentChapterId ? 'current-chapter' : ''} ${chapter.completed ? 'completed-chapter' : ''}`}
                  onClick={() => handleChapterClick(module.module_id, chapter.chapter_id)}
                >
                  <div className="chapter-progress-indicator">
                    {chapter.completed ? (
                      <span className="completed-icon">✓</span>
                    ) : chapter.chapter_id === currentChapterId ? (
                      <span className="current-icon">→</span>
                    ) : (
                      <span className="pending-icon">○</span>
                    )}
                  </div>
                  <div className="chapter-title">{chapter.title}</div>
                  <div className="chapter-type">[{chapter.content_type}]</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningPathNavigation;