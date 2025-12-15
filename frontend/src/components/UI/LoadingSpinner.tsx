/** Loading Spinner Component for the Physical AI & Humanoid Robotics Textbook application */
import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...',
  fullScreen = false,
  className = ''
}) => {
  const spinnerClass = `loading-spinner ${size} ${fullScreen ? 'full-screen' : ''} ${className}`;

  return (
    <div className={spinnerClass}>
      <div className="spinner"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;