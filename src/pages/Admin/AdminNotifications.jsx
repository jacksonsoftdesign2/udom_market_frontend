import { useState, useEffect, useRef } from "react";
import { FiBell, FiUser, FiPackage, FiX, FiCheck } from "react-icons/fi";

export default function AdminNotifications({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const ref = useRef();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
    setNotifications(stored);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("admin_notifications", JSON.stringify(updated));
  };

  const markRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("admin_notifications", JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.setItem("admin_notifications", JSON.stringify([]));
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div ref={ref} className="absolute right-0 top-11 w-80 bg-white rounded-[4px] shadow-xl border border-gray-100 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100"
        style={{ background: "#1a3a8f" }}>
        <div className="flex items-center gap-2">
          <FiBell size={15} className="text-[#F5C518]" />
          <span className="text-white text-sm font-semibold">Notifications</span>
          {unread > 0 && (
            <span className="bg-[#F5C518] text-[#1a3a8f] text-xs font-bold px-1.5 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button onClick={markAllRead}
              className="text-blue-300 hover:text-white text-xs flex items-center gap-1 transition">
              <FiCheck size={12} /> Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-blue-300 hover:text-white transition">
            <FiX size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <FiBell size={28} className="mx-auto text-gray-200 mb-2" />
            <p className="text-gray-400 text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition
                ${!n.read ? "bg-blue-50/50" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                ${n.type === "new_trader" ? "bg-blue-100" : "bg-yellow-100"}`}>
                {n.type === "new_trader"
                  ? <FiUser size={14} className="text-blue-600" />
                  : <FiPackage size={14} className="text-yellow-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.read ? "font-semibold text-gray-800" : "text-gray-600"}`}>
                  {n.message}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-gray-100 flex justify-end">
          <button onClick={clearAll}
            className="text-xs text-red-400 hover:text-red-600 transition font-medium">
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

// ── Helper: call this from backend polling or after login to push notifications ──
export function pushNotification({ type, message }) {
  const stored = JSON.parse(localStorage.getItem("admin_notifications") || "[]");
  const newNotif = {
    id: Date.now(),
    type,   // 'new_trader' | 'new_product'
    message,
    time: new Date().toLocaleString(),
    read: false,
  };
  const updated = [newNotif, ...stored].slice(0, 50); // keep max 50
  localStorage.setItem("admin_notifications", JSON.stringify(updated));
}
