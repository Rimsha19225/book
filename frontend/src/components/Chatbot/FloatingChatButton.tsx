/** Floating Chat Button Component for the Physical AI & Humanoid Robotics Textbook application */
import React, { useState } from 'react';
import ChatPanel from './ChatPanel';
import './FloatingChatButton.css';

interface FloatingChatButtonProps {
  contextModuleId?: string;
  contextChapterId?: string;
  contextSelection?: string;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  contextModuleId,
  contextChapterId,
  contextSelection
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasOpened, setHasOpened] = useState<boolean>(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!hasOpened) {
      setHasOpened(true);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          className="floating-chat-button"
          onClick={toggleChat}
          aria-label="Open chat assistant"
        >
          <span className="chat-icon">💬</span>
        </button>
      )}

      {isOpen && (
        <ChatPanel
          contextModuleId={contextModuleId}
          contextChapterId={contextChapterId}
          contextSelection={contextSelection}
          onClose={toggleChat}
        />
      )}
    </>
  );
};

export default FloatingChatButton;