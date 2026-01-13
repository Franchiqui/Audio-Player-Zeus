'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type LocalStorageValue<T> = T | null;

interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
  onError?: (error: Error) => void;
}

interface UseLocalStorageReturn<T> {
  value: LocalStorageValue<T>;
  setValue: (value: T | ((prev: LocalStorageValue<T>) => T)) => void;
  removeValue: () => void;
  isPersistent: boolean;
}

const defaultSerializer = <T>(value: T): string => {
  return JSON.stringify(value);
};

const defaultDeserializer = <T>(value: string): T => {
  return JSON.parse(value);
};

const isBrowser = typeof window !== 'undefined';

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const {
    serializer = defaultSerializer,
    deserializer = defaultDeserializer,
    onError
  } = options;

  const [storedValue, setStoredValue] = useState<LocalStorageValue<T>>(() => {
    if (!isBrowser) return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      onError?.(error as Error);
      return initialValue;
    }
  });

  const [isPersistent, setIsPersistent] = useState(true);
  const initialValueRef = useRef(initialValue);
  const keyRef = useRef(key);

  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  useEffect(() => {
    if (!isBrowser) return;

    const testKey = `__test_persistence_${Date.now()}`;
    try {
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      setIsPersistent(true);
    } catch {
      setIsPersistent(false);
    }
  }, []);

  const setValue = useCallback(
    (value: T | ((prev: LocalStorageValue<T>) => T)) => {
      if (!isBrowser || !isPersistent) return;

      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (valueToStore === null) {
          window.localStorage.removeItem(keyRef.current);
        } else {
          window.localStorage.setItem(
            keyRef.current,
            serializer(valueToStore)
          );
        }
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [storedValue, isPersistent, serializer, onError]
  );

  const removeValue = useCallback(() => {
    if (!isBrowser) return;

    try {
      setStoredValue(null);
      window.localStorage.removeItem(keyRef.current);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [onError]);

  useEffect(() => {
    if (!isBrowser) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === keyRef.current && event.storageArea === localStorage) {
        try {
          const newValue = event.newValue
            ? deserializer(event.newValue)
            : initialValueRef.current;
          setStoredValue(newValue);
        } catch (error) {
          onError?.(error as Error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [deserializer, onError]);

  useEffect(() => {
    if (!isBrowser) return;

    const syncValue = () => {
      try {
        const item = window.localStorage.getItem(keyRef.current);
        const newValue = item ? deserializer(item) : initialValueRef.current;
        
        if (JSON.stringify(newValue) !== JSON.stringify(storedValue)) {
          setStoredValue(newValue);
        }
      } catch (error) {
        onError?.(error as Error);
      }
    };

    const intervalId = setInterval(syncValue, 1000);
    return () => clearInterval(intervalId);
  }, [storedValue, deserializer, onError]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    isPersistent
  };
}

export function useLocalStorageArray<T>(
  key: string,
  initialValue: T[] = []
) {
  const { value, setValue, removeValue, isPersistent } = useLocalStorage<T[]>(
    key,
    initialValue
  );

  const addItem = useCallback(
    (item: T) => {
      setValue((prev) => [...(prev || []), item]);
    },
    [setValue]
  );

  const removeItem = useCallback(
    (index: number) => {
      setValue((prev) => {
        if (!prev) return [];
        return prev.filter((_, i) => i !== index);
      });
    },
    [setValue]
  );

  const updateItem = useCallback(
    (index: number, item: T) => {
      setValue((prev) => {
        if (!prev) return [];
        const newArray = [...prev];
        newArray[index] = item;
        return newArray;
      });
    },
    [setValue]
  );

  const clearAll = useCallback(() => {
    setValue([]);
  }, [setValue]);

  return {
    items: value || [],
    addItem,
    removeItem,
    updateItem,
    clearAll,
    removeValue,
    isPersistent
  };
}

export function useLocalStorageObject<T extends Record<string, any>>(
  key: string,
  initialValue: T
) {
  const { value, setValue, removeValue, isPersistent } = useLocalStorage<T>(
    key,
    initialValue
  );

  const updateField = useCallback(
    <K extends keyof T>(field: K, fieldValue: T[K]) => {
      setValue((prev) => ({
        ...(prev || initialValue),
        [field]: fieldValue
      }));
    },
    [setValue, initialValue]
  );

  const mergeObject = useCallback(
    (partialObject: Partial<T>) => {
      setValue((prev) => ({
        ...(prev || initialValue),
        ...partialObject
      }));
    },
    [setValue, initialValue]
  );

  return {
    data: value || initialValue,
    updateField,
    mergeObject,
    setData: setValue,
    removeData: removeValue,
    isPersistent
  };
}