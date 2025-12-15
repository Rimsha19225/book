/** Performance Testing Utilities for the Physical AI & Humanoid Robotics Textbook application */

// Define performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  CHATBOT_RESPONSE_TIME: 5000, // 5 seconds
  CONTENT_LOAD_TIME: 3000,     // 3 seconds
  PAGE_TRANSITION_TIME: 2000,  // 2 seconds
  API_CALL_TIMEOUT: 10000,     // 10 seconds
};

// Performance metric interface
export interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  threshold: number;
  passed: boolean;
  details?: string;
}

// Performance tracker class
class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];

  /**
   * Start tracking a performance operation
   * @param operation - Name of the operation being measured
   * @param threshold - Threshold in milliseconds
   * @returns Unique operation ID for tracking
   */
  start(operation: string, threshold: number = PERFORMANCE_THRESHOLDS.API_CALL_TIMEOUT): string {
    const operationId = this.generateOperationId();
    const startTime = performance.now();

    // Store initial metric data
    this.metrics.push({
      operation,
      startTime,
      threshold,
      passed: false, // Will be updated when completed
    });

    return operationId;
  }

  /**
   * Complete tracking for an operation
   * @param operationId - The operation ID returned by start()
   * @param details - Optional details about the operation
   */
  complete(operationId: string, details?: string): PerformanceMetric | null {
    const metric = this.metrics.find(m => m.operation === operationId);
    if (!metric) {
      console.warn(`Performance metric not found for operation ID: ${operationId}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    // Update metric with completion data
    metric.endTime = endTime;
    metric.duration = duration;
    metric.passed = duration <= metric.threshold;
    if (details) {
      metric.details = details;
    }

    // Log performance results
    this.logPerformance(metric);

    return metric;
  }

  /**
   * Measure an async operation
   * @param operation - Name of the operation
   * @param asyncFn - The async function to measure
   * @param threshold - Threshold in milliseconds
   * @returns Promise that resolves with the function result and performance data
   */
  async measureAsync<T>(
    operation: string,
    asyncFn: () => Promise<T>,
    threshold: number = PERFORMANCE_THRESHOLDS.CHATBOT_RESPONSE_TIME
  ): Promise<{ result: T; metric: PerformanceMetric }> {
    const operationId = this.start(operation, threshold);

    try {
      const result = await asyncFn();
      const metric = this.complete(operationId, 'Success');

      if (!metric) {
        throw new Error(`Failed to complete performance measurement for: ${operation}`);
      }

      return { result, metric };
    } catch (error) {
      const metric = this.complete(operationId, `Error: ${(error as Error).message}`);

      if (!metric) {
        throw error; // Re-throw original error if metric completion failed
      }

      throw error;
    }
  }

  /**
   * Measure a synchronous operation
   * @param operation - Name of the operation
   * @param fn - The function to measure
   * @param threshold - Threshold in milliseconds
   * @returns Object with function result and performance data
   */
  measureSync<T>(
    operation: string,
    fn: () => T,
    threshold: number = PERFORMANCE_THRESHOLDS.CONTENT_LOAD_TIME
  ): { result: T; metric: PerformanceMetric } {
    const operationId = this.start(operation, threshold);

    try {
      const result = fn();
      const metric = this.complete(operationId, 'Success');

      if (!metric) {
        throw new Error(`Failed to complete performance measurement for: ${operation}`);
      }

      return { result, metric };
    } catch (error) {
      const metric = this.complete(operationId, `Error: ${(error as Error).message}`);

      if (!metric) {
        throw error; // Re-throw original error if metric completion failed
      }

      throw error;
    }
  }

  /**
   * Log performance results to console
   * @param metric - The performance metric to log
   */
  private logPerformance(metric: PerformanceMetric): void {
    const status = metric.passed ? '✅ PASSED' : '❌ FAILED';
    const duration = metric.duration?.toFixed(2) || 'N/A';
    const threshold = metric.threshold;

    console.group(`Performance: ${status} - ${metric.operation}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Threshold: ${threshold}ms`);
    if (metric.details) {
      console.log(`Details: ${metric.details}`);
    }
    console.groupEnd();
  }

  /**
   * Get all performance metrics
   * @returns Array of all recorded performance metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]; // Return a copy to prevent external modification
  }

  /**
   * Get performance metrics for a specific operation
   * @param operation - Name of the operation
   * @returns Array of metrics for the operation
   */
  getMetricsByOperation(operation: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.operation.includes(operation));
  }

  /**
   * Reset all performance metrics
   */
  reset(): void {
    this.metrics = [];
  }

  /**
   * Generate a unique operation ID
   * @returns Unique string ID
   */
  private generateOperationId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if chatbot response time is acceptable
   * @param duration - Response time in milliseconds
   * @returns True if response time is acceptable
   */
  public isChatbotResponseAcceptable(duration: number): boolean {
    return duration <= PERFORMANCE_THRESHOLDS.CHATBOT_RESPONSE_TIME;
  }

  /**
   * Get performance summary
   * @returns Summary of performance metrics
   */
  getSummary(): { total: number; passed: number; failed: number; complianceRate: number } {
    const total = this.metrics.length;
    const passed = this.metrics.filter(m => m.passed).length;
    const failed = total - passed;
    const complianceRate = total > 0 ? (passed / total) * 100 : 100;

    return { total, passed, failed, complianceRate };
  }
}

// Create a singleton instance
export const performanceTracker = new PerformanceTracker();

/**
 * Decorator for measuring method performance
 * @param threshold - Threshold in milliseconds
 */
export function measurePerformance(threshold: number = PERFORMANCE_THRESHOLDS.API_CALL_TIMEOUT) {
  return function(_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args: any[]) {
      const operation = `${this.constructor.name}.${propertyKey}`;
      const operationId = performanceTracker.start(operation, threshold);

      const result = originalMethod.apply(this, args);

      // If it's a promise, measure the async execution
      if (result instanceof Promise) {
        return result.then(resolvedResult => {
          performanceTracker.complete(operationId, 'Success');
          return resolvedResult;
        }).catch(error => {
          performanceTracker.complete(operationId, `Error: ${error.message}`);
          throw error;
        });
      } else {
        performanceTracker.complete(operationId, 'Success');
        return result;
      }
    };

    return descriptor;
  };
}

/**
 * Utility function to measure chatbot response time specifically
 * @param query - The query to send to the chatbot
 * @param chatFunction - Function that handles the chatbot query
 * @returns Object with response and performance metrics
 */
export const measureChatbotResponse = async <T>(
  query: string,
  chatFunction: (q: string) => Promise<T>
): Promise<{ response: T; responseTime: number; passed: boolean }> => {
  const startTime = performance.now();
  const response = await chatFunction(query);
  const endTime = performance.now();
  const responseTime = endTime - startTime;
  const passed = responseTime <= PERFORMANCE_THRESHOLDS.CHATBOT_RESPONSE_TIME;

  // Log the result
  const status = passed ? '✅ PASSED' : '❌ FAILED';
  console.log(`Chatbot Response Time: ${responseTime.toFixed(2)}ms (${status})`);

  return {
    response,
    responseTime,
    passed
  };
};

// Initialize performance monitoring when this module is loaded
console.log('Performance tracking initialized with thresholds:', PERFORMANCE_THRESHOLDS);