/**
 * Performance monitoring utility to track function invocations
 * and identify potential infinite loops or excessive calls
 */

interface FunctionCall {
  name: string;
  timestamp: number;
  stack?: string;
}

class PerformanceMonitor {
  private calls: Map<string, FunctionCall[]> = new Map();
  private readonly maxCallsPerMinute = 100; // Threshold for excessive calls
  private readonly cleanupInterval = 60000; // 1 minute

  constructor () {
    // Clean up old calls periodically
    // DISABLED: This was causing high function invocations
    // TODO: Re-enable when performance monitoring is needed
    /*
    if (typeof window !== "undefined") {
      setInterval(() => this.cleanup(), this.cleanupInterval);
    }
    */
  }

  /**
   * Track a function call
   */
  trackCall (functionName: string, includeStack = false): void {
    if (process.env.NODE_ENV !== 'development') { return; }

    const now = Date.now();
    const call: FunctionCall = {
      name: functionName,
      timestamp: now,
      stack: includeStack ? new Error().stack : undefined,
    };

    if (!this.calls.has(functionName)) {
      this.calls.set(functionName, []);
    }

    const functionCalls = this.calls.get(functionName)!;

    functionCalls.push(call);

    // Check for excessive calls
    const recentCalls = functionCalls.filter((call) => now - call.timestamp < 60000, // Last minute
    );

    if (recentCalls.length > this.maxCallsPerMinute) {
      console.warn(
        `⚠️ Potential infinite loop detected: ${functionName} called ${recentCalls.length} times in the last minute`,
        { recentCalls: recentCalls.slice(-10) }, // Show last 10 calls
      );
    }
  }

  /**
   * Get call statistics for a function
   */
  getStats (functionName: string): {
    totalCalls: number;
    callsLastMinute: number;
    callsLastHour: number;
    averageCallsPerMinute: number;
  } {
    const calls = this.calls.get(functionName) || [];
    const now = Date.now();

    const callsLastMinute = calls.filter((call) => now - call.timestamp < 60000).length;
    const callsLastHour = calls.filter((call) => now - call.timestamp < 3600000).length;

    return {
      totalCalls: calls.length,
      callsLastMinute,
      callsLastHour,
      averageCallsPerMinute: callsLastHour / 60,
    };
  }

  /**
   * Get all function call statistics
   */
  getAllStats (): Record<string, ReturnType<typeof this.getStats>> {
    const stats: Record<string, ReturnType<typeof this.getStats>> = {};

    for (const functionName of this.calls.keys()) {
      stats[functionName] = this.getStats(functionName);
    }

    return stats;
  }

  /**
   * Clean up old calls
   */
  private cleanup (): void {
    const cutoff = Date.now() - 3600000; // Keep last hour

    for (const [functionName, calls] of this.calls.entries()) {
      const recentCalls = calls.filter((call) => call.timestamp > cutoff);

      if (recentCalls.length === 0) {
        this.calls.delete(functionName);
      } else {
        this.calls.set(functionName, recentCalls);
      }
    }
  }

  /**
   * Reset all tracking data
   */
  reset (): void {
    this.calls.clear();
  }

  /**
   * Log current statistics to console
   */
  logStats (): void {
    const stats = this.getAllStats();

    console.table(stats);
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator to automatically track function calls
 */
export function trackCalls (functionName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const name = functionName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      performanceMonitor.trackCall(name);

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * Higher-order function to wrap functions with call tracking
 */
export function withCallTracking<T extends (
...args: any[]) => any>(
  fn: T,
  functionName?: string,
): T {
  const name = functionName || fn.name || 'anonymous';

  return ((...args: any[]) => {
    performanceMonitor.trackCall(name);

    return fn(...args);
  }) as T;
}

/**
 * React hook to track component renders
 */
export function useRenderTracking (componentName: string): void {
  if (process.env.NODE_ENV === 'development') {
    performanceMonitor.trackCall(`${componentName}.render`);
  }
}

// Expose to window for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).performanceMonitor = performanceMonitor;
}
