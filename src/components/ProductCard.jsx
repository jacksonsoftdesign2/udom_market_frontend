import { useState, useEffect } from "react";
import { FiEye, FiShoppingCart, FiShoppingBag, FiUser, FiHome } from "react-icons/fi";

const daysRemaining = (date) =>
  date ? Math.max(0, 90 - Math.floor((Date.now() - new Date(date).getTime()) / 86400000)) : null;

export default function ProductCard({ item, onClick, onAddToCart, t }) {
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (!item.images || item.images.length <= 1) return;
    const id = setInterval(() => setImgIdx(i => (i + 1) % item.images.length), 2500);
    return () => clearInterval(id);
  }, [item.images]);

  const imgSrc = item.images?.[imgIdx] || item.imageUrl || "/placeholder.png";
  const remaining = daysRemaining(item.listing_date || item.listingDate);
  const isAvailable = item.status === "Available";
  const isLowDays = remaining !== null && remaining <= 10;
  const isLowStock = item.stock <= 5;

  return (
    <div
      className="rounded-xl overflow-hidden bg-white/50 backdrop-blur border border-white/60 shadow hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col cursor-pointer"
      onClick={onClick}
    >
      {/* IMAGE */}
      <div className="relative overflow-hidden h-32">
        <img
          src={imgSrc}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.png"; }}
        />

        {/* Category */}
        <span className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 bg-blue-500 text-white rounded-full font-semibold leading-tight">
          {item.category || "General"}
        </span>

        {/* Status */}
        <span className={`absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold leading-tight ${
          isAvailable ? "bg-green-400 text-white" : "bg-gray-300 text-gray-700"
        }`}>
          {isAvailable ? "Available" : "Unavailable"}
        </span>

        {/* Image dots */}
        {item.images?.length > 1 && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            {item.images.map((_, i) => (
              <span key={i} className={`w-1 h-1 rounded-full ${i === imgIdx ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
        )}

        {/* Trader */}
        {item.trader_name && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
            <p className="text-blue-600 text-[10px] font-bold truncate"><span className="inline-flex items-center gap-0.5">
  <FiUser size={9} />
  <FiHome size={9} />
</span> {item.trader_name}</p>
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="p-2.5 flex flex-col gap-1.5 flex-1">

        {/* Name */}
        <h3 className="font-bold text-xs text-gray-800 truncate leading-tight">{item.name}</h3>

        {/* Price */}
        <p className="text-sm font-extrabold text-blue-700 leading-tight">
          Tsh {item.price ? Number(item.price).toLocaleString() : "—"}
        </p>

        {/* Stats row: days | stock | sold */}
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className={`rounded-lg py-1 px-0.5 ${isLowDays ? "bg-red-50" : "bg-blue-50"}`}>
            <p className={`text-[10px] font-bold leading-tight ${isLowDays ? "text-red-500" : "text-blue-500"}`}>
              {remaining !== null ? `${remaining}d` : "—"}
            </p>
            <p className="text-[9px] text-gray-400 leading-tight">left</p>
          </div>
          <div className={`rounded-lg py-1 px-0.5 ${isLowStock ? "bg-yellow-50" : "bg-green-50"}`}>
            <p className={`text-[10px] font-bold leading-tight ${isLowStock ? "text-yellow-600" : "text-green-600"}`}>
              {item.stock ?? "—"}
            </p>
            <p className="text-[9px] text-gray-400 leading-tight">stock</p>
          </div>
          <div className="rounded-lg py-1 px-0.5 bg-purple-50">
            <p className="text-[10px] font-bold text-purple-600 leading-tight">
              {item.sold ?? item.total_sold ?? 0}
            </p>
            <p className="text-[9px] text-gray-400 leading-tight">sold</p>
          </div>
        </div>

        {/* Location */}
        {item.location && (
          <p className="text-[10px] text-gray-400 truncate">📍 {item.location}</p>
        )}

        {/* BUTTONS */}
        <div className="flex gap-1.5 mt-auto pt-1">
          <button
            onClick={onClick}
            className="flex-1 flex items-center justify-center gap-1 text-[11px] py-1.5 rounded-lg border border-blue-400 text-blue-600 font-semibold hover:bg-blue-50 transition"
          >
            <FiEye size={12} /> View
          </button>
         <button
  onClick={(e) => { e.stopPropagation(); onBuy?.(item); }}
  className="flex-1 flex items-center justify-center gap-1 text-[11px] py-1.5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
>
  <FiShoppingCart size={12} /> Buy
</button>
        </div>
      </div>
    </div>
  );
}
