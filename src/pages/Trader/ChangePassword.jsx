import { useState } from "react";
import { API } from "../../api";
import { useNavigate } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff, FiCheck, FiAlertCircle, FiShield } from "react-icons/fi";

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ── password strength checks ──
  const checks = {
    length:    newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number:    /\d/.test(newPassword),
    special:   /[@$!%*?&]/.test(newPassword),
  };
  const strength = Object.values(checks).filter(Boolean).length;
  const strengthLabel = ["", "Weak", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (strength < 5) {
      setError("Please meet all password requirements.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to change password.");
        return;
      }

      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const navigate = useNavigate();

 // NEW
if (success) {
  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <FiCheck size={32} className="text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Password Changed!</h2>
        <p className="text-gray-500 text-sm mb-2">Your password has been updated successfully.</p>
        <p className="text-gray-400 text-xs mb-6">Please log in again with your new password.</p>
        <button
          onClick={() => {
            // clear session
            const userCode = JSON.parse(localStorage.getItem("user"))?.user_code || "";
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // navigate to login with user_code prefilled
            navigate("/login", { state: { user_code: userCode } });
          }}
          className="px-6 py-2.5 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition flex items-center gap-2"
        >
          <FiShield size={16} /> Go to Login
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="max-w-md mx-auto mt-6">
      <div className="bg-white rounded-2xl shadow p-6 md:p-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FiShield size={20} className="text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">Change Password</h2>
            <p className="text-xs text-gray-400">Keep your account secure</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Old Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiLock size={16} />
              </span>
              <input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required
                placeholder="Enter current password"
                className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />
              <button
                type="button"
                onClick={() => setShowOld(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOld ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiLock size={16} />
              </span>
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
                className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            {/* Strength bar */}
            {newPassword.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-gray-200"}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400">Strength: <span className="font-semibold text-gray-600">{strengthLabel}</span></p>
              </div>
            )}

            {/* Requirements */}
            {newPassword.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-1">
                {[
                  { key: "length",    label: "8+ characters" },
                  { key: "uppercase", label: "Uppercase letter" },
                  { key: "lowercase", label: "Lowercase letter" },
                  { key: "number",    label: "Number" },
                  { key: "special",   label: "Special char (@$!%*?&)" },
                ].map(r => (
                  <div key={r.key} className={`flex items-center gap-1 text-xs ${checks[r.key] ? "text-green-600" : "text-gray-400"}`}>
                    <FiCheck size={11} className={checks[r.key] ? "text-green-500" : "text-gray-300"} />
                    {r.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FiLock size={16} />
              </span>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat new password"
                className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm outline-none transition
                  ${confirmPassword && confirmPassword !== newPassword
                    ? "border-red-300 focus:ring-2 focus:ring-red-100"
                    : confirmPassword && confirmPassword === newPassword
                    ? "border-green-300 focus:ring-2 focus:ring-green-100"
                    : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
            {confirmPassword && confirmPassword === newPassword && (
              <p className="text-xs text-green-500 mt-1">Passwords match</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
              <FiAlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <FiShield size={16} />
                Update Password
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
