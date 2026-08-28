import { useState, useEffect } from "react";
import { FiX, FiMapPin, FiCalendar, FiClock } from "react-icons/fi";

export default function AdDetailModal({ adId, onClose, initialAd = null }) {
  const [ad, setAd] = useState(initialAd);
  const [loading, setLoading] = useState(!initialAd);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (initialAd) {
      setAd(initialAd);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${API}/advertisements/${adId}`)
      .then(r => r.json())
      .then(data => setAd(data))
      .catch(() => setAd(null))
      .finally(() => setLoading(false));
  }, [adId, initialAd]);


  return (
    <div
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-[8px] md:rounded-[8px] w-full md:max-w-sm max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1 md:hidden" />

        <div className="flex justify-end px-4 pt-3 md:pt-4">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-400 text-sm">Loading...</div>
        ) : !ad ? (
          <div className="p-6 text-center text-gray-400 text-sm">Could not load this advertisement.</div>
        ) : (
          <div className="pb-6">
            {/* Gallery */}
            {ad.images?.length > 0 && (
              <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
                {ad.images.map(img => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt=""
                    className="w-28 h-20 object-cover rounded-[4px] flex-shrink-0 border border-gray-100"
                  />
                ))}
              </div>
            )}

            <div className="px-5 pt-2">
              <div className="flex items-center gap-3 mb-3">
                <img src={ad.icon_url} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                <div>
                  <p
                    className="text-lg font-medium leading-tight"
                    style={{ color: ad.line1_color, textShadow: "1px 1px 0 rgba(0,0,0,0.12)" }}
                  >
                    {ad.line1_text}
                  </p>
                  {ad.line2_text && (
                    <p className="text-sm" style={{ color: ad.line2_color }}>{ad.line2_text}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mb-3">
                {(ad.start_date || ad.end_date) && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FiCalendar size={13} />
                    {ad.start_date ? new Date(ad.start_date).toLocaleDateString() : "—"}
                    {" – "}
                    {ad.end_date ? new Date(ad.end_date).toLocaleDateString() : "No end date"}
                  </div>
                )}
                {ad.location && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <FiMapPin size={13} /> {ad.location}
                  </div>
                )}
                {ad.end_date && (
                  <div className="flex items-center gap-2 text-xs text-red-500">
                    <FiClock size={13} /> Ends {new Date(ad.end_date).toLocaleDateString()}
                  </div>
                )}
              </div>

              {ad.description && (
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{ad.description}</p>
              )}

              {ad.link_url && (
                
                 <a href={ad.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2.5 rounded-[4px] text-sm font-semibold text-[#F5C518]"
                  style={{ background: "#1a3a8f" }}
                >
                  Angalia zaidi
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}