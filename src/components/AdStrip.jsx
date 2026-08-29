import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import AdDetailModal from "./AdDetailModal";

const MIN_ITEMS_PER_SET = 12;
const PX_PER_SECOND = 40;
const RESUME_DELAY_MS = 3000;

export default function AdStrip({ ads, top = 0, onHeightChange }) {
  const [openAdId, setOpenAdId] = useState(null);
  const [adCache, setAdCache] = useState({});
  const API = import.meta.env.VITE_API_URL;

  const containerRef = useRef(null);
  const fetchedIds = useRef(new Set());
  const isInteractingRef = useRef(false);
  const resumeTimerRef = useRef(null);

  const loopAds = useMemo(() => {
    if (!ads || ads.length === 0) return [];
    const repeatTimes = Math.max(1, Math.ceil(MIN_ITEMS_PER_SET / ads.length));
    const baseSet = Array(repeatTimes).fill(ads).flat();
    return [...baseSet, ...baseSet];
  }, [ads]);

  const prefetchAd = useCallback((adId) => {
    if (fetchedIds.current.has(adId)) return;
    fetchedIds.current.add(adId);
    fetch(`${API}/advertisements/${adId}`)
      .then(r => r.json())
      .then(data => setAdCache(prev => ({ ...prev, [adId]: data })))
      .catch(() => { fetchedIds.current.delete(adId); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API]);

  useEffect(() => {
    fetchedIds.current = new Set();
    setAdCache({});
  }, [ads]);

  useEffect(() => {
    if (!containerRef.current || loopAds.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const adId = entry.target.dataset.adid;
            if (adId) prefetchAd(adId);
          }
        });
      },
      { root: containerRef.current, rootMargin: "0px 200px 0px 0px", threshold: 0 }
    );
    const buttons = containerRef.current.querySelectorAll("[data-adid]");
    buttons.forEach(btn => observer.observe(btn));
    return () => observer.disconnect();
  }, [loopAds, prefetchAd]);

  // ── report height upward ──
  useEffect(() => {
    if (!containerRef.current || !onHeightChange) return;
    const el = containerRef.current;
    const report = () => onHeightChange(Math.ceil(el.getBoundingClientRect().height));
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onHeightChange, ads]);

  // ── JS-driven auto-scroll, pauses on manual interaction ──
  useEffect(() => {
    if (!containerRef.current || loopAds.length === 0) return;
    const container = containerRef.current;
    let rafId;
    let lastTime = null;

    const step = (timestamp) => {
      if (lastTime == null) lastTime = timestamp;
      const dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      if (!isInteractingRef.current) {
        container.scrollLeft += PX_PER_SECOND * dt;
        const halfWidth = container.scrollWidth / 2;
        if (container.scrollLeft >= halfWidth) {
          container.scrollLeft -= halfWidth;
        }
      }
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [loopAds]);

  // ── pause/resume on user interaction ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pause = () => {
      isInteractingRef.current = true;
      clearTimeout(resumeTimerRef.current);
    };
    const scheduleResume = () => {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        isInteractingRef.current = false;
      }, RESUME_DELAY_MS);
    };

    container.addEventListener("touchstart", pause, { passive: true });
    container.addEventListener("touchend", scheduleResume);
    container.addEventListener("mousedown", pause);
    window.addEventListener("mouseup", scheduleResume);
    container.addEventListener("wheel", () => { pause(); scheduleResume(); }, { passive: true });

    return () => {
      container.removeEventListener("touchstart", pause);
      container.removeEventListener("touchend", scheduleResume);
      container.removeEventListener("mousedown", pause);
      window.removeEventListener("mouseup", scheduleResume);
      container.removeEventListener("wheel", pause);
      clearTimeout(resumeTimerRef.current);
    };
  }, []);

  if (!ads || ads.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed left-0 right-0 z-40 bg-gray-50 border-b border-gray-100 py-2 md:py-3.5 overflow-x-auto"
      style={{ top, scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
      <div className="flex w-max gap-5 sm:gap-7 md:gap-10 px-4">
        {loopAds.map((ad, i) => (
          <button
            key={`${ad.id}-${i}`}
            data-adid={ad.id}
            onClick={() => setOpenAdId(ad.id)}
            className="flex items-center gap-2 md:gap-3 flex-shrink-0 cursor-pointer"
          >
            <img
              src={ad.icon_url}
              alt=""
              className="w-7 h-7 md:w-9 md:h-9 rounded-full object-cover border border-gray-200 flex-shrink-0"
            />
            <div className="flex flex-col leading-tight text-left">
              <span
                className="text-[13px] md:text-[15px] font-medium whitespace-nowrap"
                style={{ color: ad.line1_color, textShadow: "1px 1px 0 rgba(0,0,0,0.12)" }}
              >
                {ad.line1_text}
              </span>
              {ad.line2_text && (
                <span className="text-[10px] md:text-xs whitespace-nowrap" style={{ color: ad.line2_color }}>
                  {ad.line2_text}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {openAdId && (
        <AdDetailModal
          adId={openAdId}
          initialAd={adCache[openAdId]}
          onClose={() => setOpenAdId(null)}
        />
      )}
    </div>
  );
}