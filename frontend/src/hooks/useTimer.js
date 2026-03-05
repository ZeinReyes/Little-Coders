import { useState, useEffect, useCallback } from "react";

export function useTimer({ initialSeconds = 300, onTimeUp, resetKey }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [started, setStarted] = useState(false);
  const [stopped, setStopped] = useState(false);

  // Reset when the lesson / question changes
  useEffect(() => {
    setTimeLeft(initialSeconds);
    setStarted(true);
    setStopped(false); // ← un-stop on new question/lesson
  }, [resetKey, initialSeconds]);

  useEffect(() => {
    if (!started || stopped) return; // ← pause when stopped

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
  }, [started, stopped, resetKey]);

  const stopTimer  = useCallback(() => setStopped(true),  []);
  const startTimer = useCallback(() => setStopped(false), []);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return { timeLeft, formatted: formatTime(timeLeft), stopTimer, startTimer };
}