import { useEffect, useRef, useCallback } from "react";

// Hook generique de polling : appelle fetchFn toutes les intervalMs tant que shouldContinue renvoie true
export default function usePolling(fetchFn, intervalMs = 3000, shouldContinue = true) {
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (!shouldContinue) {
      stop();
      return;
    }

    fetchFn();

    timerRef.current = setInterval(() => {
      if (mountedRef.current && shouldContinue) {
        fetchFn();
      }
    }, intervalMs);

    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [fetchFn, intervalMs, shouldContinue, stop]);

  return { stop };
}
