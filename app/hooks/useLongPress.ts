import { useState, useEffect, useRef } from 'react';

export const useLongPress = (
  callback: () => void,
  ms = 300
) => {
  const [isPressing, setIsPressing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPressing) {
      timerRef.current = setTimeout(() => {
        callback();
      }, ms);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPressing, callback, ms]);

  return {
    onMouseDown: () => setIsPressing(true),
    onMouseUp: () => setIsPressing(false),
    onMouseLeave: () => setIsPressing(false),
    onTouchStart: () => setIsPressing(true),
    onTouchEnd: () => setIsPressing(false),
  };
};
