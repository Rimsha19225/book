/** API Client Service for the Physical AI & Humanoid Robotics Textbook application */
import axios from 'axios';

// Base API URL - in production, this would be configured via environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

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
    // Add any authentication headers here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
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