import { useState } from "react";
import { API } from "../api";
import { FiAlertCircle, FiCheckCircle, FiX } from "react-icons/fi";

export default function ClaimForm({ onClose }) {
  const [contact, setContact] = useState("");
  const [reason,  setReason]  = useState("");
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);
  const [saving,  setSaving]  = useState(false);

  const handleSubmit = async () => {
    if (!contact.trim()) return setError("Tafadhali weka namba ya simu au barua pepe.");
    if (!reason.trim())  return setError("Tafadhali elezea tatizo lako.");
    setSaving(true); setError("");
    try {
      const res = await fetch(`${API}/users/claims`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (success) return (
    <div className="p-8 flex flex-col items-center text-center gap-3">
      <div className="w-16 h-16 rounded-sm bg-[#e8edf7] border border-[#1a3a8f50] flex items-center justify-center">
        <FiCheckCircle size={32} className="text-[#1a3a8f]" />
      </div>
      <p className="font-bold text-[#1a3a8f] text-base">Malalamiko Yamewasilishwa!</p>
      <p className="text-sm text-gray-500">Tumepokea malalamiko yako. Tutayapitia hivi karibuni.</p>
      <button
        onClick={onClose}
        className="mt-2 px-6 py-2.5 bg-[#1a3a8f] text-[#F5C518] rounded-sm text-sm font-semibold hover:bg-[#0f2460] transition"
      >
        Funga
      </button>
    </div>
  );

  return (
    <div className="p-5 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1a3a8f20] pb-3">
        <div className="flex items-center gap-2">
          <FiAlertCircle className="text-[#1a3a8f]" size={18} />
          <h3 className="font-bold text-[#1a3a8f] text-base">Wasilisha Malalamiko</h3>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-sm bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 transition">
          <FiX size={15} />
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Una tatizo? Wasilisha malalamiko yako hapa chini. Hakuna akaunti inayohitajika.
      </p>

      {/* Contact */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
          Simu au Barua Pepe <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="mfano: 0712345678 au wewe@email.com"
          value={contact}
          onChange={e => { setContact(e.target.value); setError(""); }}
          className="w-full px-3 py-2.5 border border-[#1a3a8f50] rounded-sm text-sm outline-none focus:border-[#1a3a8f] focus:ring-1 focus:ring-[#1a3a8f30] bg-white text-gray-700"
        />
      </div>

      {/* Reason */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
          Sababu <span className="text-red-500">*</span>
        </label>
        <textarea
          placeholder="Elezea tatizo lako kwa undani…"
          value={reason}
          onChange={e => { setReason(e.target.value.slice(0, 500)); setError(""); }}
          rows={4}
          className="w-full px-3 py-2.5 border border-[#1a3a8f50] rounded-sm text-sm outline-none focus:border-[#1a3a8f] focus:ring-1 focus:ring-[#1a3a8f30] bg-white text-gray-700 resize-none"
        />
        <p className="text-xs text-right text-gray-400 mt-0.5">{reason.length}/500</p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-sm">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full bg-[#1a3a8f] text-[#F5C518] py-2.5 rounded-sm text-sm font-semibold hover:bg-[#0f2460] transition disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
      >
        {saving ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Inatuma…
          </>
        ) : "Wasilisha Malalamiko"}
      </button>
    </div>
  );
}