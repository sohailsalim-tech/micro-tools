"use client";

import { useState, useEffect, useRef } from "react";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useWittyMessages(messages: string[], active: boolean, intervalMs = 2200) {
  const [current, setCurrent] = useState(messages[0]);
  const queueRef = useRef<string[]>([]);

  useEffect(() => {
    if (!active) {
      setCurrent(messages[0]);
      queueRef.current = [];
      return;
    }
    queueRef.current = shuffle(messages);
    setCurrent(queueRef.current[0]);
    let i = 1;
    const id = setInterval(() => {
      if (i < queueRef.current.length) {
        setCurrent(queueRef.current[i]);
        i++;
      }
    }, intervalMs);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, intervalMs]);

  return current;
}
