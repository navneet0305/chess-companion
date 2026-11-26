import { useState, useCallback, useRef, useEffect } from 'react';
import type { Color } from 'chess.js';

interface UseChessClockReturn {
  whiteTime: number;
  blackTime: number;
  isRunning: boolean;
  activeColor: Color | null;
  isTimeout: boolean;
  start: (color: Color) => void;
  switchClock: () => void;
  pause: () => void;
  resume: () => void;
  reset: (timeInSeconds: number) => void;
}

export function useChessClock(
  initialTime: number = 600,
  increment: number = 0,
): UseChessClockReturn {
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const [blackTime, setBlackTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [activeColor, setActiveColor] = useState<Color | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTicking = useCallback(
    (color: Color) => {
      clearTimer();
      lastTickRef.current = performance.now();

      intervalRef.current = setInterval(() => {
        const now = performance.now();
        const elapsed = (now - lastTickRef.current) / 1000;
        lastTickRef.current = now;

        const setter = color === 'w' ? setWhiteTime : setBlackTime;
        setter((prev) => {
          const next = Math.max(0, prev - elapsed);
          if (next <= 0) {
            clearTimer();
            setIsRunning(false);
            setIsTimeout(true);
          }
          return next;
        });
      }, 100);
    },
    [clearTimer],
  );

  const start = useCallback(
    (color: Color) => {
      if (isTimeout) return;
      setActiveColor(color);
      setIsRunning(true);
      startTicking(color);
    },
    [isTimeout, startTicking],
  );

  const switchClock = useCallback(() => {
    if (!activeColor || !isRunning || isTimeout) return;

    clearTimer();

    // Add increment to the color that just moved
    const incrementSetter = activeColor === 'w' ? setWhiteTime : setBlackTime;
    incrementSetter((prev) => prev + increment);

    // Switch to other color
    const nextColor: Color = activeColor === 'w' ? 'b' : 'w';
    setActiveColor(nextColor);
    startTicking(nextColor);
  }, [activeColor, isRunning, isTimeout, clearTimer, increment, startTicking]);

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (!activeColor || isTimeout) return;
    setIsRunning(true);
    startTicking(activeColor);
  }, [activeColor, isTimeout, startTicking]);

  const reset = useCallback(
    (timeInSeconds: number) => {
      clearTimer();
      setWhiteTime(timeInSeconds);
      setBlackTime(timeInSeconds);
      setIsRunning(false);
      setActiveColor(null);
      setIsTimeout(false);
    },
    [clearTimer],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    whiteTime,
    blackTime,
    isRunning,
    activeColor,
    isTimeout,
    start,
    switchClock,
    pause,
    resume,
    reset,
  };
}
