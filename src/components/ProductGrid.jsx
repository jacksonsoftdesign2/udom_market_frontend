import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";

export default function ProductGrid({ items, t }) {
  const navigate = useNavigate();

  return (
    <div className="grid  md:grid-cols-2 lg:grid-cols-3 gap-5 gap-y-6 sm:grid-cols-1 p-4 text-center ">
      {items.map((item, i) => (
        <ProductCard
          key={i}
          item={item}
          t={t}
          onClick={() => navigate(`/product/${item.name}`)}
        />
      ))}
    </div>
  );
}