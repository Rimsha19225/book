"""Content loader service to load textbook content from markdown files into the database and vector store."""
import os
import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
import frontmatter  # type: ignore
from ..models.content import TextbookContent, ContentType
from .vector_service import store_embeddings
from ..utils.embeddings import get_content_embeddings


def load_textbook_content_from_docs(db: Session, docs_path: str = "../../../frontend/docs") -> bool:
    """
    Load all textbook content from markdown files in the docs directory into the database.

    Args:
        db: Database session
        docs_path: Path to the docs directory containing markdown files

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Get the absolute path to the docs directory
        import sys
        import os
        current_dir = os.path.dirname(os.path.abspath(__file__))
        docs_abs_path = os.path.join(current_dir, docs_path)

        # If the relative path doesn't work, try from the backend root
        if not os.path.exists(docs_abs_path):
            docs_abs_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(current_dir))), "frontend", "docs")

        if not os.path.exists(docs_abs_path):
            print(f"Docs directory not found at {docs_abs_path}")
            return False

        print(f"Loading content from: {docs_abs_path}")

        # Walk through all directories and files in the docs directory
        for root, dirs, files in os.walk(docs_abs_path):
            for file in files:
                if file.endswith('.md') or file.endswith('.mdx'):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, docs_abs_path)

                    # Parse module and chapter IDs from the path
                    path_parts = relative_path.split(os.sep)

                    # Skip the textbook-content-structure.md file as it's not actual textbook content
                    if file == "textbook-content-structure.md":
                        continue

                    # Determine module_id and chapter_id from path
                    module_id = None
                    chapter_id = file.replace('.md', '').replace('.mdx', '')

                    if len(path_parts) >= 2:
                        if path_parts[0] == "welcome":
                            module_id = "welcome"
                        elif path_parts[0] == "introductory":
                            module_id = "introductory"
                        elif path_parts[0].startswith("module-"):
                            module_id = path_parts[0]  # e.g., "module-1-ros2"
                        else:
                            # If it's not a recognized section, skip it
                            continue

                    # Read the markdown file
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Parse frontmatter if present
                    try:
                        post = frontmatter.loads(content)
                        content_body = post.content
                        metadata = post.metadata
                    except:
                        # If no frontmatter, treat entire content as body
                        content_body = content
                        metadata = {}

                    # Determine content type based on module_id
                    if module_id == "welcome":
                        content_type = ContentType.WELCOME
                    elif module_id == "introductory":
                        content_type = ContentType.INTRODUCTORY
                    elif module_id.startswith("module-"):
                        content_type = ContentType.MODULE
                    else:
                        content_type = ContentType.MODULE  # Default to module type

                    # Create or update the content in the database
                    existing_content = db.query(TextbookContent).filter(
                        TextbookContent.module_id == module_id,
                        TextbookContent.chapter_id == chapter_id
                    ).first()

                    if existing_content:
                        # Update existing content
                        existing_content.title = metadata.get('title', chapter_id.replace('-', ' ').title())
                        existing_content.content_body = content_body
                        existing_content.content_type = content_type
                        db.commit()
                        content_id = str(existing_content.content_id)
                        print(f"Updated content: {module_id}/{chapter_id}")
                    else:
                        # Create new content
                        new_content = TextbookContent(
                            module_id=module_id,
                            chapter_id=chapter_id,
                            title=metadata.get('title', chapter_id.replace('-', ' ').title()),
                            content_type=content_type,
                            content_body=content_body
                        )
                        db.add(new_content)
                        db.commit()
                        db.refresh(new_content)
                        content_id = str(new_content.content_id)
                        print(f"Added content: {module_id}/{chapter_id}")

                    # Generate and store embeddings for the content
                    try:
                        # Split content into chunks for embedding
                        from ..utils.embeddings import chunk_content_for_embeddings
                        content_chunks = chunk_content_for_embeddings(content_body)

                        success = store_embeddings(content_id, module_id, chapter_id, content_chunks)
                        if success:
                            print(f"Stored embeddings for: {module_id}/{chapter_id}")
                        else:
                            print(f"Failed to store embeddings for: {module_id}/{chapter_id}")
                    except Exception as e:
                        print(f"Error storing embeddings for {module_id}/{chapter_id}: {str(e)}")

        return True
    except Exception as e:
        print(f"Error loading textbook content: {str(e)}")
        return False


def chunk_content_for_embeddings(content: str, max_chunk_size: int = 512) -> List[str]:
    """
    Split content into chunks suitable for embedding.

    Args:
        content: The content to chunk
        max_chunk_size: Maximum size of each chunk (in words)

    Returns:
        List of content chunks
    """
    # Split content by paragraphs first
    paragraphs = content.split('\n\n')

    chunks = []
    current_chunk = ""

    for paragraph in paragraphs:
        # If adding this paragraph would exceed the chunk size
        if len(current_chunk.split()) + len(paragraph.split()) > max_chunk_size and current_chunk:
            # Add the current chunk to the list
            chunks.append(current_chunk.strip())
            # Start a new chunk with the current paragraph
            current_chunk = paragraph
        else:
            # Add the paragraph to the current chunk
            if current_chunk:
                current_chunk += "\n\n" + paragraph
            else:
                current_chunk = paragraph

    # Add the last chunk if it has content
    if current_chunk:
        chunks.append(current_chunk.strip())

    # If any chunk is still too large, split by sentences
    final_chunks = []
    for chunk in chunks:
        if len(chunk.split()) > max_chunk_size:
            # Split by sentences
            sentences = re.split(r'[.!?]+', chunk)
            current_sentence_chunk = ""

            for sentence in sentences:
                sentence = sentence.strip()
                if not sentence:
                    continue

                if len(current_sentence_chunk.split()) + len(sentence.split()) > max_chunk_size and current_sentence_chunk:
                    final_chunks.append(current_sentence_chunk.strip())
                    current_sentence_chunk = sentence
                else:
                    if current_sentence_chunk:
                        current_sentence_chunk += ". " + sentence
                    else:
                        current_sentence_chunk = sentence

            if current_sentence_chunk:
                final_chunks.append(current_sentence_chunk.strip() + ".")
        else:
            final_chunks.append(chunk)

    # Filter out empty chunks
    return [chunk for chunk in final_chunks if chunk.strip()]


def load_single_content_file(db: Session, file_path: str, module_id: str, chapter_id: str) -> bool:
    """
    Load a single content file into the database and vector store.

    Args:
        db: Database session
        file_path: Path to the markdown file
        module_id: Module identifier
        chapter_id: Chapter identifier

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Read the markdown file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Parse frontmatter if present
        try:
            post = frontmatter.loads(content)
            content_body = post.content
            metadata = post.metadata
        except:
            # If no frontmatter, treat entire content as body
            content_body = content
            metadata = {}

        # Determine content type based on module_id
        if module_id == "welcome":
            content_type = ContentType.WELCOME
        elif module_id == "introductory":
            content_type = ContentType.INTRODUCTORY
        elif module_id.startswith("module-"):
            content_type = ContentType.MODULE
        else:
            content_type = ContentType.MODULE  # Default to module type

        # Create or update the content in the database
        existing_content = db.query(TextbookContent).filter(
            TextbookContent.module_id == module_id,
            TextbookContent.chapter_id == chapter_id
        ).first()

        if existing_content:
            # Update existing content
            existing_content.title = metadata.get('title', chapter_id.replace('-', ' ').title())
            existing_content.content_body = content_body
            existing_content.content_type = content_type
            db.commit()
            content_id = str(existing_content.content_id)
            print(f"Updated content: {module_id}/{chapter_id}")
        else:
            # Create new content
            new_content = TextbookContent(
                module_id=module_id,
                chapter_id=chapter_id,
                title=metadata.get('title', chapter_id.replace('-', ' ').title()),
                content_type=content_type,
                content_body=content_body
            )
            db.add(new_content)
            db.commit()
            db.refresh(new_content)
            content_id = str(new_content.content_id)
            print(f"Added content: {module_id}/{chapter_id}")

        # Split content into chunks for embedding
        content_chunks = chunk_content_for_embeddings(content_body)

        # Store embeddings for the content
        success = store_embeddings(content_id, module_id, chapter_id, content_chunks)
        if success:
            print(f"Stored embeddings for: {module_id}/{chapter_id}")
        else:
            print(f"Failed to store embeddings for: {module_id}/{chapter_id}")

        return True
    except Exception as e:
        print(f"Error loading content file {file_path}: {str(e)}")
        return False