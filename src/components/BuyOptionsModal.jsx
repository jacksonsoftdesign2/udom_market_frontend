export default function BuyOptionsModal({ product, onClose, onOrder, onContact }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-green-500 text-base">WELCOME WARMLY</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <button onClick={onOrder}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition">
            <span className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-lg">🛒</span>
            Add Order
          </button>
          <button onClick={onContact}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-green-50 text-green-700 font-semibold text-sm hover:bg-green-100 transition">
            <span className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-lg">💬</span>
            Contact {product.trader_name || "Trader"}
          </button>
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
