import { useState, useEffect } from "react";
import { API } from "../../api";
import AdminLayout from "./AdminLayout";
import { FiAlertCircle, FiCheckCircle, FiClock, FiPhone, FiMail } from "react-icons/fi";

export default function AdminClaims() {
  const [claims, setClaims]   = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API}/admin/claims`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setClaims(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`${API}/admin/claims/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FiAlertCircle className="text-red-500" /> Claims
        </h1>
        <p className="text-gray-500 text-sm mt-1">User submitted complaints and issues</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-[4px] p-5 animate-pulse h-24 border border-gray-100" />
          ))}
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-[4px] border border-gray-100 p-12 text-center text-gray-400">
          <FiAlertCircle size={32} className="mx-auto mb-2 opacity-30" />
          <p className="font-semibold">No claims yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map(c => (
            <div key={c.id} className="bg-white rounded-[4px] border border-gray-100 p-4 hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-3 flex-wrap">

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                      c.status === "new"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {c.status === "new" ? "NEW" : "RESOLVED"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-2">
                    {c.contact.includes("@") ? <FiMail size={12} className="text-[#1a3a8f]" /> : <FiPhone size={12} className="text-[#1a3a8f]" />}
                    <span className="text-sm font-semibold text-[#1a3a8f]">{c.contact}</span>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed">{c.reason}</p>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {c.status === "new" ? (
                    <button
                      onClick={() => updateStatus(c.id, "resolved")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a3a8f] text-[#F5C518] text-xs font-semibold rounded-sm hover:bg-[#0f2460] transition"
                    >
                      <FiCheckCircle size={12} /> Mark Resolved
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatus(c.id, "new")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-sm hover:bg-gray-200 transition"
                    >
                      <FiClock size={12} /> Reopen
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}