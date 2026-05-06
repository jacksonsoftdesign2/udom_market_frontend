// src/pages/TraderOrders.jsx
// Features:
//  ✅ Shows all orders for the logged-in trader
//  ✅ On page load → popup if there are pending orders
//  ✅ Real-time: polls every 20s for new orders, shows notification badge
//  ✅ Each order shows customer location + Google Maps link (if lat/lng available)
//  ✅ Approve order by: SMS (opens SMS app), Call (dials phone), Email (opens mail)
//  ✅ Update order status (pending → confirmed → delivered / cancelled)
//  ✅ Filter by status

import { useState, useEffect, useRef, useCallback } from "react";

const API = import.meta.env.VITE_API_URL;

// ── Status badge colors ──
const STATUS_COLORS = {
  pending:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-600 border-red-200",
};

const STATUS_LABELS = {
  pending:   "⏳ Pending",
  confirmed: "✅ Confirmed",
  delivered: "📦 Delivered",
  cancelled: "❌ Cancelled",
};

// ── Relative time ──
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Google Maps link from lat/lng or address string ──
function mapsLink(order) {
  if (order.customer_latitude && order.customer_longitude) {
    return `https://www.google.com/maps?q=${order.customer_latitude},${order.customer_longitude}`;
  }
  if (order.customer_location) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer_location + ", Tanzania")}`;
  }
  return null;
}

// ═══════════════════════════════════════
// New Order Popup (shows on login if pending orders exist)
// ═══════════════════════════════════════
function NewOrdersPopup({ count, onClose, onView }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-bounce-in">
        {/* Bell animation */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 px-6 pt-8 pb-6 flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <span className="text-4xl">🔔</span>
          </div>
          <h2 className="text-white font-black text-2xl text-center">New Orders!</h2>
          <p className="text-blue-100 text-sm text-center">
            You have <span className="font-bold text-white">{count} pending order{count > 1 ? "s" : ""}</span> waiting for your response
          </p>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <button
            onClick={onView}
            className="w-full py-3 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 transition text-sm"
          >
            View Orders Now
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-gray-200 text-gray-500 font-semibold rounded-2xl hover:bg-gray-50 transition text-sm"
          >
            I'll check later
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Order Detail Card
// ═══════════════════════════════════════
function OrderCard({ order, onStatusChange }) {
  const [updating, setUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const token = localStorage.getItem("token");
  const mapLink = mapsLink(order);

  const handleStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API}/orders/${order.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onStatusChange(order.id, newStatus);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Next allowed status transitions
  const nextActions = {
    pending:   [{ label: "✅ Confirm Order", status: "confirmed", color: "bg-blue-500 hover:bg-blue-600 text-white" },
                { label: "❌ Cancel",         status: "cancelled", color: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200" }],
    confirmed: [{ label: "📦 Mark Delivered", status: "delivered", color: "bg-green-500 hover:bg-green-600 text-white" },
                { label: "❌ Cancel",          status: "cancelled", color: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200" }],
    delivered: [],
    cancelled: [],
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all
      ${order.status === "pending" ? "border-yellow-300 shadow-yellow-100" : "border-gray-100"}`}>

      {/* Card header */}
      <div
        className="flex items-start justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-800 text-sm truncate">{order.product_name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
            {order.status === "pending" && (
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {order.customer_name} · {timeAgo(order.created_at)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
          <p className="font-black text-blue-700 text-sm">Tsh {Number(order.total_price).toLocaleString()}</p>
          <p className="text-xs text-gray-400">qty: {order.quantity}</p>
        </div>
        <span className="ml-2 text-gray-400 text-xs mt-1">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-50 space-y-3">

          {/* Customer info */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Customer</p>
            <div className="flex items-center gap-2">
              <span className="text-sm">👤</span>
              <span className="text-sm text-gray-700 font-semibold">{order.customer_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">📞</span>
              <span className="text-sm text-gray-700">{order.customer_phone}</span>
            </div>
            {order.customer_email && (
              <div className="flex items-center gap-2">
                <span className="text-sm">✉️</span>
                <span className="text-sm text-gray-700">{order.customer_email}</span>
              </div>
            )}
          </div>

          {/* Delivery location */}
          {(order.customer_location || order.customer_latitude) && (
            <div className="bg-blue-50 rounded-xl p-3 space-y-2">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">📍 Delivery Location</p>
              {order.customer_location && (
                <p className="text-sm text-gray-700">{order.customer_location}</p>
              )}
              {order.customer_latitude && order.customer_longitude && (
                <p className="text-xs text-gray-500 font-mono">
                  {Number(order.customer_latitude).toFixed(5)}, {Number(order.customer_longitude).toFixed(5)}
                </p>
              )}
              {mapLink && (
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                  </svg>
                  Open in Google Maps
                </a>
              )}
            </div>
          )}

          {/* Order info */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-gray-400 mb-0.5">Order ID</p>
              <p className="font-bold text-gray-700">#{order.id}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-gray-400 mb-0.5">Placed</p>
              <p className="font-bold text-gray-700">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Contact actions */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Contact Customer</p>
            <div className="flex gap-2 flex-wrap">
              {/* Call */}
              <a
                href={`tel:${order.customer_phone}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition border border-green-200"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.69A2 2 0 012 .98h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                Call
              </a>

              {/* SMS */}
              <a
                href={`sms:${order.customer_phone}?body=Hello ${encodeURIComponent(order.customer_name)}, your order for ${encodeURIComponent(order.product_name)} (Tsh ${Number(order.total_price).toLocaleString()}) has been received. We will confirm shortly.`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition border border-blue-200"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                SMS
              </a>

              {/* Email */}
              {order.customer_email && (
                <a
                  href={`mailto:${order.customer_email}?subject=Your Order for ${encodeURIComponent(order.product_name)}&body=Hello ${encodeURIComponent(order.customer_name)},%0A%0AThank you for your order of ${encodeURIComponent(order.product_name)} x${order.quantity} (Total: Tsh ${Number(order.total_price).toLocaleString()}).%0A%0AWe will confirm your order shortly.%0A%0ADelivery address: ${encodeURIComponent(order.customer_location || '')}%0A%0AThank you!`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition border border-purple-200"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Email
                </a>
              )}

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${order.customer_phone.replace(/\D/g, "")}?text=Hello ${encodeURIComponent(order.customer_name)}, your order for ${encodeURIComponent(order.product_name)} has been received!`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition border border-emerald-200"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>

          {/* Status actions */}
          {nextActions[order.status]?.length > 0 && (
            <div className="flex gap-2 pt-1">
              {nextActions[order.status].map(action => (
                <button
                  key={action.status}
                  onClick={() => handleStatus(action.status)}
                  disabled={updating}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-60 ${action.color}`}
                >
                  {updating ? "Updating…" : action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════
export default function TraderOrders({ onPendingCountChange }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [showPopup, setShowPopup] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [lastSeenAt, setLastSeenAt] = useState(() => {
    // Track when trader last viewed orders (for "new" badge)
    return localStorage.getItem("orders_last_seen") || new Date(0).toISOString();
  });
  const popupShownRef = useRef(false);
  const token = localStorage.getItem("token");

  const fetchOrders = useCallback(async (isInitial = false) => {
    try {
      const res = await fetch(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();

      setOrders(data);

      // Count pending orders
      const pending = data.filter(o => o.status === "pending");
    
      // Count orders newer than last seen
      const unseen = data.filter(o => new Date(o.created_at) > new Date(lastSeenAt));
      setNewCount(unseen.length);

      // On initial load → show popup if there are pending orders
      if (isInitial && pending.length > 0 && !popupShownRef.current) {
        setShowPopup(true);
        popupShownRef.current = true;
      }
    } catch (err) {
      if (isInitial) setError(err.message);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [token, lastSeenAt]);

  // Initial fetch
  useEffect(() => {
    fetchOrders(true);
  }, []);

useEffect(() => {
  const pending = orders.filter(o => o.status === "pending").length;
  onPendingCountChange?.(pending);
}, [orders]);

  // Poll every 20 seconds for new orders
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(false), 20000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleViewOrders = () => {
    setShowPopup(false);
    setFilter("pending");
    // Mark as seen
    const now = new Date().toISOString();
    setLastSeenAt(now);
    localStorage.setItem("orders_last_seen", now);
    setNewCount(0);
  };

  const handleMarkSeen = () => {
    const now = new Date().toISOString();
    setLastSeenAt(now);
    localStorage.setItem("orders_last_seen", now);
    setNewCount(0);
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  // Filter orders
  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  // Stats
  const stats = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  if (loading) return (
     <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p className="text-gray-400 text-sm">Loading orders…</p>
      </div>
    </div>
  );

  if (error) return (
   <div className="flex items-center justify-center py-20 p-4">
      <div className="text-center">
        <p className="text-red-500 font-semibold">{error}</p>
        <button onClick={() => fetchOrders(true)} className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm">Retry</button>
      </div>
    </div>
  );

 // Replace the entire return with this:
return (
  <>
    {showPopup && (
      <NewOrdersPopup
        count={stats.pending}
        onClose={handleClosePopup}
        onView={handleViewOrders}
      />
    )}

    <div className="space-y-4">

      {/* Stats row + refresh */}
      <div className="flex items-center gap-2">
        <div className="grid grid-cols-4 gap-2 flex-1">
          {[
            { key: "pending",   label: "Pending",   color: "text-yellow-600", bg: "bg-yellow-50" },
            { key: "confirmed", label: "Confirmed", color: "text-blue-600",   bg: "bg-blue-50"   },
            { key: "delivered", label: "Delivered", color: "text-green-600",  bg: "bg-green-50"  },
            { key: "cancelled", label: "Cancelled", color: "text-red-500",    bg: "bg-red-50"    },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`${s.bg} rounded-2xl p-3 text-center transition hover:scale-105 ${filter === s.key ? "ring-2 ring-offset-1 ring-blue-400" : ""}`}
            >
              <p className={`text-xl font-black ${s.color}`}>{stats[s.key]}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Refresh + new badge — right side */}
        <div className="flex flex-col gap-1.5 items-center">
          {newCount > 0 && (
            <button
              onClick={handleMarkSeen}
              className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200 hover:bg-yellow-100 transition w-fit"
            >
              {/* Bell icon with pulse dot */}
              <span className="relative flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
              </span>
              {newCount} new order{newCount > 1 ? "s" : ""}
            </button>
          )}
   
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {["all", "pending", "confirmed", "delivered", "cancelled"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition
              ${filter === f ? "bg-blue-500 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && stats[f] > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === f ? "bg-white/20" : "bg-gray-100"}`}>
                {stats[f]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center gap-3">
          <span className="text-5xl">📭</span>
          <p className="font-bold text-gray-400">No {filter === "all" ? "" : filter} orders yet</p>
          <p className="text-sm text-gray-300">Orders will appear here when customers place them</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-gray-300 py-2">Auto-refreshes every 20 seconds</p>
    </div>
  </>
);
}
