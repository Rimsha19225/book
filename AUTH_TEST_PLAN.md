# Authentication Flow Test Plan

## Overview
This document outlines the test plan for the authentication functionality implemented in the Physical AI & Humanoid Robotics Textbook application.

## Test Cases

### 1. User Registration
- **Precondition**: User is not logged in
- **Steps**:
  1. Click on "Sign In" button in the navbar
  2. Select "Sign Up" option
  3. Fill in name, email, and password
  4. Submit the form
- **Expected Result**: User is registered successfully and logged in

### 2. User Login
- **Precondition**: User has an account
- **Steps**:
  1. Click on "Sign In" button in the navbar
  2. Enter valid email and password
  3. Submit the form
- **Expected Result**: User is logged in successfully and navbar shows user profile

### 3. Anonymous Chat with Auth Prompt
- **Precondition**: User is not logged in
- **Steps**:
  1. Open the AI Textbook Assistant
  2. Send at least 2 messages
- **Expected Result**: Auth prompt appears suggesting to sign up to save chat history

### 4. Session Sync After Login
- **Precondition**: User had anonymous chat sessions
- **Steps**:
  1. Chat as an anonymous user
  2. Login or register
- **Expected Result**: Previous chat history is preserved (though in this implementation, we clear local storage and rely on server-side storage)

### 5. User Profile in Navbar
- **Precondition**: User is logged in
- **Steps**:
  1. Look at the navbar
- **Expected Result**: Navbar shows "Hello, [User Name]!" and a dropdown with logout option

### 6. Logout Functionality
- **Precondition**: User is logged in
- **Steps**:
  1. Click on user profile in navbar
  2. Select "Logout"
- **Expected Result**: User is logged out and navbar reverts to "Sign In" button

## Technical Implementation Notes

### Backend Changes
1. **Student Model**: Added password_hash, last_login, is_active, is_verified fields
2. **Auth Service**: Created authentication service with password hashing, JWT token generation, and user validation
3. **Auth Routes**: Created /api/auth/register, /api/auth/login, /api/auth/profile, and /api/auth/logout endpoints
4. **Chat Routes**: Updated to support optional authentication and proper session authorization

### Frontend Changes
1. **Auth Context**: Created authentication context to manage user state
2. **Auth Components**: Created Login, Signup, and Auth Modal components
3. **Session Management**: Updated to work with authenticated users
4. **Chat Panel**: Added auth prompt functionality for anonymous users
5. **Navbar Integration**: Added auth component to the top-right of the screen

## Security Considerations
1. Passwords are hashed using bcrypt
2. JWT tokens are used for authentication
3. Sessions are tied to authenticated users
4. Proper authorization checks are in place for chat endpoints
5. Sensitive data is not exposed to unauthorized users

## API Endpoints
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login existing user
- GET /api/auth/profile - Get current user profile
- POST /api/auth/logout - Logout user (client-side)
- POST /api/chat/start - Start chat session (supports authentication)
- POST /api/chat/{chat_session_id}/message - Send message (requires session access)
- GET /api/chat/{chat_session_id}/history - Get chat history (requires session access)