import { useState, useEffect, useCallback, useRef } from 'react';

type UseDebounceOptions<T> = {
  value: T;
  delay: number;
  options?: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  };
};

type DebouncedState<T> = {
  value: T;
  isDebouncing: boolean;
};

const DEFAULT_OPTIONS = {
  leading: false,
  trailing: true,
  maxWait: undefined as number | undefined,
};

export function useDebounce<T>({
  value,
  delay,
  options = {},
}: UseDebounceOptions<T>): DebouncedState<T> {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState(false);
  
  const { leading, trailing, maxWait } = { ...DEFAULT_OPTIONS, ...options };
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxWaitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const previousValueRef = useRef(value);
  const shouldCallLeadingRef = useRef(true);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxWaitTimeoutRef.current) {
      clearTimeout(maxWaitTimeoutRef.current);
      maxWaitTimeoutRef.current = null;
    }
  }, []);

  const callTrailing = useCallback((currentValue: T) => {
    if (!isMountedRef.current) return;
    
    setDebouncedValue(currentValue);
    setIsDebouncing(false);
    shouldCallLeadingRef.current = true;
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      clearTimers();
    };
  }, [clearTimers]);

  useEffect(() => {
    if (previousValueRef.current === value) return;
    previousValueRef.current = value;

    clearTimers();

    const shouldCallLeading = leading && shouldCallLeadingRef.current;
    
    if (shouldCallLeading) {
      setDebouncedValue(value);
      shouldCallLeadingRef.current = false;
    }

    setIsDebouncing(true);

    if (maxWait && !maxWaitTimeoutRef.current) {
      maxWaitTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        
        clearTimers();
        callTrailing(value);
      }, maxWait);
    }

    if (trailing || (!leading && trailing)) {
      timeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;
        
        callTrailing(value);
      }, delay);
    } else if (!trailing && !isDebouncing) {
      setIsDebouncing(false);
    }

    return () => {
      if (timeoutRef.current && !trailing) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [value, delay, leading, trailing, maxWait, isDebouncing, clearTimers, callTrailing]);

  return {
    value: debouncedValue,
    isDebouncing,
  };
}

export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  }
): [T, () => void, () => void] {
  const { leading = false, trailing = true, maxWait } = options || {};
  
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxWaitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (maxWaitTimeoutRef.current) clearTimeout(maxWaitTimeoutRef.current);
    };
  }, []);

  const debouncedFunction = useCallback((...args: Parameters<T>) => {
    lastArgsRef.current = args;
    lastCallTimeRef.current = Date.now();

    const shouldCallLeading = leading && !timeoutRef.current;

    if (shouldCallLeading) {
      callbackRef.current(...args);
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;

      timeoutRef.current = null;
      
      if (trailing && lastArgsRef.current) {
        callbackRef.current(...lastArgsRef.current);
        lastArgsRef.current = null;
      }
    }, delay);

    if (maxWait && !maxWaitTimeoutRef.current) {
      maxWaitTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;

        if (lastArgsRef.current) {
          callbackRef.current(...lastArgsRef.current);
          lastArgsRef.current = null;
        }
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        maxWaitTimeoutRef.current = null;
      }, maxWait);
    }
  }, [delay, leading, trailing, maxWait]) as T;

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxWaitTimeoutRef.current) {
      clearTimeout(maxWaitTimeoutRef.current);
      maxWaitTimeoutRef.current = null;
    }
    lastArgsRef.current = null;
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (lastArgsRef.current) {
      callbackRef.current(...lastArgsRef.current);
      lastArgsRef.current = null;
    }
  }, []);

  return [debouncedFunction, cancel, flush];
}