import { useState, useEffect, useCallback } from "react";
import { API } from "../../api";
import AdminLayout from "./AdminLayout";
import {
  FiSearch, FiCheck, FiTrash2, FiKey, FiDollarSign,
  FiAlertCircle, FiRefreshCw
} from "react-icons/fi";

const FILTERS = ["All", "Pending Approval", "Approved", "Paid", "Unpaid"];
const STORAGE_KEY = "adminTraders_uiState";

// ── Persist filter/search/selected across refreshes via sessionStorage ──
const loadUIState = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};
const saveUIState = (patch) => {
  try {
    const prev = loadUIState();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, ...patch }));
  } catch {}
};

export default function AdminTraders() {
  const saved = loadUIState();

  const [traders, setTraders]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState(saved.search   ?? "");
  const [filter, setFilter]           = useState(saved.filter   ?? "All");
  const [selected, setSelected]       = useState(saved.selected ?? []);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [toast, setToast]             = useState(null);
  const [actionLoading, setActionLoading] = useState({}); // per-row loading

  const token = localStorage.getItem("token");

  // ── Persist UI state whenever it changes ──
  useEffect(() => { saveUIState({ search });   }, [search]);
  useEffect(() => { saveUIState({ filter });   }, [filter]);
  useEffect(() => { saveUIState({ selected }); }, [selected]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const setRowLoading = (id, val) =>
    setActionLoading(prev => ({ ...prev, [id]: val }));

  // ── Fetch ──
  const fetchTraders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const traderList = data.users?.filter(u => u.role === "trader" && !u.is_deleted) || [];
      setTraders(traderList);
    } catch {
      showToast("Failed to load traders", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchTraders(); }, [fetchTraders]);

  // ── Single: Approve ──
  const approveTrader = async (id) => {
    setRowLoading(id, "approve");
    try {
      const res = await fetch(`${API}/admin/users/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed");
      }
      setTraders(prev =>
        prev.map(t => t.id === id ? { ...t, is_approved: true } : t)
      );
      showToast("Trader approved ✓");
    } catch (e) {
      showToast(e.message || "Failed to approve", "error");
    } finally {
      setRowLoading(id, null);
    }
  };

  // ── Single: Mark Paid ──
  const markPaid = async (id) => {
    setRowLoading(id, "paid");
    try {
      const res = await fetch(`${API}/admin/users/${id}/mark-paid`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed");
      }
      setTraders(prev =>
        prev.map(t => t.id === id ? { ...t, payment_status: "paid" } : t)
      );
      showToast("Marked as paid ✓");
    } catch (e) {
      showToast(e.message || "Failed to update payment", "error");
    } finally {
      setRowLoading(id, null);
    }
  };

  // ── Single: Delete ──
  const deleteTrader = async (id) => {
    if (!window.confirm("Delete this trader? This cannot be undone.")) return;
    setRowLoading(id, "delete");
    try {
      const res = await fetch(`${API}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed");
      }
      setTraders(prev => prev.filter(t => t.id !== id));
      setSelected(prev => prev.filter(s => s !== id));
      showToast("Trader deleted");
    } catch (e) {
      showToast(e.message || "Failed to delete", "error");
    } finally {
      setRowLoading(id, null);
    }
  };

  // ── Bulk actions ──
  const bulkAction = async (action) => {
    if (!selected.length) return;
    if (action === "delete" && !window.confirm(`Delete ${selected.length} trader(s)? This cannot be undone.`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch(`${API}/admin/users/bulk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selected, action }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Bulk action failed");
      }

      // Optimistically update local state instead of re-fetching
      if (action === "approve") {
        setTraders(prev =>
          prev.map(t => selected.includes(t.id) ? { ...t, is_approved: true } : t)
        );
      } else if (action === "mark_paid") {
        setTraders(prev =>
          prev.map(t => selected.includes(t.id) ? { ...t, payment_status: "paid" } : t)
        );
      } else if (action === "delete") {
        setTraders(prev => prev.filter(t => !selected.includes(t.id)));
      }

      setSelected([]);
      showToast(`Bulk ${action.replace("_", " ")} applied to ${selected.length} trader(s) ✓`);
    } catch (e) {
      showToast(e.message || "Bulk action failed", "error");
    } finally {
      setBulkLoading(false);
    }
  };

  // ── Filter + search ──
  const filtered = traders.filter(t => {
    const name = `${t.first_name ?? ""} ${t.last_name ?? ""} ${t.business_name ?? ""} ${t.user_code ?? ""}`.toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchFilter =
      filter === "All"              ? true :
      filter === "Pending Approval" ? !t.is_approved :
      filter === "Approved"         ? t.is_approved :
      filter === "Paid"             ? t.payment_status === "paid" :
      filter === "Unpaid"           ? t.payment_status !== "paid" : true;
    return matchSearch && matchFilter;
  });

  // ── Select all (FIXED — was broken before) ──
  const allSelected = filtered.length > 0 && filtered.every(t => selected.includes(t.id));
  const someSelected = filtered.some(t => selected.includes(t.id)) && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      // Deselect only the currently filtered rows
      const filteredIds = new Set(filtered.map(t => t.id));
      setSelected(prev => prev.filter(id => !filteredIds.has(id)));
    } else {
      // Add all filtered rows to selection (merge with any existing)
      const filteredIds = filtered.map(t => t.id);
      setSelected(prev => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-[4px] shadow-lg text-sm font-medium flex items-center gap-2 transition-all
            ${toast.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
            }`}
        >
          {toast.type === "error"
            ? <FiAlertCircle size={15} />
            : <FiCheck size={15} />
          }
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Traders</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {loading ? "Loading…" : `${traders.length} total · ${filtered.length} shown`}
          </p>
        </div>
        <button
          onClick={fetchTraders}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-[4px] border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm transition disabled:opacity-50"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, business, ID…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-[4px] text-sm focus:outline-none focus:border-[#1a3a8f]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-[4px] text-xs font-medium border transition
                ${filter === f
                  ? "bg-[#1a3a8f] text-[#F5C518] border-[#1a3a8f]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#1a3a8f]"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 mb-4 rounded-[4px] border border-blue-200 bg-blue-50">
          <span className="text-sm font-medium text-[#1a3a8f]">
            {selected.length} selected
          </span>
          <button
            onClick={() => setSelected([])}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Clear
          </button>
          <div className="flex gap-2 ml-auto flex-wrap">
            <button
              onClick={() => bulkAction("approve")}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#1a3a8f] text-[#F5C518] text-xs font-semibold hover:bg-[#0f2460] transition disabled:opacity-50"
            >
              <FiCheck size={12} /> Approve
            </button>
            <button
              onClick={() => bulkAction("mark_paid")}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              <FiDollarSign size={12} /> Mark Paid
            </button>
            <button
              onClick={() => bulkAction("delete")}
              disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition disabled:opacity-50"
            >
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
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleSelectAll}
                    className="accent-[#1a3a8f] w-4 h-4 cursor-pointer"
                  />
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
                    {search || filter !== "All"
                      ? "No traders match your search / filter"
                      : "No traders found"
                    }
                  </td>
                </tr>
              ) : (
                filtered.map(trader => {
                  const rowBusy = !!actionLoading[trader.id];
                  return (
                    <tr
                      key={trader.id}
                      className={`border-b border-gray-50 transition
                        ${selected.includes(trader.id) ? "bg-blue-50/40" : "hover:bg-gray-50/50"}
                        ${rowBusy ? "opacity-60 pointer-events-none" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(trader.id)}
                          onChange={() => toggleSelect(trader.id)}
                          className="accent-[#1a3a8f] w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* Trader info */}
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">
                          {trader.first_name} {trader.last_name}
                        </div>
                        {trader.business_name && (
                          <div className="text-xs text-gray-400">{trader.business_name}</div>
                        )}
                        <div className="text-xs text-gray-400">{trader.user_code}</div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="text-gray-600 text-xs">{trader.email}</div>
                        <div className="text-gray-400 text-xs">{trader.phone}</div>
                      </td>

                      {/* Approval status */}
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

                      {/* Payment status */}
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

                      {/* Action buttons */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {!trader.is_approved && (
                            <button
                              onClick={() => approveTrader(trader.id)}
                              title="Approve trader"
                              disabled={rowBusy}
                              className="p-1.5 rounded-[4px] bg-[#e8edf7] text-[#1a3a8f] hover:bg-[#1a3a8f] hover:text-[#F5C518] transition"
                            >
                              <FiCheck size={13} />
                            </button>
                          )}
                          {trader.payment_status !== "paid" && (
                            <button
                              onClick={() => markPaid(trader.id)}
                              title="Mark as paid"
                              disabled={rowBusy}
                              className="p-1.5 rounded-[4px] bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition"
                            >
                              <FiDollarSign size={13} />
                            </button>
                          )}

                          <button
                            onClick={() => deleteTrader(trader.id)}
                            title="Delete trader"
                            disabled={rowBusy}
                            className="p-1.5 rounded-[4px] bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
            <span>Showing {filtered.length} of {traders.length} traders</span>
            {selected.length > 0 && (
              <span className="text-[#1a3a8f] font-medium">{selected.length} selected</span>
            )}
          </div>
        )}
      </div>

      {/* Reset password modal */}

    </AdminLayout>
  );
}

