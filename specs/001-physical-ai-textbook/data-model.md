# Data Model: Physical AI & Humanoid Robotics Textbook

## Core Entities

### Student
- **student_id**: UUID (Primary Key)
- **email**: String (Unique, Required)
- **name**: String (Required)
- **created_at**: DateTime (Auto-generated)
- **last_accessed**: DateTime
- **preferences**: JSON (Optional, for UI customization)

**Validation**: Email must be valid format, name must be 2-50 characters

### LearningSession
- **session_id**: UUID (Primary Key)
- **student_id**: UUID (Foreign Key to Student)
- **started_at**: DateTime (Auto-generated)
- **ended_at**: DateTime (Nullable)
- **current_module**: String (Current module identifier)
- **current_chapter**: String (Current chapter identifier)
- **progress_percentage**: Float (0-100)

**Validation**: Session must have valid student_id, progress_percentage between 0-100

### TextbookContent
- **content_id**: UUID (Primary Key)
- **module_id**: String (Module identifier)
- **chapter_id**: String (Chapter identifier)
- **title**: String (Required)
- **content_type**: Enum (welcome, introductory, module, assessment)
- **content_body**: String (Markdown format, Required)
- **created_at**: DateTime (Auto-generated)
- **updated_at**: DateTime (Auto-generated)
- **version**: String (Content version)

**Validation**: Content must have valid module_id and chapter_id, content_body must not be empty

### ChatSession
- **chat_session_id**: UUID (Primary Key)
- **student_id**: UUID (Foreign Key to Student, Nullable for anonymous)
- **created_at**: DateTime (Auto-generated)
- **last_interaction**: DateTime
- **context_chapter**: String (Current chapter for context)

**Validation**: Either student_id or anonymous identifier must be present

### ChatMessage
- **message_id**: UUID (Primary Key)
- **chat_session_id**: UUID (Foreign Key to ChatSession)
- **sender_type**: Enum (student, ai)
- **message_content**: String (Required)
- **timestamp**: DateTime (Auto-generated)
- **context_snippet**: String (Nullable, for text selection context)
- **is_context_aware**: Boolean (Default: false)

**Validation**: Message content must not be empty, valid sender type

### Module
- **module_id**: String (Primary Key, e.g., "ros2", "gazebo_unity", "nvidia_isaac", "vla")
- **title**: String (Required)
- **description**: String (Required)
- **order_index**: Integer (Required, for sequence)
- **estimated_duration_hours**: Float (Nullable)
- **prerequisites**: Array of String (Module IDs)

**Validation**: Module ID must be unique, order_index must be positive

### VectorEmbedding
- **embedding_id**: UUID (Primary Key)
- **content_id**: UUID (Foreign Key to TextbookContent)
- **chunk_text**: String (Required, content chunk)
- **chunk_index**: Integer (Required, order within content)
- **embedding_vector**: Array of Float (Vector data)
- **created_at**: DateTime (Auto-generated)

**Validation**: Embedding vector must have consistent dimensions, content_id must reference existing content

## Relationships

### Student → LearningSession
- One-to-Many: One student can have multiple learning sessions
- Cascade delete: Learning sessions remain for analytics when student is deleted

### Student → ChatSession
- One-to-Many: One student can have multiple chat sessions
- Nullable: Supports anonymous chat sessions

### ChatSession → ChatMessage
- One-to-Many: One chat session contains multiple messages
- Cascade delete: Messages deleted when chat session is deleted

### Module → TextbookContent
- One-to-Many: One module contains multiple content pieces
- Content is organized hierarchically under modules

### TextbookContent → VectorEmbedding
- One-to-Many: One content piece can have multiple vector embeddings (chunks)
- Used for RAG retrieval

## State Transitions

### LearningSession States
- `active`: Session is currently in progress
- `completed`: Session was completed successfully
- `abandoned`: Session was left inactive for extended period

### Student Progress Tracking
- Progress is calculated based on completed chapters within modules
- Percentage is updated as students navigate through content
- Session data persists across visits using session management

## Indexes for Performance

### Required Indexes
- Student.email (Unique)
- LearningSession.student_id
- TextbookContent.module_id, TextbookContent.chapter_id
- ChatSession.student_id, ChatSession.created_at
- VectorEmbedding.content_id