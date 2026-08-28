import { useState, useEffect, useMemo } from "react";
import AdDetailModal from "./AdDetailModal";

const MIN_ITEMS_PER_SET = 12; // ensures the strip never runs dry, even with 1-2 ads
const SECONDS_PER_ITEM = 3;   // keeps scroll SPEED constant regardless of ad count

export default function AdStrip({ ads }) {
  const [openAdId, setOpenAdId] = useState(null);
  const [adCache, setAdCache] = useState({});
  const API = import.meta.env.VITE_API_URL;

  // ── Prefetch full detail for every ad as soon as the strip mounts ──
  useEffect(() => {
    if (!ads || ads.length === 0) return;
    ads.forEach(ad => {
      fetch(`${API}/advertisements/${ad.id}`)
        .then(r => r.json())
        .then(data => setAdCache(prev => ({ ...prev, [ad.id]: data })))
        .catch(() => {}); // silently ignore — modal will just fall back to its own fetch
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ads]);

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

      <div className="mb-5 rounded-[4px] bg-gray-50 border border-gray-100 overflow-hidden py-2 md:py-3.5">
        <div className="ad-strip-track flex w-max gap-5 sm:gap-7 md:gap-10 px-4">
          {loopAds.map((ad, i) => (
            <button
              key={`${ad.id}-${i}`}
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