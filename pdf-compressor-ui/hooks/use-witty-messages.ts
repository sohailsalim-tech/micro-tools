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
  const [index, setIndex] = useState(0);
  const shuffled = useRef<string[]>([]);

  useEffect(() => {
    if (!active) { setIndex(0); return; }
    shuffled.current = shuffle(messages);
    setIndex(0);
    const id = setInterval(() => setIndex(i => Math.min(i + 1, shuffled.current.length - 1)), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]); // eslint-disable-line react-hooks/exhaustive-deps

  return active ? shuffled.current[index] ?? messages[0] : messages[0];
}
