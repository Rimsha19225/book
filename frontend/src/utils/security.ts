/** Security Utilities for the Physical AI & Humanoid Robotics Textbook application */

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string with potentially harmful content removed
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove potentially harmful tags and attributes
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/<[^>]*style=["'][^"']*expression[^"']*["'][^>]*>/gi, '') // Remove expression in style
    .trim();
};

/**
 * Validates that input is of expected type and format
 * @param input - The input to validate
 * @param type - Expected type ('string', 'number', 'email', etc.)
 * @param options - Additional validation options
 * @returns True if valid, false otherwise
 */
export const validateInput = (input: any, type: 'string' | 'number' | 'email' | 'url' | 'array' | 'object', options?: {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  required?: boolean;
}): boolean => {
  // Check if required and is empty
  if (options?.required && (input === null || input === undefined || input === '')) {
    return false;
  }

  // If not required and is empty, return true (unless explicitly required)
  if (!options?.required && (input === null || input === undefined || input === '')) {
    return true;
  }

  switch (type) {
    case 'string':
      if (typeof input !== 'string') return false;
      if (options?.minLength && input.length < options.minLength) return false;
      if (options?.maxLength && input.length > options.maxLength) return false;
      if (options?.pattern && !options.pattern.test(input)) return false;
      return true;

    case 'number':
      if (typeof input !== 'number' || isNaN(input)) return false;
      return true;

    case 'email':
      if (typeof input !== 'string') return false;
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(input);

    case 'url':
      if (typeof input !== 'string') return false;
      try {
        new URL(input);
        return true;
      } catch {
        return false;
      }

    case 'array':
      return Array.isArray(input);

    case 'object':
      return typeof input === 'object' && input !== null && !Array.isArray(input);

    default:
      return false;
  }
};

/**
 * Escapes HTML special characters to prevent XSS
 * @param str - The string to escape
 * @returns Escaped string
 */
export const escapeHtml = (str: string): string => {
  if (typeof str !== 'string') {
    return '';
  }
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  return str.replace(/[&<>"'\/]/g, (char) => escapeMap[char] || char);
};

/**
 * Generates a cryptographically secure random string
 * @param length - Length of the string to generate
 * @returns Random string
 */
export const generateSecureRandomString = (length: number): string => {
  if (typeof window !== 'undefined' && window.crypto) {
    // Browser environment
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback for Node.js environment
    const crypto = require('crypto');
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }
};

/**
 * Implements a simple rate limiting mechanism
 * @param key - Unique identifier for the rate limit
 * @param limit - Maximum number of requests
 * @param windowMs - Time window in milliseconds
 * @returns True if allowed, false if rate limited
 */
export const checkRateLimit = (key: string, limit: number, windowMs: number): boolean => {
  try {
    const now = Date.now();
    const storageKey = `rate_limit_${key}`;
    const stored = localStorage.getItem(storageKey);

    let requests: number[];
    if (stored) {
      try {
        requests = JSON.parse(stored).filter((timestamp: number) => now - timestamp < windowMs);
      } catch {
        requests = [];
      }
    } else {
      requests = [];
    }

    // Check if limit exceeded
    if (requests.length >= limit) {
      return false;
    }

    // Add current request
    requests.push(now);
    localStorage.setItem(storageKey, JSON.stringify(requests));

    return true;
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // If there's an error, allow the request to proceed
    return true;
  }
};

/**
 * Validates and sanitizes a user message before sending
 * @param message - The message to validate and sanitize
 * @returns Sanitized message if valid, null if invalid
 */
export const validateAndSanitizeMessage = (message: string): string | null => {
  // Check if message is provided
  if (!message || typeof message !== 'string') {
    return null;
  }

  // Trim whitespace
  const trimmedMessage = message.trim();

  // Check length
  if (trimmedMessage.length === 0 || trimmedMessage.length > 1000) { // 1000 character limit
    return null;
  }

  // Sanitize the message
  const sanitizedMessage = sanitizeInput(trimmedMessage);

  return sanitizedMessage;
};

/**
 * Validates and sanitizes selected text context
 * @param context - The context text to validate and sanitize
 * @returns Sanitized context if valid, null if invalid
 */
export const validateAndSanitizeContext = (context: string): string | null => {
  if (!context || typeof context !== 'string') {
    return null;
  }

  const trimmedContext = context.trim();

  // Limit context to 500 characters
  if (trimmedContext.length === 0 || trimmedContext.length > 500) {
    return null;
  }

  // Sanitize the context
  const sanitizedContext = sanitizeInput(trimmedContext);

  return sanitizedContext;
};

/**
 * Clears rate limit data older than the window
 * @param windowMs - Time window in milliseconds
 */
export const cleanupRateLimitData = (windowMs: number): void => {
  try {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('rate_limit_')) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const requests: number[] = JSON.parse(stored);
            // Filter out old requests
            const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);

            if (recentRequests.length === 0) {
              // If no recent requests, mark for removal
              keysToRemove.push(key);
            } else {
              // Otherwise, update with only recent requests
              localStorage.setItem(key, JSON.stringify(recentRequests));
            }
          }
        } catch (error) {
          // If parsing fails, remove the key
          keysToRemove.push(key);
        }
      }
    }

    // Remove expired keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error cleaning up rate limit data:', error);
  }
};

// Initialize security utilities
// Cleanup old rate limit data periodically (every 10 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => {
    cleanupRateLimitData(10 * 60 * 1000); // 10 minutes
  }, 10 * 60 * 1000); // 10 minutes
}