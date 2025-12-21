/** Chat Service for the Physical AI & Humanoid Robotics Textbook application */
import { chatService as api } from './apiClient';

export interface ChatSession {
  chat_session_id: string;
  created_at: string;
  welcome_message: string;
}

export interface ChatMessage {
  message_id: string;
  response: string;
  timestamp: string;
  context_used?: string;
}

export interface ChatHistory {
  messages: Array<{
    message_id: string;
    sender_type: 'student' | 'ai';
    message_content: string;
    timestamp: string;
  }>;
}

/**
 * Start a new chat session
 * @param studentId - Optional student ID (will be overridden by authenticated user if available)
 * @param contextChapter - Optional context chapter
 * @returns Promise containing the new chat session
 */
export const startChatSession = async (
  studentId?: string,
  contextChapter?: string
): Promise<ChatSession> => {
  try {
    // If user is authenticated, use their ID instead of the provided studentId
    const token = localStorage.getItem('access_token');
    if (token) {
      // For authenticated users, we'll let the backend determine the user ID from the token
      // so we don't pass studentId explicitly
      const response = await api.startChat(undefined, contextChapter);
      return response.data as ChatSession;
    } else {
      // For anonymous users, use the provided studentId or undefined
      const response = await api.startChat(studentId, contextChapter);
      return response.data as ChatSession;
    }
  } catch (error) {
    console.error('Error starting chat session:', error);
    throw error;
  }
};

/**
 * Send a message to the chatbot
 * @param chatSessionId - The chat session ID
 * @param message - The message to send
 * @param contextSelection - Optional selected text context
 * @returns Promise containing the chatbot response
 */
export const sendMessage = async (
  chatSessionId: string,
  message: string,
  contextSelection?: string
): Promise<ChatMessage> => {
  try {
    const response = await api.sendMessage(chatSessionId, message, contextSelection);
    return response.data as ChatMessage;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get chat history for a session
 * @param chatSessionId - The chat session ID
 * @returns Promise containing the chat history
 */
export const getChatHistory = async (chatSessionId: string): Promise<ChatHistory> => {
  try {
    const response = await api.getHistory(chatSessionId);
    return response.data as ChatHistory;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
};

// Types for chat messages
export type SenderType = 'student' | 'ai';

export interface ChatMessageData {
  id: string;
  sender: SenderType;
  content: string;
  timestamp: Date;
  context?: string;
}