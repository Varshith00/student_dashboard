/**
 * Global ResizeObserver Error Handler
 * Handles common ResizeObserver errors that occur with Monaco Editor and other dynamic UI components
 */

let resizeObserverErrorSuppressed = false;

/**
 * Debounced function to prevent ResizeObserver loop limit exceeded errors
 */
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Custom ResizeObserver that handles errors gracefully
 */
export class SafeResizeObserver {
  private observer: ResizeObserver;
  private callback: ResizeObserverCallback;
  private debouncedCallback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback, debounceMs: number = 100) {
    this.callback = callback;
    this.debouncedCallback = debounce(callback, debounceMs);
    
    this.observer = new ResizeObserver((entries, observer) => {
      try {
        // Use requestAnimationFrame to avoid ResizeObserver loop errors
        requestAnimationFrame(() => {
          this.debouncedCallback(entries, observer);
        });
      } catch (error) {
        // Silently handle ResizeObserver errors to prevent console spam
        if (!error.message?.includes('ResizeObserver loop limit exceeded')) {
          console.warn('SafeResizeObserver error:', error);
        }
      }
    });
  }

  observe(target: Element, options?: ResizeObserverOptions) {
    try {
      this.observer.observe(target, options);
    } catch (error) {
      console.warn('Failed to observe element:', error);
    }
  }

  unobserve(target: Element) {
    try {
      this.observer.unobserve(target);
    } catch (error) {
      console.warn('Failed to unobserve element:', error);
    }
  }

  disconnect() {
    try {
      this.observer.disconnect();
    } catch (error) {
      console.warn('Failed to disconnect observer:', error);
    }
  }
}

/**
 * Initializes global ResizeObserver error handling
 * Call this once at the application startup
 */
export const initializeResizeObserverErrorHandling = () => {
  if (resizeObserverErrorSuppressed) {
    return;
  }

  // Global error handler for ResizeObserver errors
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    // Suppress ResizeObserver loop errors that are harmless but noisy
    if (
      args.length > 0 &&
      typeof args[0] === 'string' &&
      args[0].includes('ResizeObserver loop limit exceeded')
    ) {
      // Log once for debugging purposes
      if (!resizeObserverErrorSuppressed) {
        console.warn(
          'ResizeObserver errors are being suppressed. This is normal for Monaco Editor.',
          'If you need to debug ResizeObserver issues, set resizeObserverErrorSuppressed to false.'
        );
        resizeObserverErrorSuppressed = true;
      }
      return;
    }
    // Pass through all other errors
    originalConsoleError.apply(console, args);
  };

  // Global window error handler for ResizeObserver
  const originalErrorHandler = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    // Suppress ResizeObserver loop errors
    if (
      typeof message === 'string' &&
      message.includes('ResizeObserver loop limit exceeded')
    ) {
      return true; // Prevent default error handling
    }
    
    // Call original handler for other errors
    if (originalErrorHandler) {
      return originalErrorHandler(message, source, lineno, colno, error);
    }
    return false;
  };

  // Handle unhandled promise rejections that might be ResizeObserver related
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      typeof event.reason.message === 'string' &&
      event.reason.message.includes('ResizeObserver')
    ) {
      event.preventDefault();
      console.warn('Suppressed ResizeObserver promise rejection:', event.reason.message);
    }
  });

  console.log('✅ ResizeObserver error handling initialized');
};

/**
 * Monaco Editor specific ResizeObserver configuration
 */
export const createMonacoResizeObserverConfig = () => ({
  // Disable automatic layout to prevent ResizeObserver conflicts
  automaticLayout: false,
  
  // Custom resize handling
  scrollBeyondLastLine: false,
  smoothScrolling: false,
  
  // Performance optimizations
  renderLineHighlight: 'none' as const,
  renderIndentGuides: false,
  
  // Reduce unnecessary computations
  folding: false,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 3,
});

/**
 * Hook for safe Monaco Editor mounting
 */
export const useSafeMonacoMount = (callback: () => void, deps: any[] = []) => {
  return (...args: any[]) => {
    try {
      // Delay execution to next tick to avoid ResizeObserver conflicts
      setTimeout(() => {
        callback();
      }, 0);
    } catch (error) {
      console.warn('Monaco mount error:', error);
    }
  };
};

/**
 * Utility to create a resize-safe container for Monaco Editor
 */
export const createResizeSafeContainer = (element: HTMLElement) => {
  // Add stable dimensions to prevent layout thrashing
  if (!element.style.width) {
    element.style.width = '100%';
  }
  if (!element.style.height) {
    element.style.height = '100%';
  }
  
  // Ensure the container has layout
  if (element.style.display === 'none') {
    element.style.display = 'block';
  }
  
  // Add resize observer with debouncing
  const observer = new SafeResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        // Trigger Monaco Editor layout update
        const event = new CustomEvent('monaco-resize', {
          detail: { width, height }
        });
        element.dispatchEvent(event);
      }
    }
  }, 150); // 150ms debounce
  
  observer.observe(element);
  
  return () => {
    observer.disconnect();
  };
};
