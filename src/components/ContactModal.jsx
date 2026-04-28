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
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">✕</button>
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
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition">
              <span className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-lg">📞</span>
              Call {phone}
            </a>
          )}

          {/* WhatsApp */}
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-green-50 text-green-700 font-semibold text-sm hover:bg-green-100 transition">
              <span className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-lg">💬</span>
              WhatsApp
            </a>
          )}

          {/* Email */}
          {email && (
            <a href={`mailto:${email}`}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-purple-50 text-purple-700 font-semibold text-sm hover:bg-purple-100 transition">
              <span className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-lg">✉️</span>
              Email Trader
            </a>
          )}

          {/* Map */}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-orange-50 text-orange-700 font-semibold text-sm hover:bg-orange-100 transition">
              <span className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-lg">📍</span>
              View on Map
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
