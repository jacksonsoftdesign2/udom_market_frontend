export default function ContactModal({ product, onClose }) {
  const phone = product.trader_phone || "";
  const email = product.trader_email || "";
  const whatsapp = phone.replace(/\D/g, "").replace(/^0/, "255");
  const mapsUrl = product.trader_lat && product.trader_lng
    ? `https://maps.google.com/?q=${product.trader_lat},${product.trader_lng}`
    : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-base">Contact Trader</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* Trader profile */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
            {product.trader_image ? (
              <img src={product.trader_image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-blue-100" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-black text-blue-600">
                {product.trader_name?.charAt(0).toUpperCase() || "T"}
              </div>
            )}
            <div>
              <p className="font-bold text-gray-800">{product.trader_name || "Trader"}</p>
              {email && <p className="text-xs text-gray-400">{email}</p>}
              {phone && <p className="text-xs text-gray-400">{phone}</p>}
            </div>
          </div>

          {/* Call */}
          {phone && (
            <a href={`tel:${phone}`}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 transition border border-blue-100">
              <span className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.07 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                </svg>
              </span>
              <div>
                <p className="font-semibold text-blue-800 text-sm">Call Trader</p>
                <p className="text-xs text-blue-500">{phone}</p>
              </div>
            </a>
          )}

          {/* WhatsApp */}
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-green-50 hover:bg-green-100 transition border border-green-100">
              <span className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </span>
              <div>
                <p className="font-semibold text-green-800 text-sm">WhatsApp</p>
                <p className="text-xs text-green-600">Chat instantly</p>
              </div>
            </a>
          )}

          {/* Email */}
          {email && (
            <a href={`mailto:${email}`}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-purple-50 hover:bg-purple-100 transition border border-purple-100">
              <span className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <div>
                <p className="font-semibold text-purple-800 text-sm">Email Trader</p>
                <p className="text-xs text-purple-500">{email}</p>
              </div>
            </a>
          )}

          {/* Map */}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-orange-50 hover:bg-orange-100 transition border border-orange-100">
              <span className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              <div>
                <p className="font-semibold text-orange-800 text-sm">View on Map</p>
                <p className="text-xs text-orange-500">Open in Google Maps</p>
              </div>
            </a>
          )}

          {/* Cancel */}
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}