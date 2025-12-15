/** Chat Panel Component for the Physical AI & Humanoid Robotics Textbook application */
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessageData, startChatSession, sendMessage, getChatHistory } from '../../services/chatService';
import Message from './Message';
import LoadingSpinner from '../UI/LoadingSpinner';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat session on component mount
  useEffect(() => {
    initializeChatSession();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const initializeChatSession = async () => {
    try {
      setIsLoading(true);
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
          <button
            className="chat-close-button"
            onClick={onClose}
            aria-label="Close chat"
            onTouchEnd={onClose} // Touch-friendly event
          >
            ×
          </button>
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
        <button
          className="chat-close-button"
          onClick={onClose}
          aria-label="Close chat"
          onTouchEnd={onClose} // Touch-friendly event
        >
          ×
        </button>
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
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          className="chat-input"
          value={inputValue}
          onChange={handleInputTouch}
          onKeyPress={handleKeyPress}
          placeholder="Ask about this chapter..."
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
    </div>
  );
};

export default ChatPanel;