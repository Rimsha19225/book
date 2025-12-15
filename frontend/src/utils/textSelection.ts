/** Text Selection Utility for the Physical AI & Humanoid Robotics Textbook application */

/**
 * Get the currently selected text in the document
 * @returns The selected text or null if no text is selected
 */
export const getSelectedText = (): string | null => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim() !== '') {
    return selection.toString().trim();
  }
  return null;
};

/**
 * Get the context around the selected text
 * @param maxLength - Maximum length of the context to return
 * @returns Context text around the selection
 */
export const getSelectionContext = (maxLength: number = 200): string | null => {
  const selection = window.getSelection();
  if (!selection || selection.toString().trim() === '') {
    return null;
  }

  const range = selection.getRangeAt(0);
  if (!range) {
    return null;
  }

  // Get the start and end containers
  const startContainer = range.startContainer;
  const endContainer = range.endContainer;

  // Get text nodes around the selection
  let context = '';

  // Try to get more context by traversing the DOM
  try {
    // Get the parent element of the selection
    const parentElement = range.commonAncestorContainer.parentElement;
    if (parentElement) {
      context = parentElement.textContent || '';
    } else {
      // If no parent element, use the range's content
      context = range.toString();
    }

    // If context is too long, try to center it on the selection
    if (context.length > maxLength) {
      const selectionText = selection.toString();
      const index = context.indexOf(selectionText);
      if (index !== -1) {
        const start = Math.max(0, index - Math.floor(maxLength / 2));
        const end = Math.min(context.length, index + selectionText.length + Math.floor(maxLength / 2));
        context = context.substring(start, end);
      } else {
        // If selection text isn't found in context, just take the middle portion
        const start = Math.max(0, Math.floor(context.length / 2) - Math.floor(maxLength / 2));
        const end = Math.min(context.length, start + maxLength);
        context = context.substring(start, end);
      }
    }
  } catch (error) {
    console.warn('Could not get selection context:', error);
    // Fallback to just the selected text
    context = selection.toString();
  }

  return context.substring(0, maxLength);
};

/**
 * Add event listener for text selection
 * @param callback - Function to call when text is selected
 * @returns Function to remove the event listener
 */
export const addTextSelectionListener = (callback: (selectedText: string | null, context?: string) => void): (() => void) => {
  const handleSelection = () => {
    const selectedText = getSelectedText();
    if (selectedText) {
      const context = getSelectionContext();
      callback(selectedText, context);
    } else {
      callback(null);
    }
  };

  // Add both mouse and touch event listeners for better mobile support
  document.addEventListener('mouseup', handleSelection);
  document.addEventListener('touchend', handleSelection);
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') {
      callback(null);
    }
  });

  // Return function to remove the listeners
  return () => {
    document.removeEventListener('mouseup', handleSelection);
    document.removeEventListener('touchend', handleSelection);
    document.removeEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        callback(null);
      }
    });
  };
};

/**
 * Highlight selected text with a custom style
 * @param className - CSS class name to apply to the selection
 */
export const highlightSelection = (className: string = 'textbook-selection'): void => {
  const selection = window.getSelection();
  if (!selection || selection.toString().trim() === '') {
    return;
  }

  const range = selection.getRangeAt(0);
  if (!range) {
    return;
  }

  // Create a temporary element to wrap the selection
  const span = document.createElement('span');
  span.className = className;

  try {
    range.surroundContents(span);
  } catch (error) {
    // If surroundContents fails (e.g., if selection crosses element boundaries),
    // we'll need to manually wrap the content
    console.warn('Could not wrap selection directly:', error);

    // Alternative approach: extract the content and reinsert it wrapped
    const contents = range.extractContents();
    span.appendChild(contents);
    range.insertNode(span);
  }
};

/**
 * Remove highlighting from selected text
 */
export const removeHighlighting = (className: string = 'textbook-selection'): void => {
  const highlightedElements = document.querySelectorAll(`.${className}`);
  highlightedElements.forEach(element => {
    const parent = element.parentNode;
    if (parent) {
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    }
  });
};

/**
 * Get the bounding rectangle of the current text selection
 * @returns DOMRect of the selection or null if no selection
 */
export const getSelectionRect = (): DOMRect | null => {
  const selection = window.getSelection();
  if (!selection || selection.toString().trim() === '') {
    return null;
  }

  const range = selection.getRangeAt(0);
  if (!range) {
    return null;
  }

  return range.getBoundingClientRect();
};

/**
 * Check if text is currently selected
 * @returns Boolean indicating if text is selected
 */
export const isTextSelected = (): boolean => {
  const selection = window.getSelection();
  return selection !== null && selection.toString().trim() !== '';
};