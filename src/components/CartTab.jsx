import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BuyOptionsModal from "./BuyOptionsModal";
import OrderModal from "./OrderModal";
import ContactModal from "./ContactModal";
import {
  FiShoppingCart, FiPackage, FiAlertTriangle, FiMinus, FiPlus, FiTrash2,
} from "react-icons/fi";
import { getCustomerToken } from "../utils/customerAuth";

const API = import.meta.env.VITE_API_URL;

export default function CartTab({ onCartCountChange }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [buyItem, setBuyItem] = useState(null);
  const [orderItem, setOrderItem] = useState(null);
  const [contactItem, setContactItem] = useState(null);
  const [loadingProductId, setLoadingProductId] = useState(null);

  const fetchCart = () => {
    setCartLoading(true);
    fetch(`${API}/cart`, { headers: { Authorization: `Bearer ${getCustomerToken()}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setCartItems(data);
        onCartCountChange?.(data.length);
      })
      .catch(() => setCartItems([]))
      .finally(() => setCartLoading(false));
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));
    try {
      await fetch(`${API}/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getCustomerToken()}` },
        body: JSON.stringify({ quantity: newQty }),
      });
    } catch {}
  };

  const removeItem = async (itemId) => {
    setCartItems(prev => {
      const updated = prev.filter(i => i.id !== itemId);
      onCartCountChange?.(updated.length);
      return updated;
    });
    try {
      await fetch(`${API}/cart/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getCustomerToken()}` },
      });
    } catch {}
  };

  const openBuyFlow = async (cartItem) => {
    if (cartItem.unavailable) return;
    setLoadingProductId(cartItem.id);
    try {
      const res = await fetch(`${API}/products/public/${cartItem.product_id}`);
      const data = await res.json();
      const product = { ...(data.product || data), __cartItemId: cartItem.id };
      setBuyItem(product);
    } catch {
      alert("Could not load product details");
    } finally {
      setLoadingProductId(null);
    }
  };

  // Called after a successful order — removes that item from the cart automatically
  const handleOrderComplete = async (product) => {
    setOrderItem(null);
    if (product?.__cartItemId) {
      await removeItem(product.__cartItemId);
    }
    fetchCart();
  };

  const cartTotal = cartItems
    .filter(i => !i.unavailable)
    .reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  return (
    <div className="space-y-3">
      {cartLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full" />
        </div>
      ) : cartItems.length === 0 ? (
        <div className="bg-white border border-[#1a3a8f20] rounded-sm shadow-sm p-8 text-center text-gray-400">
          <FiShoppingCart size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-[#1a3a8f20] rounded-sm shadow-sm divide-y divide-gray-100">
            {cartItems.map(item => (
              <div key={item.id} className="p-3">
                <div className="flex items-start gap-3">
                  <div
                    className="w-16 h-16 rounded-sm overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 cursor-pointer relative"
                    onClick={() => item.product_id && navigate(`/product/${item.product_id}`)}
                  >
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiPackage size={20} className="text-gray-300" />
                      </div>
                    )}
                    {item.unavailable && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <FiAlertTriangle size={18} className="text-amber-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold text-gray-800 truncate cursor-pointer"
                      onClick={() => item.product_id && navigate(`/product/${item.product_id}`)}
                    >
                      {item.name}
                    </p>
                    <p className="text-xs font-extrabold text-[#1a3a8f]">
                      Tsh {Number(item.price).toLocaleString()}
                    </p>

                    {item.unavailable && (
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-sm px-1.5 py-0.5 mt-1 w-fit">
                        <FiAlertTriangle size={10} /> No longer available
                      </div>
                    )}

                    {!item.unavailable && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-gray-200 rounded-sm overflow-hidden">
                          <button onClick={() => updateQty(item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                            <FiMinus size={10} />
                          </button>
                          <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                            <FiPlus size={10} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button onClick={() => removeItem(item.id)}
                    className="text-gray-300 hover:text-red-500 transition flex-shrink-0">
                    <FiTrash2 size={15} />
                  </button>
                </div>

                {!item.unavailable && (
                  <button
                    onClick={() => openBuyFlow(item)}
                    disabled={loadingProductId === item.id}
                    className="w-full mt-2 py-1.5 rounded-sm text-xs font-semibold text-white disabled:opacity-50"
                    style={{ background: "#1a3a8f" }}
                  >
                    {loadingProductId === item.id ? "Loading..." : "Order / Buy"}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white border border-[#1a3a8f20] rounded-sm shadow-sm p-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">Total ({cartItems.filter(i => !i.unavailable).length} items)</span>
            <span className="text-lg font-black text-[#1a3a8f]">Tsh {cartTotal.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-gray-400 text-center px-4">
            Items from different traders are ordered separately. Tap "Order / Buy" on each item to proceed.
          </p>
        </>
      )}

      {buyItem && (
        <BuyOptionsModal
          product={buyItem}
          onClose={() => setBuyItem(null)}
          onOrder={() => { setOrderItem(buyItem); setBuyItem(null); }}
          onContact={() => { setContactItem(buyItem); setBuyItem(null); }}
        />
      )}
      {orderItem && (
        <OrderModal
          product={orderItem}
          onClose={() => handleOrderComplete(orderItem)}
          onContact={() => { setOrderItem(null); setContactItem(orderItem); }}
        />
      )}

      {orderItem && (
  <OrderModal
    product={orderItem}
    onClose={() => setOrderItem(null)}
    onSuccess={() => handleOrderComplete(orderItem)}
    onContact={() => { setOrderItem(null); setContactItem(orderItem); }}
  />
)}
      {contactItem && <ContactModal product={contactItem} onClose={() => setContactItem(null)} />}
    </div>
  );
}