import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  isLoginView?: boolean;
  onSwitchView?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, isLoginView: propIsLoginView, onSwitchView }) => {
  const [isLoginView, setIsLoginViewInternal] = useState(true);

  // Use prop if provided, otherwise use internal state
  const currentIsLoginView = propIsLoginView !== undefined ? propIsLoginView : isLoginView;

  const toggleView = () => {
    if (onSwitchView) {
      onSwitchView();
    } else {
      setIsLoginViewInternal(prev => !prev);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        {currentIsLoginView ? (
          <LoginForm
            onSwitchToSignup={toggleView}
            onLoginSuccess={() => {
              onAuthSuccess();
              onClose();
            }}
          />
        ) : (
          <SignupForm
            onSwitchToLogin={toggleView}
            onSignupSuccess={() => {
              onAuthSuccess();
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;