import { useState, useCallback, useRef } from 'react';

export const useLongPress = (
  callback: (e: React.MouseEvent | React.TouchEvent) => void,
  ms = 500 // Increased slightly to prevent accidental triggers
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const eventRef = useRef<React.MouseEvent | React.TouchEvent | null>(null);

  const start = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    eventRef.current = e;
    timerRef.current = setTimeout(() => {
      if (eventRef.current) {
        callback(eventRef.current);
      }
    }, ms);
  }, [callback, ms]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    eventRef.current = null;
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
  };
};
