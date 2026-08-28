import { useState, useEffect } from "react";
import AdDetailModal from "./AdDetailModal";

export default function AdStrip({ ads }) {
  const [openAdId, setOpenAdId] = useState(null);

  // Duplicate the list so the marquee loops seamlessly
  const loopAds = [...ads, ...ads];

  return (
    <>
      <style>{`
        @keyframes ad-strip-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ad-strip-track {
          animation: ad-strip-scroll 25s linear infinite;
        }
        .ad-strip-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="mb-5 rounded-[4px] bg-gray-50 border border-gray-100 overflow-hidden py-2.5">
        <div className="ad-strip-track flex w-max gap-7 px-4">
          {loopAds.map((ad, i) => (
            <button
              key={`${ad.id}-${i}`}
              onClick={() => setOpenAdId(ad.id)}
              className="flex items-center gap-2 flex-shrink-0 cursor-pointer"
            >
              <img
                src={ad.icon_url}
                alt=""
                className="w-7 h-7 rounded-full object-cover border border-gray-200 flex-shrink-0"
              />
              <div className="flex flex-col leading-tight text-left">
                <span
                  className="text-[13px] font-medium whitespace-nowrap"
                  style={{ color: ad.line1_color, textShadow: "1px 1px 0 rgba(0,0,0,0.12)" }}
                >
                  {ad.line1_text}
                </span>
                {ad.line2_text && (
                  <span
                    className="text-[10px] whitespace-nowrap"
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
        <AdDetailModal adId={openAdId} onClose={() => setOpenAdId(null)} />
      )}
    </>
  );
}