import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import AdDetailModal from "./AdDetailModal";

const MIN_ITEMS_PER_SET = 12; // ensures the strip never runs dry, even with 1-2 ads
const SECONDS_PER_ITEM = 3;   // keeps scroll SPEED constant regardless of ad count

export default function AdStrip({ ads, top = 0, onHeightChange }) {
  const [openAdId, setOpenAdId] = useState(null);
  const [adCache, setAdCache] = useState({});
  const API = import.meta.env.VITE_API_URL;
  const containerRef = useRef(null);
  const fetchedIds = useRef(new Set());

  // ── Build a set wide enough to never show a gap, repeat it, then duplicate for the seamless loop ──
  const { loopAds, duration } = useMemo(() => {
    if (!ads || ads.length === 0) return { loopAds: [], duration: 20 };
    const repeatTimes = Math.max(1, Math.ceil(MIN_ITEMS_PER_SET / ads.length));
    const baseSet = Array(repeatTimes).fill(ads).flat();
    return {
      loopAds: [...baseSet, ...baseSet],
      duration: baseSet.length * SECONDS_PER_ITEM,
    };
  }, [ads]);

  const prefetchAd = useCallback((adId) => {
    if (fetchedIds.current.has(adId)) return; // already fetched or in-flight
    fetchedIds.current.add(adId);
    fetch(`${API}/advertisements/${adId}`)
      .then(r => r.json())
      .then(data => setAdCache(prev => ({ ...prev, [adId]: data })))
      .catch(() => { fetchedIds.current.delete(adId); }); // allow retry on failure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API]);

  // ── Reset cache/dedupe when the ad list itself changes ──
  useEffect(() => {
    fetchedIds.current = new Set();
    setAdCache({});
  }, [ads]);



    // ── report height upward so Home can position content/search below it ──
  useEffect(() => {
    if (!containerRef.current || !onHeightChange) return;
    const el = containerRef.current;
    const report = () => onHeightChange(el.getBoundingClientRect().height);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onHeightChange, ads]);

  // ── Observe chips as they scroll through the visible strip window, prefetch on entry ──
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
      {
        root: containerRef.current, // the overflow-hidden strip window, not the whole page
        rootMargin: "0px 200px 0px 0px", // start loading slightly before it's fully visible (entering from left/right)
        threshold: 0,
      }
    );

    const buttons = containerRef.current.querySelectorAll("[data-adid]");
    buttons.forEach(btn => observer.observe(btn));

    return () => observer.disconnect();
  }, [loopAds, prefetchAd]);

  if (!ads || ads.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes ad-strip-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ad-strip-track {
          animation: ad-strip-scroll ${duration}s linear infinite;
        }
        .ad-strip-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div
        ref={containerRef}
        className="fixed left-0 right-0 z-40 bg-gray-50 border-b border-gray-100 overflow-hidden py-2 md:py-3.5"
        style={{ top }}
      >
        <div className="ad-strip-track flex w-max gap-5 sm:gap-7 md:gap-10 px-4">
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
                  <span
                    className="text-[10px] md:text-xs whitespace-nowrap"
                    style={{ color: ad.line2_color }}
                  >
                    {ad.line2_text}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {openAdId && (
        <AdDetailModal
          adId={openAdId}
          initialAd={adCache[openAdId]}
          onClose={() => setOpenAdId(null)}
        />
      )}
    </>
  );
}