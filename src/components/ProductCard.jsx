import { FiEye, FiShoppingCart, FiShoppingBag, FiUser, FiHome } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { supportsAVIF, pickSrc } from "../utils/imageUtils";
import { useDwellTracking } from "../hooks/useProductEngagement";
import { formatViews } from "../utils/formatters";

const API = import.meta.env.VITE_API_URL;

const daysRemaining = (date) =>
  date ? Math.max(0, 90 - Math.floor((Date.now() - new Date(date).getTime()) / 86400000)) : null;



export default function ProductCard({ item, onClick, onAddToCart, onBuy, t }) {
  const [imgIdx, setImgIdx] = useState(0);
  const avifRef = useRef(null);
  useEffect(() => { supportsAVIF().then(v => { avifRef.current = v; }); }, []);

  const { elementRef, recordClick } = useDwellTracking(item.id, API);

  const imgRow = item.images?.[0];
  const imgSrc = typeof imgRow === 'object'
    ? pickSrc(imgRow, 'thumb', avifRef.current)
    : (imgRow || item.imageUrl || null);
  const remaining = daysRemaining(item.listing_date || item.listingDate);
  const isAvailable = item.status === "Available";
  const isLowDays = remaining !== null && remaining <= 10;
  const isLowStock = item.stock <= 5;

  const handleClick = () => {
    recordClick();
    onClick?.();
  };

  return (
    <div
      ref={elementRef}
      className="rounded-sm overflow-hidden bg-white border border-[#1a3a8f50] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
      onClick={handleClick}
      onMouseEnter={() => {
        if (!item.images?.length) return;
        requestIdleCallback(() => {
          item.images.forEach((img, i) => {
            if (!img) return;
            const size = i === 0 ? 'medium' : 'thumb';
            const src = typeof img === 'object' ? pickSrc(img, size, avifRef.current) : img;
            if (src) new Image().src = src;
          });
        });
      }}
    >
      {/* IMAGE */}
     <div className="relative overflow-hidden h-44 bg-gray-100">
  {imgSrc ? (
    <img
      src={imgSrc}
      alt={item.name}
      className="w-full h-full object-contain"
      onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
    />
  ) : (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
      <FiShoppingBag size={28} />
      <p className="text-[10px] mt-1 text-gray-400">No image</p>
    </div>
  )}

        {/* Category */}
        <span className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 bg-[#1a3a8f] text-white rounded-sm font-semibold leading-tight">
          {item.category || "General"}
        </span>

        {/* Status */}
        <span className={`absolute top-1.5 right-1.5 text-[10px] px-1.5 py-0.5 rounded-sm font-semibold leading-tight ${
        isAvailable ? "bg-[#16a34a] text-white" : "bg-gray-300 text-gray-700"
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
            <p className="text-[#F5C518] text-[10px] font-bold truncate"><span className="inline-flex items-center gap-0.5">
  <FiUser size={9} />
  <FiHome size={9} />
</span> {item.trader_name}</p>
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="p-2 flex flex-col gap-1 flex-1">

        {/* Name */}
        <h3 className="font-bold text-xs text-[#1a3a8f] truncate leading-tight">{item.name}</h3>

        {/* Description */}
        <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight min-h-[24px]">
          {item.description || "No description available"}
        </p>

        {/* Price + Views */}
        <div className="flex items-center justify-between gap-1">
          <p className="text-sm font-extrabold text-[#F5C518] leading-tight">
            Tsh {item.price ? Number(item.price).toLocaleString() : "—"}
          </p>
          {item.view_count_90d > 0 && (
            <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-bold leading-tight bg-blue-100 text-blue-600 flex-shrink-0">
              <FiEye size={9} /> {formatViews(item.view_count_90d)}
            </span>
          )}
        </div>

        {/* Stats row: days | stock | sold */}
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="rounded-sm py-0.5 px-0.5 bg-[#e8edf7]">
          <p className={`text-[10px] font-bold leading-tight ${isLowDays ? "text-red-500" : "text-[#1a3a8f]"}`}>
              {remaining !== null ? `${remaining}` : "—"}
            </p>
            <p className="text-[9px] text-gray-400 leading-tight">days left</p>
          </div>
          <div className="rounded-sm py-0.5 px-0.5 bg-[#e8edf7]">
          <p className={`text-[10px] font-bold leading-tight ${isLowStock ? "text-yellow-600" : "text-[#16a34a]"}`}>
              {item.stock ?? "—"}
            </p>
            <p className="text-[9px] text-gray-400 leading-tight">stock</p>
          </div>
          <div className="rounded-sm py-0.5 px-0.5 bg-[#e8edf7]">
          <p className="text-[10px] font-bold text-[#1a3a8f] leading-tight">
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
        <div className="flex gap-1 mt-auto pt-0.5">
          <button
            onClick={handleClick}
            className="flex-1 flex items-center justify-center gap-1 text-[11px] py-1 rounded-sm border border-[#1a3a8f] text-[#1a3a8f] font-semibold hover:bg-[#e8edf7] transition"
          >
            <FiEye size={12} /> View
          </button>
     <button
  onClick={(e) => { e.stopPropagation(); onBuy?.(item); }}
  className="flex-1 flex items-center justify-center gap-1 text-[11px] py-1 rounded-sm bg-[#1a3a8f] text-[#F5C518] font-semibold hover:bg-[#0f2460] transition"
>
  <FiShoppingCart size={12} /> Buy
</button>
        </div>
      </div>
    </div>
  );
}
