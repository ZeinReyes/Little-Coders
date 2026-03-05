import { useState, useEffect } from "react";

/**
 * useTimer
 * Counts down from `initialSeconds`. Calls `onTimeUp` when it hits 0.
 * Resets automatically whenever `resetKey` changes.
 */
export function useTimer({ initialSeconds = 300, onTimeUp, resetKey }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [started, setStarted] = useState(false);

  // Reset when the lesson / question changes
  useEffect(() => {
    setTimeLeft(initialSeconds);
    setStarted(true);
  }, [resetKey, initialSeconds]);

  useEffect(() => {
    if (!started) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp && onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [started, resetKey]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return { timeLeft, formatted: formatTime(timeLeft) };
}