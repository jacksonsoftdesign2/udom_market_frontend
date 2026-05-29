import { useState, useEffect } from "react";
import { API } from "../../api";
import AdminLayout from "./AdminLayout";
import ResetPasswordModal from "./ResetPasswordModal";
import {
  FiSearch, FiCheck, FiTrash2, FiKey, FiDollarSign,
  FiFilter, FiChevronDown, FiAlertCircle, FiRefreshCw
} from "react-icons/fi";

const FILTERS = ["All", "Pending Approval", "Approved", "Paid", "Unpaid"];

export default function AdminTraders() {
  const [traders, setTraders]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState("All");
  const [selected, setSelected]       = useState([]);
  const [resetTrader, setResetTrader] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [toast, setToast]             = useState(null);
  const token = localStorage.getItem("token");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTraders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTraders(data.users?.filter(u => u.role === "trader") || []);
    } catch { showToast("Failed to load traders", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTraders(); }, []);

  // ── Single actions ──
  const approveTrader = async (id) => {
    try {
      const res = await fetch(`${API}/admin/users/${id}/approve`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setTraders(prev => prev.map(t => t.id === id ? { ...t, is_approved: true } : t));
      showToast("Trader approved");
    } catch { showToast("Failed to approve", "error"); }
  };

  const markPaid = async (id) => {
    try {
      const res = await fetch(`${API}/admin/users/${id}/mark-paid`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setTraders(prev => prev.map(t => t.id === id ? { ...t, payment_status: "paid" } : t));
      showToast("Marked as paid");
    } catch { showToast("Failed to update", "error"); }
  };

  const deleteTrader = async (id) => {
    if (!window.confirm("Delete this trader? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API}/admin/users/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setTraders(prev => prev.filter(t => t.id !== id));
      setSelected(prev => prev.filter(s => s !== id));
      showToast("Trader deleted");
    } catch { showToast("Failed to delete", "error"); }
  };

  // ── Bulk actions ──
  const bulkAction = async (action) => {
    if (!selected.length) return;
    if (action === "delete" && !window.confirm(`Delete ${selected.length} traders?`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch(`${API}/admin/users/bulk`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected, action }),
      });
      if (!res.ok) throw new Error();
      await fetchTraders();
      setSelected([]);
      showToast(`Bulk ${action} applied`);
    } catch { showToast("Bulk action failed", "error"); }
    finally { setBulkLoading(false); }
  };

  // ── Filter + search ──
  const filtered = traders.filter(t => {
    const name = `${t.first_name} ${t.last_name} ${t.business_name || ""} ${t.user_code || ""}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchFilter =
      filter === "All"             ? true :
      filter === "Pending Approval" ? !t.is_approved :
      filter === "Approved"         ? t.is_approved :
      filter === "Paid"             ? t.payment_status === "paid" :
      filter === "Unpaid"           ? t.payment_status !== "paid" : true;
    return matchSearch && matchFilter;
  });

  const allSelected = filtered.length > 0 && filtered.every(t => selected.includes(t.id));
  const toggleAll = () => setAllSelected => {
    if (allSelected) setSelected([]);
    else setSelected(filtered.map(t => t.id));
  };
  const toggleSelectAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(filtered.map(t => t.id));
  };
  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-[4px] shadow-lg text-sm font-medium flex items-center gap-2
          ${toast.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {toast.type === "error" ? <FiAlertCircle size={15} /> : <FiCheck size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Traders</h1>
          <p className="text-gray-500 text-sm mt-0.5">{traders.length} total traders</p>
        </div>
        <button onClick={fetchTraders} className="flex items-center gap-2 px-3 py-2 rounded-[4px] border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm transition">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, business, ID..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-[4px] text-sm focus:outline-none focus:border-[#1a3a8f]" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-[4px] text-xs font-medium border transition
                ${filter === f ? "bg-[#1a3a8f] text-[#F5C518] border-[#1a3a8f]" : "bg-white text-gray-600 border-gray-200 hover:border-[#1a3a8f]"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 mb-4 rounded-[4px] border border-blue-200 bg-blue-50">
          <span className="text-sm font-medium text-[#1a3a8f]">{selected.length} selected</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => bulkAction("approve")} disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#1a3a8f] text-[#F5C518] text-xs font-semibold hover:bg-[#0f2460] transition disabled:opacity-50">
              <FiCheck size={12} /> Approve
            </button>
            <button onClick={() => bulkAction("mark_paid")} disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50">
              <FiDollarSign size={12} /> Mark Paid
            </button>
            <button onClick={() => bulkAction("delete")} disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition disabled:opacity-50">
              <FiTrash2 size={12} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[4px] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100" style={{ background: "#f4f6fb" }}>
                <th className="px-4 py-3 text-left w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}
                    className="accent-[#1a3a8f] w-4 h-4" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Trader</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Approval</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No traders found
                  </td>
                </tr>
              ) : (
                filtered.map(trader => (
                  <tr key={trader.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition
                      ${selected.includes(trader.id) ? "bg-blue-50/30" : ""}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox"
                        checked={selected.includes(trader.id)}
                        onChange={() => toggleSelect(trader.id)}
                        className="accent-[#1a3a8f] w-4 h-4" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">
                        {trader.first_name} {trader.last_name}
                      </div>
                      {trader.business_name && (
                        <div className="text-xs text-gray-400">{trader.business_name}</div>
                      )}
                      <div className="text-xs text-gray-400">{trader.user_code}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-gray-600 text-xs">{trader.email}</div>
                      <div className="text-gray-400 text-xs">{trader.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      {trader.is_approved ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <FiCheck size={10} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {trader.payment_status === "paid" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <FiCheck size={10} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {!trader.is_approved && (
                          <button onClick={() => approveTrader(trader.id)}
                            title="Approve"
                            className="p-1.5 rounded-[4px] bg-[#e8edf7] text-[#1a3a8f] hover:bg-[#1a3a8f] hover:text-[#F5C518] transition">
                            <FiCheck size={13} />
                          </button>
                        )}
                        {trader.payment_status !== "paid" && (
                          <button onClick={() => markPaid(trader.id)}
                            title="Mark Paid"
                            className="p-1.5 rounded-[4px] bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition">
                            <FiDollarSign size={13} />
                          </button>
                        )}
                        <button onClick={() => setResetTrader(trader)}
                          title="Reset Password"
                          className="p-1.5 rounded-[4px] bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition">
                          <FiKey size={13} />
                        </button>
                        <button onClick={() => deleteTrader(trader.id)}
                          title="Delete"
                          className="p-1.5 rounded-[4px] bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition">
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset password modal */}
      {resetTrader && (
        <ResetPasswordModal
          trader={resetTrader}
          onClose={() => setResetTrader(null)}
        />
      )}
    </AdminLayout>
  );
}
