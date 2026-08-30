import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCustomerToken, isCustomerLoggedIn } from "../utils/customerAuth";

const API = import.meta.env.VITE_API_URL;

export default function ProductGrid({ items, t, onAddToCart, onBuy, onRequireLogin }) {
  const navigate = useNavigate();
  const [likedIds, setLikedIds] = useState(new Set());

  useEffect(() => {
    if (!isCustomerLoggedIn()) return;
    fetch(`${API}/products/my-likes`, {
      headers: { Authorization: `Bearer ${getCustomerToken()}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(ids => setLikedIds(new Set(ids)))
      .catch(() => {});
  }, []);

  const handleToggleLike = async (productId) => {
    if (!isCustomerLoggedIn()) {
      onRequireLogin?.();
      return;
    }
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
    try {
      const res = await fetch(`${API}/products/${productId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getCustomerToken()}` },
      });
      const data = await res.json();
      setLikedIds(prev => {
        const next = new Set(prev);
        data.liked ? next.add(productId) : next.delete(productId);
        return next;
      });
    } catch {
      setLikedIds(prev => {
        const next = new Set(prev);
        next.has(productId) ? next.delete(productId) : next.add(productId);
        return next;
      });
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-4xl mb-3">🛍️</p>
        <p className="font-semibold text-lg">No products found</p>
        <p className="text-sm mt-1">Try a different search or category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
      {items.map((item, i) => (
        <ProductCard
          key={item.id || i}
          item={item}
          t={t}
          onAddToCart={onAddToCart}
          onBuy={() => onBuy?.(item)}
          onClick={() => navigate(`/product/${item.id || item.name}`)}
          isLiked={likedIds.has(item.id)}
          onToggleLike={handleToggleLike}
        />
      ))}
    </div>
  );
}