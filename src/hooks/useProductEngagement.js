import { useEffect, useRef, useCallback } from "react";

const FLUSH_INTERVAL_MS = 15000;
const pending = new Map();
let flushTimer = null;
let apiUrl = null;

function flushAll(useBeacon = false) {
  if (!apiUrl || pending.size === 0) return;
  const entries = Array.from(pending.entries());
  pending.clear();

  entries.forEach(([productId, data]) => {
    const payload = JSON.stringify({ dwellSeconds: data.dwellSeconds, clicked: data.clicked });
    const url = `${apiUrl}/products/view/${productId}`;
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  });
}

function addEngagement(productId, { dwellSeconds = 0, clicked = false }) {
  const existing = pending.get(productId) || { dwellSeconds: 0, clicked: false };
  pending.set(productId, {
    dwellSeconds: existing.dwellSeconds + dwellSeconds,
    clicked: existing.clicked || clicked,
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushAll(true);
  });
  window.addEventListener("pagehide", () => flushAll(true));
}

export function useDwellTracking(productId, API, { threshold = 0.5, active = true } = {}) {
  const elementRef = useRef(null);
  const visibleSinceRef = useRef(null);

  useEffect(() => {
    apiUrl = API;
    if (!flushTimer) flushTimer = setInterval(() => flushAll(false), FLUSH_INTERVAL_MS);
  }, [API]);

  useEffect(() => {
    if (!active || !productId || !elementRef.current) return;
    const el = elementRef.current;

    const closeSession = () => {
      if (!visibleSinceRef.current) return;
      const seconds = (Date.now() - visibleSinceRef.current) / 1000;
      visibleSinceRef.current = null;
      if (seconds > 0.5) addEngagement(productId, { dwellSeconds: seconds });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && document.visibilityState === "visible") {
          visibleSinceRef.current = Date.now();
        } else {
          closeSession();
        }
      },
      { threshold }
    );
    observer.observe(el);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") closeSession();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      closeSession();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [productId, active, threshold]);

  const recordClick = useCallback(() => {
    if (productId) addEngagement(productId, { clicked: true });
  }, [productId]);

  return { elementRef, recordClick };
}