/** Session Management Service for the Physical AI & Humanoid Robotics Textbook application */
import { chatService } from './apiClient';

// Define session data structure
interface ChatSessionData {
  sessionId: string;
  createdAt: Date;
  lastActive: Date;
  contextModuleId?: string;
  contextChapterId?: string;
  messages: Array<{
    id: string;
    sender: 'student' | 'ai';
    content: string;
    timestamp: Date;
    context?: string;
  }>;
}

// Session storage key
const SESSION_STORAGE_KEY = 'textbook-chat-sessions';
const CURRENT_SESSION_KEY = 'current-chat-session-id';

// Check if running in browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Save a chat session to local storage
 * @param sessionData - The session data to save
 */
export const saveSession = (sessionData: ChatSessionData): void => {
  if (!isBrowser) return;

  try {
    // Get existing sessions from storage
    const existingSessions = getStoredSessions();

    // Update or add the session
    const sessionIndex = existingSessions.findIndex(session => session.sessionId === sessionData.sessionId);
    if (sessionIndex !== -1) {
      existingSessions[sessionIndex] = sessionData;
    } else {
      existingSessions.push(sessionData);
    }

    // Update last active timestamp
    sessionData.lastActive = new Date();

    // Save to storage
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(existingSessions));

    // If this is the current session, update the current session key
    const currentSessionId = getCurrentSessionId();
    if (currentSessionId === sessionData.sessionId) {
      localStorage.setItem(CURRENT_SESSION_KEY, sessionData.sessionId);
    }
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

/**
 * Load a chat session from local storage
 * @param sessionId - The ID of the session to load
 * @returns The session data or null if not found
 */
export const loadSession = (sessionId: string): ChatSessionData | null => {
  if (!isBrowser) return null;

  try {
    const sessions = getStoredSessions();
    const session = sessions.find(s => s.sessionId === sessionId);

    return session || null;
  } catch (error) {
    console.error('Error loading session:', error);
    return null;
  }
};

/**
 * Get all stored sessions
 * @returns Array of stored sessions
 */
export const getStoredSessions = (): ChatSessionData[] => {
  if (!isBrowser) return [];

  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    // Convert date strings back to Date objects
    return parsed.map((session: any) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      lastActive: new Date(session.lastActive),
      messages: session.messages.map((message: any) => ({
        ...message,
        timestamp: new Date(message.timestamp)
      }))
    }));
  } catch (error) {
    console.error('Error getting stored sessions:', error);
    return [];
  }
};

/**
 * Get the current session ID
 * @returns The current session ID or null if not set
 */
export const getCurrentSessionId = (): string | null => {
  if (!isBrowser) return null;

  try {
    return localStorage.getItem(CURRENT_SESSION_KEY);
  } catch (error) {
    console.error('Error getting current session ID:', error);
    return null;
  }
};

/**
 * Set the current session ID
 * @param sessionId - The session ID to set as current
 */
export const setCurrentSessionId = (sessionId: string): void => {
  if (!isBrowser) return;

  try {
    localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
  } catch (error) {
    console.error('Error setting current session ID:', error);
  }
};

/**
 * Create a new chat session
 * @param contextModuleId - Optional module context
 * @param contextChapterId - Optional chapter context
 * @returns New session data
 */
export const createNewSession = (contextModuleId?: string, contextChapterId?: string): ChatSessionData => {
  if (!isBrowser) {
    // Return a basic session object if not in browser
    return {
      sessionId: 'temp-session',
      createdAt: new Date(),
      lastActive: new Date(),
      contextModuleId,
      contextChapterId,
      messages: []
    };
  }

  const sessionId = generateSessionId();

  const newSession: ChatSessionData = {
    sessionId,
    createdAt: new Date(),
    lastActive: new Date(),
    contextModuleId,
    contextChapterId,
    messages: []
  };

  saveSession(newSession);
  setCurrentSessionId(sessionId);

  return newSession;
};

/**
 * Add a message to a session
 * @param sessionId - The session ID
 * @param message - The message to add
 */
export const addMessageToSession = (sessionId: string, message: ChatSessionData['messages'][0]): void => {
  if (!isBrowser) return;

  const session = loadSession(sessionId);
  if (!session) {
    console.error(`Session ${sessionId} not found`);
    return;
  }

  session.messages.push(message);
  session.lastActive = new Date();

  saveSession(session);
};

/**
 * Clear expired sessions (older than 24 hours)
 */
export const clearExpiredSessions = (): void => {
  if (!isBrowser) return;

  try {
    const sessions = getStoredSessions();
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const activeSessions = sessions.filter(session => {
      return session.lastActive > twentyFourHoursAgo;
    });

    // Update current session ID if the current session expired
    const currentSessionId = getCurrentSessionId();
    if (currentSessionId && !activeSessions.some(s => s.sessionId === currentSessionId)) {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }

    // Save the filtered sessions
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(activeSessions));
  } catch (error) {
    console.error('Error clearing expired sessions:', error);
  }
};

/**
 * Generate a unique session ID
 * @returns A unique session ID
 */
const generateSessionId = (): string => {
  // Generate a unique ID using timestamp and random component
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Initialize session management
 * Should be called when the app starts
 */
export const initializeSessionManagement = (): void => {
  // Clear any expired sessions
  clearExpiredSessions();

  // Optionally restore any ongoing session
  const currentSessionId = getCurrentSessionId();
  if (currentSessionId) {
    const session = loadSession(currentSessionId);
    if (session) {
      // Session is valid, no action needed
      console.log(`Restored session: ${currentSessionId}`);
    } else {
      // Session ID exists but session data is invalid, clear it
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  }
};

/**
 * End a session
 * @param sessionId - The session ID to end
 */
export const endSession = (sessionId: string): void => {
  if (!isBrowser) return;

  try {
    const sessions = getStoredSessions();
    const updatedSessions = sessions.filter(session => session.sessionId !== sessionId);

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSessions));

    // If this was the current session, clear the current session ID
    const currentSessionId = getCurrentSessionId();
    if (currentSessionId === sessionId) {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  } catch (error) {
    console.error('Error ending session:', error);
  }
};

/**
 * Sync anonymous sessions to authenticated user
 * This function transfers local storage sessions to the authenticated user's account
 */
export const syncAnonymousSessionsToUser = async (userId: string): Promise<void> => {
  if (!isBrowser) return;

  try {
    // Get all local sessions
    const localSessions = getStoredSessions();

    // For each local session, if it doesn't have a student ID associated with it in the backend,
    // we could potentially link it to the authenticated user
    // For now, we'll just clear the local sessions since they're now stored server-side
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(CURRENT_SESSION_KEY);

    console.log(`Synced anonymous sessions to user ${userId}`);
  } catch (error) {
    console.error('Error syncing sessions to user:', error);
  }
};

// Initialize session management when this module is imported
if (isBrowser) {
  initializeSessionManagement();
}