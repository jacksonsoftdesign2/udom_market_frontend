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
        className="bg-white rounded-[8px] shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-base">Contact Trader</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-[4px] bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-2">

          {/* Trader profile */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-[4px] px-3 py-2">
            {product.trader_image ? (
              <img src={product.trader_image} alt="" className="w-10 h-10 rounded-[4px] object-cover border-2 border-blue-100" />
            ) : (
              <div className="w-10 h-10 rounded-[4px] bg-[#e8f0fb] flex items-center justify-center text-lg font-black text-[#1a56db]">
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
              className="flex items-center gap-3 w-full px-3 py-2 rounded-[4px] hover:bg-[#dce8fa] transition border border-[#c0d4f5]"
              style={{ background: '#e8f0fb' }}>
              <span className="w-8 h-8 rounded-[4px] bg-[#1a56db] flex items-center justify-center flex-shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.07 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                </svg>
              </span>
              <div>
                <p className="font-semibold text-[#1a3a70] text-sm">Call Trader</p>
                <p className="text-xs text-[#1a56db]">{phone}</p>
              </div>
            </a>
          )}

          {/* SMS */}
          {phone && (
            <a href={`sms:${phone}`}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-[4px] hover:bg-[#dce8fa] transition border border-[#c0d4f5]"
              style={{ background: '#e8f0fb' }}>
              <span className="w-8 h-8 rounded-[4px] bg-[#1a56db] flex items-center justify-center flex-shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </span>
              <div>
                <p className="font-semibold text-[#1a3a70] text-sm">SMS</p>
                <p className="text-xs text-[#1a56db]">{phone}</p>
              </div>
            </a>
          )}

          {/* WhatsApp */}
          {whatsapp && (
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-3 py-2 rounded-[4px] hover:bg-[#d4eddf] transition border border-[#a8d9bc]"
              style={{ background: '#e6f4ec' }}>
              <span className="w-8 h-8 rounded-[4px] bg-[#25D366] flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </span>
              <div>
                <p className="font-semibold text-[#145a2e] text-sm">WhatsApp</p>
                <p className="text-xs text-[#1a8f4e]">Chat instantly</p>
              </div>
            </a>
          )}

          {/* Email */}
          {email && (
            <a href={`mailto:${email}`}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-[4px] hover:bg-[#ede8fa] transition border border-[#c4b5f4]"
              style={{ background: '#f3f0fd' }}>
              <span className="w-8 h-8 rounded-[4px] bg-[#7c3aed] flex items-center justify-center flex-shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </span>
              <div>
                <p className="font-semibold text-[#3b1f7a] text-sm">Email Trader</p>
                <p className="text-xs text-[#7c3aed]">{email}</p>
              </div>
            </a>
          )}

          {/* Map */}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-3 py-2 rounded-[4px] hover:bg-[#fde8d0] transition border border-[#fbc89a]"
              style={{ background: '#fef0e3' }}>
              <span className="w-8 h-8 rounded-[4px] bg-[#ea6c00] flex items-center justify-center flex-shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
              <div>
                <p className="font-semibold text-[#7a3300] text-sm">View on Map</p>
                <p className="text-xs text-[#ea6c00]">Open in Google Maps</p>
              </div>
            </a>
          )}

          {/* Cancel */}
          <button onClick={onClose}
            className="w-full py-2.5 rounded-[4px] bg-[#1a56db] hover:bg-[#1648c0] text-white font-semibold text-sm transition">
            Cancel
          </button>

        </div>
      </div>
    </div>
  );
}
