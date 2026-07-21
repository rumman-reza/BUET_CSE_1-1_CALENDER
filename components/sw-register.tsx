"use client";

import { useEffect } from "react";

export function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // offline support is best-effort; ignore registration failures (e.g. localhost http)
      });
    }
  }, []);
  return null;
}
