"use client";

import { useState, useEffect } from "react";

export function useWittyMessages(messages: string[], active: boolean, intervalMs = 2200) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) { setIndex(0); return; }
    const id = setInterval(() => setIndex(i => (i + 1) % messages.length), intervalMs);
    return () => clearInterval(id);
  }, [active, messages.length, intervalMs]);

  return messages[index];
}
