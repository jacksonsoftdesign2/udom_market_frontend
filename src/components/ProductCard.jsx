export default function ProductCard({ item, onClick, onAddToCart, t }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/40 backdrop-blur-lg border border-white/50 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">

      {/* IMAGE */}
      <div className="relative cursor-pointer" onClick={onClick}>
        <img
          src={item.imageUrl || item.images?.[0] || "/placeholder.png"}
          alt={item.name}
          className="w-full h-44 object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.png"; }}
        />

        {/* CATEGORY BADGE */}
        <span className="absolute top-2 left-2 text-xs px-2 py-1 bg-blue-500 text-white rounded-full shadow font-medium">
          {item.category || "General"}
        </span>

        {/* STATUS BADGE */}
        <span className="absolute top-2 right-2 text-xs px-2 py-1 bg-yellow-400 text-black rounded-full shadow font-medium">
          {item.status || t?.available || "Available"}
        </span>

        {/* TRADER badge */}
        {item.trader_name && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
            <p className="text-white text-xs font-medium truncate">🏪 {item.trader_name}</p>
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-sm text-gray-800 truncate">{item.name}</h3>

        <p className="text-base font-bold text-blue-700">
          Tsh {item.price ? Number(item.price).toLocaleString() : "—"}
        </p>

        {item.location && (
          <p className="text-xs text-gray-500 truncate">📍 {item.location}</p>
        )}

        {/* BUTTONS */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={onClick}
            className="flex-1 text-xs py-2 rounded-xl border border-blue-400 text-blue-600 font-semibold hover:bg-blue-50 transition"
          >
            👁 View
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart?.(item); }}
            className="flex-1 text-xs py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
          >
            🛒 Add
          </button>
        </div>
      </div>
    </div>
  );
}
