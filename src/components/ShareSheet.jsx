import { useState } from "react";
import { getProductUrl, getShareText } from "../utils/shareUtils";

const SHARE_APPS = [
  {
    id: "whatsapp", label: "WhatsApp", color: "#25D366",
    icon: <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.523 5.847L0 24l6.335-1.507A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.79 9.79 0 01-5.012-1.376l-.36-.214-3.727.887.936-3.617-.235-.372A9.789 9.789 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/></svg>,
  },
  {
    id: "telegram", label: "Telegram", color: "#229ED9",
    icon: <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
  },
  {
    id: "facebook", label: "Facebook", color: "#1877F2",
    icon: <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  },
  {
    id: "twitter", label: "X / Twitter", color: "#000000",
    icon: <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
  {
    id: "sms", label: "SMS", color: "#34C759",
    icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    id: "gmail", label: "Gmail", color: "#EA4335",
    icon: <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>,
  },
];

export default function ShareSheet({ product, images, activeImg, cardBlob, cardPreview, isGenerating, onClose }) {
  const [copied, setCopied] = useState(false);

  const shareViaApp = (appId) => {
    const text = encodeURIComponent(getShareText(product));
    const url = encodeURIComponent(getProductUrl(product.id));
    const urls = {
      whatsapp: `https://wa.me/?text=${text}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}`,
      sms: `sms:?body=${text}`,
      gmail: `mailto:?subject=${encodeURIComponent(product.name)}&body=${text}`,
    };
    window.open(urls[appId], "_blank");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(getProductUrl(product.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerNativeShare = async () => {
    if (!navigator.share) return;
    try {
      if (cardBlob && navigator.canShare?.({ files: [new File([cardBlob], "product.jpg", { type: "image/jpeg" })] })) {
        await navigator.share({
          title: product.name,
          text: getShareText(product),
          files: [new File([cardBlob], "product.jpg", { type: "image/jpeg" })],
        });
      } else {
        await navigator.share({
          title: product.name,
          text: getShareText(product),
          url: getProductUrl(product.id),
        });
      }
    } catch (e) {
      if (e.name !== "AbortError") console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[10002] flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        id="share-sheet"
        className="relative bg-white rounded-t-2xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
        style={{ animation: "slideUp 0.25s ease" }}
      >
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <p className="font-semibold text-gray-800 text-sm">Share product</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* Card preview */}
          <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center" style={{ minHeight: 180 }}>
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <div className="w-8 h-8 border-4 border-[#1a2e6e] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-400">Generating share card...</p>
              </div>
            ) : cardPreview ? (
              <img src={cardPreview} alt="Share card" className="w-full object-cover rounded-xl" />
            ) : (
              <p className="text-xs text-gray-400 py-8">Card unavailable</p>
            )}
          </div>

          {/* Copy link row */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <span className="text-xs text-gray-500 flex-1 truncate">{getProductUrl(product.id)}</span>
            <button
              onClick={copyLink}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${
                copied ? "bg-green-500 text-white" : "bg-[#1a2e6e] text-[#F5C518]"
              }`}
            >
              {copied ? (
                <><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>Copied</>
              ) : (
                <><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy</>
              )}
            </button>
          </div>

          {/* App grid */}
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Share via</p>
            <div className="grid grid-cols-4 gap-y-4 gap-x-2">
              {SHARE_APPS.map(({ id, label, color, icon }) => (
                <button
                  key={id}
                  onClick={() => shareViaApp(id)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm active:scale-95 transition-transform"
                    style={{ background: color }}
                  >
                    {icon}
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">{label}</span>
                </button>
              ))}

              {/* More — native share, mobile only */}
              {navigator.share && (
                <button onClick={triggerNativeShare} className="flex flex-col items-center gap-1.5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm bg-[#1a2e6e] active:scale-95 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">More</span>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="pb-6" />
      </div>
    </div>
  );
}