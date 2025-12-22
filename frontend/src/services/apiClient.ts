/** API Client Service for the Physical AI & Humanoid Robotics Textbook application */
import axios from 'axios';

// Base API URL - configurable via environment variables or global config
// For Docusaurus deployment, we check multiple sources for the API URL
const getApiBaseUrl = () => {
  // First, try environment variable (for build-time configuration)
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  // Second, try a global variable that can be set in HTML template (for runtime configuration)
  if (typeof window !== 'undefined' && (window as any).API_BASE_URL) {
    return (window as any).API_BASE_URL;
  }

  // Third, try to determine from the current location for common deployment patterns
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If on GitHub Pages domain, use the Hugging Face backend
    if (hostname.includes('github.io')) {
      return 'https://rimsha19225-physicalchatbot.hf.space/api';
    }
  }

  // Default fallback for local development
  return 'http://127.0.0.1:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication tokens if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors like 401, 500, etc.
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access - please log in');
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error occurred');
    }
    return Promise.reject(error);
  }
);

// Export the API client instance
export default apiClient;

// Define API service functions
export const contentService = {
  // Get all modules
  getModules: () => apiClient.get('/content/modules'),

  // Get chapters for a specific module
  getChapters: (moduleId: string) => apiClient.get(`/content/modules/${moduleId}/chapters`),

  // Query content-specific information
  queryContent: (moduleId: string, chapterId: string, query: string, selectedText?: string) =>
    apiClient.post(`/content/chapter/${moduleId}/${chapterId}/query`, {
      query,
      selected_text: selectedText
    })
};

export const chatService = {
  // Start a new chat session
  startChat: (studentId?: string, contextChapter?: string) =>
    apiClient.post('/chat/start', {
      student_id: studentId,
      context_chapter: contextChapter
    }),

  // Send a message to the chatbot
  sendMessage: (chatSessionId: string, message: string, contextSelection?: string) =>
    apiClient.post(`/chat/${chatSessionId}/message`, {
      message,
      context_selection: contextSelection
    }),

  // Get chat history
  getHistory: (chatSessionId: string) =>
    apiClient.get(`/chat/${chatSessionId}/history`)
};

// Health check
export const healthCheck = () => apiClient.get('/health');