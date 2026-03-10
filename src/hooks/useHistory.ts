import { useState, useCallback } from 'react';

export function useHistory<T>(initialState: T | (() => T)) {
  const [history, setHistory] = useState<T[]>(() => {
    const init = typeof initialState === 'function' ? (initialState as () => T)() : initialState;
    return [init];
  });
  const [index, setIndex] = useState(0);

  const state = history[index];

  const set = useCallback((newState: T) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, index + 1);
      newHistory.push(newState);
      return newHistory;
    });
    setIndex(prev => prev + 1);
  }, [index]);

  const undo = useCallback(() => {
    setIndex(prev => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setIndex(prev => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const reset = useCallback((newState: T) => {
    setHistory([newState]);
    setIndex(0);
  }, []);

  return { state, set, undo, redo, reset, canUndo: index > 0, canRedo: index < history.length - 1 };
}
