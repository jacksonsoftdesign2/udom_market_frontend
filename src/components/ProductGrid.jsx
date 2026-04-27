import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";

export default function ProductGrid({ items, t, onAddToCart }) {
  const navigate = useNavigate();

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
  onBuy={() => navigate(`/product/${item.id || item.name}?order=1`)}
  onClick={() => navigate(`/product/${item.id || item.name}`)}
/>
      ))}
    </div>
  );
}
