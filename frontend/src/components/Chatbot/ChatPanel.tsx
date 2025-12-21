
/** Chat Panel Component for the Physical AI & Humanoid Robotics Textbook application */
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessageData, startChatSession, sendMessage, getChatHistory } from '../../services/chatService';
import { loadSession, getStoredSessions, getCurrentSessionId, setCurrentSessionId, addMessageToSession, syncAnonymousSessionsToUser } from '../../services/sessionManagement';
import Message from './Message';
import LoadingSpinner from '../UI/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../Auth/AuthModal';
import './ChatPanel.css';

interface ChatPanelProps {
  contextModuleId?: string;
  contextChapterId?: string;
  contextSelection?: string;
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  contextModuleId,
  contextChapterId,
  contextSelection,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string>('');
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated } = useAuth();

  // Initialize chat session on component mount
  useEffect(() => {
    initializeChatSession();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Show auth prompt to anonymous users after they've sent a few messages
  useEffect(() => {
    if (!isAuthenticated && messages.length > 3) {
      // Check if the user has sent at least 2 messages
      const userMessages = messages.filter(msg => msg.sender === 'student');
      if (userMessages.length >= 2) {
        setShowAuthPrompt(true);
      }
    }
  }, [messages, isAuthenticated]);

  // Load recent sessions when history menu is shown
  useEffect(() => {
    if (showHistory) {
      const sessions = getStoredSessions();
      // Sort sessions by last active time (most recent first)
      const sortedSessions = sessions.sort((a, b) =>
        new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
      );
      setRecentSessions(sortedSessions);
    }
  }, [showHistory]);

  const handleAuthSuccess = async () => {
    // Sync anonymous sessions to the authenticated user
    if (user) {
      await syncAnonymousSessionsToUser(user.user_id);
    }
    setShowAuthModal(false);
    setShowAuthPrompt(false);
  };

  const handleOpenAuthModal = () => {
    setShowAuthModal(true);
    setShowAuthPrompt(false);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const openChatWithSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setShowHistory(false);
    // Reload the session by reinitializing
    initializeChatSession();
  };

  const startNewSession = () => {
    // Clear the current session to start fresh
    localStorage.removeItem('current-chat-session-id');
    setShowHistory(false);
    // Start a new session by reinitializing
    initializeChatSession();
  };

  const initializeChatSession = async () => {
    try {
      setIsLoading(true);

      // Check if there's a current session ID in local storage
      const currentSessionId = getCurrentSessionId();

      if (currentSessionId) {
        // Load existing session
        const existingSession = loadSession(currentSessionId);
        if (existingSession) {
          // Convert stored session messages to ChatMessageData format
          const sessionMessages: ChatMessageData[] = existingSession.messages.map(msg => ({
            id: msg.id,
            sender: msg.sender,
            content: msg.content,
            timestamp: msg.timestamp,
            context: msg.context
          }));

          setMessages(sessionMessages);
          setSessionId(currentSessionId);
          setIsInitializing(false);
          setIsLoading(false);
          return;
        }
      }

      // Start a new session if no existing session found
      const session = await startChatSession(undefined, contextChapterId);
      setSessionId(session.chat_session_id);

      // Add welcome message
      const welcomeMessage: ChatMessageData = {
        id: 'welcome-' + Date.now(),
        sender: 'ai',
        content: session.welcome_message,
        timestamp: new Date()
      };

      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing chat session:', error);
      const errorMessage: ChatMessageData = {
        id: 'error-' + Date.now(),
        sender: 'ai',
        content: 'Sorry, I\'m having trouble connecting. Please try again later.',
        timestamp: new Date()
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
      setIsInitializing(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Add user message to the chat
    const userMessage: ChatMessageData = {
      id: 'user-' + Date.now(),
      sender: 'student',
      content: inputValue,
      timestamp: new Date(),
      context: contextSelection
    };

    setMessages(prev => [...prev, userMessage]);

    // Save the user message to session storage
    if (sessionId) {
      const messageForStorage = {
        id: userMessage.id,
        sender: userMessage.sender,
        content: userMessage.content,
        timestamp: userMessage.timestamp,
        context: userMessage.context
      };
      addMessageToSession(sessionId, messageForStorage);
    }

    setInputValue('');
    setIsLoading(true);
    setStreamingMessage('');

    try {
      // In a real implementation, we would use a streaming API
      // For now, we'll simulate streaming by gradually adding characters
      const response = await sendMessage(
        sessionId,
        inputValue,
        contextSelection || undefined
      );

      // Simulate streaming by gradually adding the response
      const fullResponse = response.response;
      let currentResponse = '';

      // Split the response into words for streaming effect
      const words = fullResponse.split(' ');

      for (let i = 0; i < words.length; i++) {
        currentResponse += (i > 0 ? ' ' : '') + words[i];
        setStreamingMessage(currentResponse);
        await new Promise(resolve => setTimeout(resolve, 30)); // 30ms delay for each word
      }

      // Add final AI response to the chat
      const aiMessage: ChatMessageData = {
        id: response.message_id + '-final',
        sender: 'ai',
        content: fullResponse,
        timestamp: new Date(response.timestamp),
        context: response.context_used
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save the AI message to session storage
      if (sessionId) {
        const messageForStorage = {
          id: aiMessage.id,
          sender: aiMessage.sender,
          content: aiMessage.content,
          timestamp: aiMessage.timestamp,
          context: aiMessage.context
        };
        addMessageToSession(sessionId, messageForStorage);
      }

      setStreamingMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessageData = {
        id: 'error-' + Date.now(),
        sender: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Touch-friendly send button handler
  const handleSendTouch = () => {
    handleSendMessage();
  };

  // Enhanced input for mobile
  const handleInputTouch = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Auto-resize textarea based on content
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
  };

  // Show initial loading state
  if (isInitializing) {
    return (
      <div className="chat-panel">
        <div className="chat-header">
          <div className="chat-title">AI Textbook Assistant</div>
          <div className="chat-header-actions">
            <button
              className="chat-history-button"
              onClick={toggleHistory}
              aria-label="Show chat history"
            >
              📋
            </button>
            <button
              className="chat-close-button"
              onClick={onClose}
              aria-label="Close chat"
              onTouchEnd={onClose} // Touch-friendly event
            >
              ×
            </button>
          </div>
          {/* History dropdown */}
          {showHistory && (
            <div className="chat-history-dropdown">
              <div className="chat-history-header">
                <h3>Chat History</h3>
              </div>
              <div className="chat-history-list">
                {recentSessions.length > 0 ? (
                  recentSessions.map((session) => {
                    // Format the last active date
                    const lastActiveDate = new Date(session.lastActive);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - lastActiveDate.getTime());
                    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                    let timeLabel = '';
                    if (diffDays > 0) {
                      timeLabel = `${diffDays}d ago`;
                    } else if (diffHours > 0) {
                      timeLabel = `${diffHours}h ago`;
                    } else {
                      timeLabel = 'Just now';
                    }

                    // Get the first few words of the first message as a preview
                    const preview = session.messages.length > 0
                      ? session.messages[0].content.substring(0, 50) + (session.messages[0].content.length > 50 ? '...' : '')
                      : 'New conversation';

                    return (
                      <div
                        key={session.sessionId}
                        className="history-item"
                        onClick={() => openChatWithSession(session.sessionId)}
                      >
                        <div className="history-preview">
                          <div className="history-title">Chat: {timeLabel}</div>
                          <div className="history-content">{preview}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="no-history-message">
                    No previous conversations
                  </div>
                )}
              </div>
              <div className="chat-history-actions">
                <button
                  className="new-chat-button"
                  onClick={startNewSession}
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="chat-initializing">
          <LoadingSpinner size="medium" message="Starting chat session..." />
        </div>
      </div>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-title">AI Textbook Assistant</div>
        <div className="chat-header-actions">
          <button
            className="chat-history-button"
            onClick={toggleHistory}
            aria-label="Show chat history"
          >
            📋
          </button>
          <button
            className="chat-close-button"
            onClick={onClose}
            aria-label="Close chat"
            onTouchEnd={onClose} // Touch-friendly event
          >
            ×
          </button>
        </div>
        {/* History dropdown */}
        {showHistory && (
          <div className="chat-history-dropdown">
            <div className="chat-history-header">
              <h3>Chat History</h3>
            </div>
            <div className="chat-history-list">
              {recentSessions.length > 0 ? (
                recentSessions.map((session) => {
                  // Format the last active date
                  const lastActiveDate = new Date(session.lastActive);
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - lastActiveDate.getTime());
                  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                  let timeLabel = '';
                  if (diffDays > 0) {
                    timeLabel = `${diffDays}d ago`;
                  } else if (diffHours > 0) {
                    timeLabel = `${diffHours}h ago`;
                  } else {
                    timeLabel = 'Just now';
                  }

                  // Get the first few words of the first message as a preview
                  const preview = session.messages.length > 0
                    ? session.messages[0].content.substring(0, 50) + (session.messages[0].content.length > 50 ? '...' : '')
                    : 'New conversation';

                  return (
                    <div
                      key={session.sessionId}
                      className="history-item"
                      onClick={() => openChatWithSession(session.sessionId)}
                    >
                      <div className="history-preview">
                        <div className="history-title">Chat: {timeLabel}</div>
                        <div className="history-content">{preview}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-history-message">
                  No previous conversations
                </div>
              )}
            </div>
            <div className="chat-history-actions">
              <button
                className="new-chat-button"
                onClick={startNewSession}
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <Message
            key={message.id}
            sender={message.sender}
            content={message.content}
            timestamp={message.timestamp}
            context={message.context}
          />
        ))}
        {streamingMessage && (
          <div className="message ai">
            <div className="message-content">
              <div className="message-text">
                {streamingMessage}
                <span className="streaming-cursor">|</span>
              </div>
            </div>
          </div>
        )}
        {isLoading && !streamingMessage && (
          <div className="message ai">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        {/* Auth prompt for anonymous users */}
        {showAuthPrompt && !isAuthenticated && (
          <div className="auth-prompt-message">
            <div className="auth-prompt-content">
              <p>Continue your learning journey! Sign up to save your chat history and access it from any device.</p>
              <button
                className="auth-prompt-button"
                onClick={handleOpenAuthModal}
              >
                Sign Up
              </button>
              <button
                className="auth-prompt-dismiss"
                onClick={() => setShowAuthPrompt(false)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          className="chat-input"
          value={inputValue}
          onChange={handleInputTouch}
          onKeyPress={handleKeyPress}
          placeholder="Ask about this book."
          disabled={isLoading}
          rows={2}
          onTouchEnd={(e) => e.currentTarget.focus()} // Ensure focus on touch devices
        />
        <button
          className="chat-send-button"
          onClick={handleSendTouch}
          onTouchEnd={handleSendTouch} // Touch-friendly event
          disabled={!inputValue.trim() || isLoading}
          aria-label="Send message"
        >
          Send
        </button>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default ChatPanel;