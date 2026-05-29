import { useState } from "react";
import { API } from "../api";
import { FiLock, FiEye, FiEyeOff, FiCheck, FiAlertCircle } from "react-icons/fi";
import logo from "../assets/upmarket_logo.png";

export default function SetNewPasswordModal({ onSuccess }) {
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState("");
  const token = localStorage.getItem("token");

  const checks = {
    length:    newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number:    /\d/.test(newPassword),
    special:   /[@$!%*?&]/.test(newPassword),
  };
  const strength = Object.values(checks).filter(Boolean).length;
  const strengthLabel = ["", "Weak", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#ef4444", "#f59e0b", "#3b82f6", "#16a34a"][strength];

  const handleSubmit = async () => {
    setError("");
    if (!newPassword || !confirmPassword) { setError("Both fields are required"); return; }
    if (newPassword !== confirmPassword)  { setError("Passwords do not match"); return; }
    if (strength < 5) { setError("Password does not meet all requirements"); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API}/users/set-new-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ new_password: newPassword, confirm_password: confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update password");

      // Update localStorage flag
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.must_change_password = false;
      localStorage.setItem("user", JSON.stringify(user));

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Full screen — cannot dismiss
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 text-center border-b border-gray-100"
          style={{ background: "#1a3a8f" }}>
          <div className="w-12 h-12 rounded-[4px] bg-[#F5C518] flex items-center justify-center mx-auto mb-3">
            <img src={logo} alt="logo" className="w-8 h-8 object-contain" />
          </div>
          <h2 className="text-white font-bold text-base">Set New Password</h2>
          <p className="text-blue-300 text-xs mt-1">
            Your password was reset by admin. Please set a new password to continue.
          </p>
        </div>

        <div className="p-5 space-y-4">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-[4px]">
              <FiAlertCircle size={14} /> {error}
            </div>
          )}

          {/* New password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password</label>
            <div className="relative">
              <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-[4px] text-sm focus:outline-none focus:border-[#1a3a8f]" />
              <button type="button"
                onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
          </div>

          {/* Strength indicator */}
          {newPassword.length > 0 && (
            <div>
              <div className="flex gap-1 mb-1.5">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
                    style={{ background: i <= strength ? strengthColor : "#e5e7eb" }} />
                ))}
              </div>
              <p className="text-xs text-gray-400 mb-2">
                Strength: <span className="font-semibold" style={{ color: strengthColor }}>{strengthLabel}</span>
              </p>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { key: "length",    label: "8+ characters" },
                  { key: "uppercase", label: "Uppercase letter" },
                  { key: "lowercase", label: "Lowercase letter" },
                  { key: "number",    label: "Number" },
                  { key: "special",   label: "Special char (@$!%*?&)" },
                ].map(r => (
                  <div key={r.key} className={`flex items-center gap-1 text-xs ${checks[r.key] ? "text-green-600" : "text-gray-400"}`}>
                    <FiCheck size={10} strokeWidth={checks[r.key] ? 3 : 1.5} />
                    {r.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password</label>
            <div className="relative">
              <FiLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-[4px] text-sm focus:outline-none focus:border-[#1a3a8f]" />
              <button type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
            {confirmPassword && (
              <p className={`text-xs mt-1 ${newPassword === confirmPassword ? "text-green-600" : "text-red-500"}`}>
                {newPassword === confirmPassword ? "✓ Passwords match" : "Passwords do not match"}
              </p>
            )}
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-2.5 rounded-[4px] text-sm font-semibold transition disabled:opacity-60"
            style={{ background: "#1a3a8f", color: "#F5C518" }}>
            {loading ? "Updating..." : "Set New Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
