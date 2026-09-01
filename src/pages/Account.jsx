import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CustomerAuthModal from "../components/CustomerAuthModal";
import CartTab from "../components/CartTab";
import {
  FiUser, FiHeart, FiPackage, FiSettings, FiHelpCircle,
  FiX, FiShoppingBag, FiShoppingCart,
  FiLogOut,
} from "react-icons/fi";
import {
  getCustomerToken, getCustomerData, isCustomerLoggedIn, clearCustomerSession,
} from "../utils/customerAuth";

const API = import.meta.env.VITE_API_URL;

const ORDER_STATUS_META = {
  pending:   { label: "Pending",   color: "text-amber-600 bg-amber-50" },
  confirmed: { label: "Confirmed", color: "text-blue-600 bg-blue-50" },
  delivered: { label: "Delivered", color: "text-green-600 bg-green-50" },
  cancelled: { label: "Cancelled", color: "text-red-600 bg-red-50" },
};

export default function Account() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isCustomerLoggedIn());
  const [customer, setCustomer] = useState(getCustomerData());
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "cart" | "wishlist" | "settings" | "help"

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [likedProducts, setLikedProducts] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!loggedIn) return;
    if (activeTab === "orders") {
      setOrdersLoading(true);
      fetch(`${API}/orders/my-customer-orders`, {
        headers: { Authorization: `Bearer ${getCustomerToken()}` },
      })
        .then(r => r.ok ? r.json() : [])
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
    if (activeTab === "wishlist") {
      setWishlistLoading(true);
      fetch(`${API}/products/my-likes`, {
        headers: { Authorization: `Bearer ${getCustomerToken()}` },
      })
        .then(r => r.ok ? r.json() : [])
        .then(async (ids) => {
          if (ids.length === 0) return setLikedProducts([]);
          const results = await Promise.all(
            ids.map(id => fetch(`${API}/products/public/${id}`).then(r => r.ok ? r.json() : null).catch(() => null))
          );
          setLikedProducts(results.filter(Boolean).map(r => r.product || r));
        })
        .catch(() => setLikedProducts([]))
        .finally(() => setWishlistLoading(false));
    }
  }, [activeTab, loggedIn]);

  // ── Load cart count on mount so the badge shows even before opening the tab ──
  useEffect(() => {
    if (!loggedIn) return;
    fetch(`${API}/cart`, { headers: { Authorization: `Bearer ${getCustomerToken()}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setCartCount(data.length))
      .catch(() => {});
  }, [loggedIn]);

  const removeFromWishlist = async (productId) => {
    setLikedProducts(prev => prev.filter(p => p.id !== productId));
    try {
      await fetch(`${API}/products/${productId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getCustomerToken()}` },
      });
    } catch {}
  };

  const handleLogout = () => {
    clearCustomerSession();
    setLoggedIn(false);
    setCustomer(null);
  };

  const handleAuthSuccess = (c) => {
    setLoggedIn(true);
    setCustomer(c);
    setShowAuth(false);
  };

  const orderCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="relative min-h-screen text-gray-800">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-white via-blue-50 to-white" />
      <Header onBackClick={() => navigate(-1)} onHomeClick={() => navigate("/")} />

      <div className="pt-24 pb-12 px-3 md:px-6 max-w-3xl mx-auto">

        {/* ── Identity card ── */}
        <div className="bg-white border border-[#1a3a8f20] rounded-sm shadow-sm p-4 mb-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[#e8edf7] flex items-center justify-center flex-shrink-0">
            <FiUser size={24} className="text-[#1a3a8f]" />
          </div>
          <div className="flex-1 min-w-0">
            {loggedIn ? (
              <>
                <p className="font-bold text-gray-800 truncate">{customer?.name || "Welcome back"}</p>
                <p className="text-xs text-gray-400 truncate">{customer?.email || customer?.phone}</p>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)} className="font-bold text-[#1a3a8f]">
                Sign In / Register
              </button>
            )}
          </div>
          {loggedIn && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-sm hover:bg-red-50 transition flex-shrink-0"
            >
              <FiLogOut size={12} /> Logout
            </button>
          )}
        </div>

        {!loggedIn ? (
          <div className="bg-white border border-[#1a3a8f20] rounded-sm shadow-sm p-8 text-center text-gray-400">
            <FiUser size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Sign in to see your orders and wishlist.</p>
          </div>
        ) : (
          <>
            {/* ── Tabs ── */}
            <div className="bg-white border border-[#1a3a8f20] rounded-sm shadow-sm overflow-hidden mb-4">
              <div className="flex border-b border-gray-100 overflow-x-auto">
                {[
                  { key: "orders", label: "My Orders", icon: <FiPackage size={14} /> },
                  { key: "cart", label: "Cart", icon: <FiShoppingCart size={14} />, badge: cartCount },
                  { key: "wishlist", label: "Wish List", icon: <FiHeart size={14} /> },
                  { key: "settings", label: "Settings", icon: <FiSettings size={14} /> },
                  { key: "help", label: "Help", icon: <FiHelpCircle size={14} /> },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition relative whitespace-nowrap px-2 ${
                      activeTab === tab.key
                        ? "bg-[#1a3a8f] text-[#F5C518]"
                        : "text-gray-500 hover:bg-[#e8edf7]"
                    }`}
                  >
                    {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
                    {tab.badge > 0 && (
                      <span className={`absolute top-1.5 right-2 sm:relative sm:top-0 sm:right-0 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center
                        ${activeTab === tab.key ? "bg-[#F5C518] text-[#1a3a8f]" : "bg-red-500 text-white"}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ── My Orders tab ── */}
            {activeTab === "orders" && (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {["pending", "confirmed", "delivered", "cancelled"].map(status => (
                    <div key={status} className={`rounded-sm py-2 text-center ${ORDER_STATUS_META[status].color}`}>
                      <p className="text-lg font-black">{orderCounts[status] || 0}</p>
                      <p className="text-[10px] font-semibold">{ORDER_STATUS_META[status].label}</p>
                    </div>
                  ))}
                </div>

                {ordersLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white border border-[#1a3a8f20] rounded-sm shadow-sm p-8 text-center text-gray-400">
                    <FiShoppingBag size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No orders yet</p>
                  </div>
                ) : (
                  <div className="bg-white border border-[#1a3a8f20] rounded-sm shadow-sm divide-y divide-gray-100">
                    {orders.map(o => (
                      <div key={o.id} className="flex items-center gap-3 p-3">
                        <div className="w-12 h-12 rounded-sm overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                          {o.thumb ? (
                            <img src={o.thumb} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiPackage size={16} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">{o.product_name}</p>
                          <p className="text-xs text-gray-400">Qty: {o.quantity} · Tsh {Number(o.total_price).toLocaleString()}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${ORDER_STATUS_META[o.status]?.color || "bg-gray-50 text-gray-500"}`}>
                          {ORDER_STATUS_META[o.status]?.label || o.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Cart tab ── */}
            {activeTab === "cart" && (
              <CartTab onCartCountChange={setCartCount} />
            )}

            {/* ── Wish List tab ── */}
            {activeTab === "wishlist" && (
              <div>
                {wishlistLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full" />
                  </div>
                ) : likedProducts.length === 0 ? (
                  <div className="bg-white border border-[#1a3a8f20] rounded-sm shadow-sm p-8 text-center text-gray-400">
                    <FiHeart size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No liked products yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {likedProducts.map(p => (
                      <div key={p.id} className="bg-white border border-[#1a3a8f20] rounded-sm shadow-sm overflow-hidden relative">
                        <button
                          onClick={() => removeFromWishlist(p.id)}
                          className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center shadow-sm"
                        >
                          <FiX size={13} className="text-red-500" />
                        </button>
                        <div
                          className="h-28 bg-gray-100 cursor-pointer"
                          onClick={() => navigate(`/product/${p.id}`)}
                        >
                          {p.images?.[0] && (
                            <img
                              src={typeof p.images[0] === "object" ? p.images[0].thumb_webp || p.images[0].image_url : p.images[0]}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                          <p className="text-xs font-extrabold text-[#F5C518]">Tsh {Number(p.price || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Settings tab ── */}
            {activeTab === "settings" && (
              <div className="bg-white border border-[#1a3a8f20] rounded-sm shadow-sm p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">App Settings</p>
                <p className="text-sm text-gray-500">Language and other app preferences will appear here.</p>
              </div>
            )}

            {/* ── Help tab — placeholder ── */}
            {activeTab === "help" && (
              <div className="bg-white border border-[#1a3a8f20] rounded-sm shadow-sm p-8 text-center text-gray-400">
                <FiHelpCircle size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold text-gray-500">Help Center</p>
                <p className="text-xs mt-1">Coming soon</p>
              </div>
            )}
          </>
        )}
      </div>

      {showAuth && (
        <CustomerAuthModal onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />
      )}

      <Footer />
    </div>
  );
}