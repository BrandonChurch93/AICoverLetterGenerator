import { useEffect, useState, useCallback, useRef } from "react";

/**
 * Debounce hook for optimizing expensive operations
 * Delays execution until after wait milliseconds have elapsed since last call
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook for limiting function execution frequency
 * Ensures function is called at most once per specified interval
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Auto-save hook with debouncing
 * Automatically saves data after a delay when it changes
 */
export function useAutoSave(
  data: any,
  saveFunction: (data: any) => void,
  delay: number = 1500
) {
  const debouncedData = useDebounce(data, delay);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  useEffect(() => {
    if (debouncedData && Object.values(debouncedData).some((v) => v)) {
      setSaveStatus("saving");
      try {
        saveFunction(debouncedData);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    }
  }, [debouncedData, saveFunction]);

  return saveStatus;
}

/**
 * Lazy load hook for deferring component loading
 * Useful for heavy components that aren't immediately visible
 */
export function useLazyLoad(shouldLoad: boolean, delay: number = 0) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (shouldLoad) {
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [shouldLoad, delay]);

  return isLoaded;
}

/**
 * Intersection Observer hook for detecting element visibility
 * Useful for animations, lazy loading, and analytics
 */
export function useIntersectionObserver(
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting) {
        setHasIntersected(true);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return { isIntersecting, hasIntersected };
}

/**
 * Measure performance of operations
 * Useful for debugging and optimization
 */
export function measurePerformance(label: string) {
  const start = performance.now();

  return {
    end: () => {
      const duration = performance.now() - start;
      if (process.env.NODE_ENV === "development") {
        console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
      }
      return duration;
    },
  };
}
