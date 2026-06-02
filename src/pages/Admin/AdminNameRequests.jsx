import { useState, useEffect } from "react";
import { API } from "../../api";
import AdminLayout from "./AdminLayout";
import {
  FiCheck, FiX, FiRefreshCw, FiAlertCircle, FiTag,
} from "react-icons/fi";

const chainItem = (text, isNew = false) => (
  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
    isNew ? "bg-amber-100 text-amber-700 border border-amber-200"
           : "bg-gray-100 text-gray-600 border border-gray-200"
  }`}>
    {text}{isNew && <span className="ml-1 opacity-60">(new)</span>}
  </span>
);

export default function AdminNameRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState(null);
  const [reviewing, setReviewing] = useState(null); // the request being reviewed
  const [corrections, setCorrections] = useState({
    corrected_brand: "", corrected_model: "", corrected_variant: "",
  });
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  const token = localStorage.getItem("token");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/admin/name-requests/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const openReview = (req) => {
    setReviewing(req);
    setCorrections({
      corrected_brand:   req.new_brand   || "",
      corrected_model:   req.new_model   || "",
      corrected_variant: req.new_variant || "",
    });
    setRejectReason("");
  };

  const handleApprove = async () => {
    if (!reviewing) return;
    setSubmitting(true);
    try {
      const body = {};
      // Only send corrections if admin actually changed the value
      if (reviewing.new_brand   && corrections.corrected_brand.trim()   !== reviewing.new_brand)
        body.corrected_brand   = corrections.corrected_brand.trim();
      if (reviewing.new_model   && corrections.corrected_model.trim()   !== reviewing.new_model)
        body.corrected_model   = corrections.corrected_model.trim();
      if (corrections.corrected_variant.trim() !== reviewing.new_variant)
        body.corrected_variant = corrections.corrected_variant.trim();

      const res = await fetch(`${API}/admin/name-requests/${reviewing.id}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed");
      }
      setRequests(prev => prev.filter(r => r.id !== reviewing.id));
      setReviewing(null);
      showToast("Request approved — names added to DB ✓");
    } catch (e) {
      showToast(e.message || "Failed to approve", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reviewing || !rejectReason.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/admin/name-requests/${reviewing.id}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rejection_reason: rejectReason.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed");
      }
      setRequests(prev => prev.filter(r => r.id !== reviewing.id));
      setReviewing(null);
      showToast("Request rejected — trader notified");
    } catch (e) {
      showToast(e.message || "Failed to reject", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-[4px] text-sm focus:outline-none focus:border-[#1a3a8f]";

  return (
    <AdminLayout>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-[4px] shadow-lg text-sm font-medium flex items-center gap-2
          ${toast.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {toast.type === "error" ? <FiAlertCircle size={15}/> : <FiCheck size={15}/>}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Name Requests</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {loading ? "Loading…" : `${requests.length} pending request${requests.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-[4px] border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm transition disabled:opacity-50"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""}/> Refresh
        </button>
      </div>

      {/* Requests list */}
      <div className="bg-white rounded-[4px] border border-gray-100 overflow-hidden">

        {loading ? (
          <div className="py-10 text-center text-gray-400">
            <svg className="animate-spin w-6 h-6 mx-auto mb-2" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <p className="text-sm">Loading…</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-14 text-center text-gray-400">
            <FiTag size={32} className="mx-auto mb-3 opacity-30"/>
            <p className="text-base font-semibold">No pending requests</p>
            <p className="text-sm mt-1">All name requests have been reviewed.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {requests.map(req => (
              <div key={req.id} className="p-4 hover:bg-gray-50/50 transition">

                {/* Trader info */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-sm font-semibold text-gray-800">
                      {req.trader_name || "Unknown trader"}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">{req.trader_code}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Chain */}
                <div className="flex items-center gap-1.5 flex-wrap mb-4">
                  {chainItem(req.category_name || "—")}
                  <span className="text-gray-300 text-xs">›</span>
                  {req.new_brand
                    ? chainItem(req.new_brand, true)
                    : chainItem(req.brand_name || "—")
                  }
                  <span className="text-gray-300 text-xs">›</span>
                  {req.new_model
                    ? chainItem(req.new_model, true)
                    : chainItem(req.model_name || "—")
                  }
                  <span className="text-gray-300 text-xs">›</span>
                  {chainItem(req.new_variant, true)}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openReview(req)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-[4px] text-xs font-semibold transition"
                    style={{ background: "#1a3a8f", color: "#F5C518" }}
                  >
                    <FiCheck size={12}/> Review & Approve
                  </button>
                  <button
                    onClick={() => { setReviewing(req); setRejectReason(""); setCorrections({ corrected_brand: "", corrected_model: "", corrected_variant: "" }); }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-[4px] bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition"
                  >
                    <FiX size={12}/> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Review Modal ── */}
      {reviewing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100"
              style={{ background: "#1a3a8f" }}>
              <div>
                <p className="text-white font-bold text-sm">Review Name Request</p>
                <p className="text-blue-300 text-xs mt-0.5">
                  from {reviewing.trader_name} · {new Date(reviewing.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setReviewing(null)}
                className="text-blue-300 hover:text-white transition"
              >
                <FiX size={18}/>
              </button>
            </div>

            <div className="p-5 space-y-4">

              {/* Chain summary */}
              <div className="bg-gray-50 rounded-[4px] px-3 py-3 border border-gray-100">
                <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Request chain</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {chainItem(reviewing.category_name || "—")}
                  <span className="text-gray-300 text-xs">›</span>
                  {reviewing.new_brand
                    ? chainItem(reviewing.new_brand, true)
                    : chainItem(reviewing.brand_name || "—")
                  }
                  <span className="text-gray-300 text-xs">›</span>
                  {reviewing.new_model
                    ? chainItem(reviewing.new_model, true)
                    : chainItem(reviewing.model_name || "—")
                  }
                  <span className="text-gray-300 text-xs">›</span>
                  {chainItem(reviewing.new_variant, true)}
                </div>
              </div>

              {/* Editable fields — only for new levels */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Correct names before approving (optional)
                </p>
                <div className="space-y-3">

                  {reviewing.new_brand && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Brand name
                        <span className="ml-2 text-amber-500 font-normal">Trader typed: "{reviewing.new_brand}"</span>
                      </label>
                      <input
                        type="text"
                        value={corrections.corrected_brand}
                        onChange={e => setCorrections(p => ({ ...p, corrected_brand: e.target.value }))}
                        className={inputCls}
                        placeholder="Correct brand name…"
                      />
                    </div>
                  )}

                  {reviewing.new_model && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Model name
                        <span className="ml-2 text-amber-500 font-normal">Trader typed: "{reviewing.new_model}"</span>
                      </label>
                      <input
                        type="text"
                        value={corrections.corrected_model}
                        onChange={e => setCorrections(p => ({ ...p, corrected_model: e.target.value }))}
                        className={inputCls}
                        placeholder="Correct model name…"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Variant name
                      <span className="ml-2 text-amber-500 font-normal">Trader typed: "{reviewing.new_variant}"</span>
                    </label>
                    <input
                      type="text"
                      value={corrections.corrected_variant}
                      onChange={e => setCorrections(p => ({ ...p, corrected_variant: e.target.value }))}
                      className={inputCls}
                      placeholder="Correct variant name…"
                    />
                  </div>
                </div>
              </div>

              {/* Reject reason — shown when reject button was clicked */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Rejection reason <span className="text-gray-400 font-normal">(fill this to reject instead of approve)</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Brand already exists as Samsung. Please select it from the dropdown."
                  className={inputCls}
                  style={{ resize: "none" }}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[4px] text-sm font-semibold disabled:opacity-60 transition"
                  style={{ background: "#1a3a8f", color: "#F5C518" }}
                >
                  {submitting ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  ) : <FiCheck size={14}/>}
                  Approve{corrections.corrected_brand || corrections.corrected_model || corrections.corrected_variant !== reviewing.new_variant ? " with corrections" : ""}
                </button>
                <button
                  onClick={handleReject}
                  disabled={submitting || !rejectReason.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[4px] bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition"
                >
                  <FiX size={14}/> Reject
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Fill rejection reason to reject. Leave empty and click Approve to approve.
              </p>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}