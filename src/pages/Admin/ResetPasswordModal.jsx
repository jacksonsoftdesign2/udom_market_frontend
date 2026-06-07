import { useState } from "react";
import { API } from "../../api";
import { FiX, FiCopy, FiCheck, FiMail, FiPhone, FiUser, FiKey, FiSend } from "react-icons/fi";

function formatUserCode(value, isDeleting = false) {
  let v = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 7);
  let result = "";
  if (v.length >= 1) result += v.slice(0, 2);
  if (v.length > 2) result += " " + v.slice(2, 4);
  if (v.length >= 4 && !isDeleting) {
    result += "/" + v.slice(4, 7);
  } else if (v.length > 4) {
    result += "/" + v.slice(4, 7);
  }
  return result;
}


export default function ResetPasswordModal({ trader, onClose }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { tempPassword, trader }
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const handleReset = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/admin/users/${trader.id}/reset-password`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100"
          style={{ background: "#1a3a8f" }}>
          <div className="flex items-center gap-2">
            <FiKey size={16} className="text-[#F5C518]" />
            <span className="text-white font-semibold text-sm">Reset Password</span>
          </div>
          <button onClick={onClose} className="text-blue-300 hover:text-white transition">
            <FiX size={18} />
          </button>
        </div>

        <div className="p-5">
          {/* Trader info */}
          <div className="bg-[#f4f6fb] rounded-[4px] p-4 mb-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FiUser size={14} className="text-[#1a3a8f] flex-shrink-0" />
              <span className="font-semibold">{trader.first_name} {trader.middle_name || ""} {trader.last_name}</span>
              <span className="text-xs text-gray-400 ml-auto">{trader.user_code}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiMail size={14} className="text-[#1a3a8f] flex-shrink-0" />
              <span>{trader.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FiPhone size={14} className="text-[#1a3a8f] flex-shrink-0" />
              <span>{trader.phone}</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-[4px] mb-4">
              {error}
            </div>
          )}

          {/* Before reset */}
          {!result && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                A temporary password will be generated and sent to the trader's email automatically.
                You can also copy it to share manually via WhatsApp or SMS.
              </p>
              <button onClick={handleReset} disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[4px] text-sm font-semibold transition disabled:opacity-60"
                style={{ background: "#1a3a8f", color: "#F5C518" }}>
                <FiSend size={15} />
                {loading ? "Generating..." : "Generate & Send Password"}
              </button>
            </>
          )}

          {/* After reset — show temp password */}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <FiCheck size={16} />
                Password reset successfully. Email sent to trader.
              </div>

              <div>
                <p className="text-xs text-gray-500 font-medium mb-1.5">Temporary Password</p>
                <div className="flex items-center gap-2 bg-[#f4f6fb] border border-gray-200 rounded-[4px] px-3 py-2.5">
                  <code className="flex-1 text-lg font-bold text-[#1a3a8f] tracking-widest">
                    {result.tempPassword}
                  </code>
                  <button onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold transition"
                    style={{ background: copied ? "#dcfce7" : "#1a3a8f", color: copied ? "#16a34a" : "#F5C518" }}>
                    {copied ? <><FiCheck size={12} /> Copied</> : <><FiCopy size={12} /> Copy</>}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Share this manually via WhatsApp or SMS if needed. Email was sent automatically.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-[4px] px-3 py-2.5 text-xs text-amber-700">
                Trader will be forced to change this password on next login.
              </div>

              <button onClick={onClose}
                className="w-full py-2.5 rounded-[4px] text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
