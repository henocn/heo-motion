import { useEffect, useRef, useCallback } from "react";

// Hook generique de polling : appelle fetchFn toutes les intervalMs tant que enabled est true.
// Utilise un ref pour la callback afin d'eviter de relancer le timer a chaque changement.
export default function usePolling(fetchFn, intervalMs = 4000, enabled = true) {
  const fnRef = useRef(fetchFn);
  const timerRef = useRef(null);

  useEffect(() => {
    fnRef.current = fetchFn;
  }, [fetchFn]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }

    fnRef.current();

    timerRef.current = setInterval(() => {
      fnRef.current();
    }, intervalMs);

    return () => stop();
  }, [enabled, intervalMs, stop]);

  return { stop };
}
