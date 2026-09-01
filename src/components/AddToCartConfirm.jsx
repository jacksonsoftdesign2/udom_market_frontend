import { FiShoppingCart, FiX } from "react-icons/fi";

export default function AddToCartConfirm({ product, onConfirm, onClose, adding }) {
  return (
    <div
      className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-[8px] sm:rounded-[8px] w-full max-w-sm p-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-1 pb-2 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-sm bg-[#e8edf7] flex items-center justify-center flex-shrink-0">
            <FiShoppingCart size={20} className="text-[#1a3a8f]" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-800 text-sm truncate">{product.name}</p>
            <p className="text-xs text-[#F5C518] font-extrabold">
              Tsh {Number(product.price).toLocaleString()}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-5">Add this item to your cart?</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-sm border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={adding}
            className="flex-1 py-2.5 rounded-sm text-sm font-semibold text-[#F5C518] disabled:opacity-60 transition"
            style={{ background: "#1a3a8f" }}
          >
            {adding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}