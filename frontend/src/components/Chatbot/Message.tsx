/** Message Component for the Physical AI & Humanoid Robotics Textbook application */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS for math rendering
import './Message.css';

interface MessageProps {
  sender: 'student' | 'ai';
  content: string;
  timestamp: Date | string;
  context?: string;
}

const Message: React.FC<MessageProps> = ({ sender, content, timestamp, context }) => {
  // Format the timestamp
  const formatTime = (date: Date | string): string => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message ${sender}`}>
      <div className="message-content">
        {context && (
          <div className="message-context">
            <small>Context: "{context.substring(0, 50)}{context.length > 50 ? '...' : ''}"</small>
          </div>
        )}
        <div className="message-text">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {content}
          </ReactMarkdown>
        </div>
        <div className="message-timestamp">
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default Message;