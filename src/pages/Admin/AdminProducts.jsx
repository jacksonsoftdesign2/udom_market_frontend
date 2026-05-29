import { useState, useEffect } from "react";
import { API } from "../../api";
import AdminLayout from "./AdminLayout";
import {
  FiSearch, FiCheck, FiTrash2, FiRefreshCw,
  FiAlertCircle, FiPackage
} from "react-icons/fi";

const FILTERS = ["All", "Pending", "Approved", "Rejected"];

export default function AdminProducts() {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("All");
  const [selected, setSelected]   = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [toast, setToast]         = useState(null);
  const token = localStorage.getItem("token");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data.products || []);
    } catch { showToast("Failed to load products", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const approveProduct = async (id) => {
    try {
      const res = await fetch(`${API}/admin/products/${id}/approve`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setProducts(prev => prev.map(p =>
        p.id === id ? { ...p, verification_status: "approved" } : p
      ));
      showToast("Product approved");
    } catch { showToast("Failed to approve", "error"); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`${API}/admin/products/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setProducts(prev => prev.filter(p => p.id !== id));
      setSelected(prev => prev.filter(s => s !== id));
      showToast("Product deleted");
    } catch { showToast("Failed to delete", "error"); }
  };

  const bulkAction = async (action) => {
    if (!selected.length) return;
    if (action === "delete" && !window.confirm(`Delete ${selected.length} products?`)) return;
    setBulkLoading(true);
    try {
      const res = await fetch(`${API}/admin/products/bulk`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected, action }),
      });
      if (!res.ok) throw new Error();
      await fetchProducts();
      setSelected([]);
      showToast(`Bulk ${action} applied`);
    } catch { showToast("Bulk action failed", "error"); }
    finally { setBulkLoading(false); }
  };

  const filtered = products.filter(p => {
    const text = `${p.name} ${p.business_name || ""}`.toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());
    const matchFilter =
      filter === "All"      ? true :
      filter === "Pending"  ? p.verification_status === "pending" :
      filter === "Approved" ? p.verification_status === "approved" :
      filter === "Rejected" ? p.verification_status === "rejected" : true;
    return matchSearch && matchFilter;
  });

  const allSelected = filtered.length > 0 && filtered.every(p => selected.includes(p.id));
  const toggleSelectAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(filtered.map(p => p.id));
  };
  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const statusBadge = (status) => {
    const map = {
      pending:  "bg-amber-50 text-amber-700 border-amber-200",
      approved: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-red-50 text-red-600 border-red-200",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[status] || ""}`}>
        {status}
      </span>
    );
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
          <h1 className="text-xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} total products</p>
        </div>
        <button onClick={fetchProducts} className="flex items-center gap-2 px-3 py-2 rounded-[4px] border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm transition">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by product name or business..."
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

      {/* Bulk bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 mb-4 rounded-[4px] border border-blue-200 bg-blue-50">
          <span className="text-sm font-medium text-[#1a3a8f]">{selected.length} selected</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => bulkAction("approve")} disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#1a3a8f] text-[#F5C518] text-xs font-semibold hover:bg-[#0f2460] transition disabled:opacity-50">
              <FiCheck size={12} /> Approve
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Trader</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
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
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <FiPackage size={28} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-gray-400 text-sm">No products found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(product => (
                  <tr key={product.id}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition
                      ${selected.includes(product.id) ? "bg-blue-50/30" : ""}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox"
                        checked={selected.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="accent-[#1a3a8f] w-4 h-4" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{product.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{product.description}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-gray-600 text-xs">{product.business_name}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-gray-700 font-medium">
                        TZS {Number(product.price).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {statusBadge(product.verification_status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {product.verification_status !== "approved" && (
                          <button onClick={() => approveProduct(product.id)}
                            title="Approve"
                            className="p-1.5 rounded-[4px] bg-[#e8edf7] text-[#1a3a8f] hover:bg-[#1a3a8f] hover:text-[#F5C518] transition">
                            <FiCheck size={13} />
                          </button>
                        )}
                        <button onClick={() => deleteProduct(product.id)}
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
    </AdminLayout>
  );
}
