/** Progress Indicator Component for the Physical AI & Humanoid Robotics Textbook application */
import React from 'react';
import { useLearningPath } from '../../contexts/LearningPathContext.tsx';
import './ProgressIndicator.css';

interface ProgressIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  showPercentage?: boolean;
  showModules?: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  size = 'medium',
  showPercentage = true,
  showModules = true
}) => {
  const { learningPath, progress, getOverallProgress } = useLearningPath();

  // Calculate progress percentage
  const progressPercentage = progress ? progress.overall_progress : getOverallProgress();
  const completedModules = progress ? progress.completed_modules : 0;
  const totalModules = progress ? progress.total_modules : learningPath?.modules.length || 0;

  // Calculate the degree for the circular progress
  const progressDegree = (progressPercentage / 100) * 360;

  return (
    <div className={`progress-indicator ${size}`}>
      <div className="progress-container">
        {size !== 'small' && (
          <div className="progress-header">
            <h3>Your Learning Progress</h3>
          </div>
        )}

        <div className="progress-visual">
          <div className="circular-progress">
            <svg viewBox="0 0 36 36" className="circular-progress-svg">
              {/* Background circle */}
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e6e6e6"
                strokeWidth="2"
              />
              {/* Progress circle */}
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                strokeDasharray={`${progressPercentage}, 100`}
                transform="rotate(-90 18 18)"
              />
            </svg>
            {showPercentage && (
              <div className="progress-text">
                {Math.round(progressPercentage)}%
              </div>
            )}
          </div>
        </div>

        {showModules && (
          <div className="modules-progress">
            <div className="modules-text">
              {completedModules} of {totalModules} modules completed
            </div>
            <div className="modules-bar">
              <div
                className="modules-fill"
                style={{ width: `${totalModules > 0 ? (completedModules / totalModules) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        )}

        {showPercentage && size !== 'small' && (
          <div className="progress-details">
            <div className="progress-labels">
              <span className="progress-label">Beginner</span>
              <span className="progress-label">Intermediate</span>
              <span className="progress-label">Advanced</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressIndicator;