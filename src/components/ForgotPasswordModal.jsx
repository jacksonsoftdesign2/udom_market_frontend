import { useState, useEffect, useRef } from "react";
import { FiX, FiMail, FiPhone, FiUser, FiEye, FiEyeOff, FiClock } from "react-icons/fi";
import { IoKeyOutline } from "react-icons/io5";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1);

  // Step 1
  const [userCode, setUserCode] = useState("");
  const [phone, setPhone]       = useState("");
  const [email, setEmail]       = useState("");

  // Step 2
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft]   = useState(600);
  const [expired, setExpired]     = useState(false);
  const inputRefs                 = useRef([]);

  // Step 3
  const [resetToken, setResetToken]           = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  // ── Countdown ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 2) return;
    setTimeLeft(600);
    setExpired(false);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); setExpired(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // ── OTP input ──────────────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    value = value.toUpperCase().replace(/[^A-Z0-9]/, "");
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    const updated = [...otpDigits];
    pasted.split("").forEach((char, i) => { updated[i] = char; });
    setOtpDigits(updated);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── Step 1: Send OTP ───────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    setError(""); setSuccess("");
    if (!userCode || !phone || !email) return setError("All fields are required.");
    setLoading(true);
    try {
      await axios.post(`${API}/users/forgot-password`, { user_code: userCode, phone, email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally { setLoading(false); }
  };

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    setError(""); setSuccess("");
    const otp = otpDigits.join("");
    if (otp.length < 6) return setError("Enter the full 6-character OTP.");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/users/verify-otp`, { user_code: userCode, otp });
      setResetToken(res.data.reset_token);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP.");
    } finally { setLoading(false); }
  };

  // ── Step 2: Resend OTP ─────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    setError(""); setSuccess("");
    setOtpDigits(["", "", "", "", "", ""]);
    setLoading(true);
    try {
      await axios.post(`${API}/users/forgot-password`, { user_code: userCode, phone, email });
      setExpired(false);
      setTimeLeft(600);
      setSuccess("New OTP sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally { setLoading(false); }
  };

  // ── Step 3: Reset Password ─────────────────────────────────────────────────
  const handleResetPassword = async () => {
    setError(""); setSuccess("");
    if (!newPassword || !confirmPassword) return setError("Both fields are required.");
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      await axios.put(`${API}/users/reset-password/${resetToken}`, { new_password: newPassword });
      setSuccess("Password reset successfully! You can now log in.");
      setTimeout(onClose, 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally { setLoading(false); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-sm bg-white md:rounded-[8px] rounded-t-[8px] px-6 pt-6 pb-8"
        onClick={e => e.stopPropagation()}
        style={{ animation: "slideUp 0.3s cubic-bezier(.34,1.2,.64,1) both" }}
      >
        {/* Drag handle — mobile */}
        <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-5 md:hidden" />

        {/* Close */}
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <FiX size={18} />
          </button>
        </div>

        {/* Icon + heading */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-12 h-12 rounded-[8px] bg-[#eef1f9] flex items-center justify-center mb-3">
            <IoKeyOutline size={24} color="#1a3a8f" />
          </div>
          <h2 className="text-base font-bold text-gray-800 text-center">Forgot your password?</h2>
          <p className="text-xs text-gray-400 mt-1 text-center">
            {step === 1 && "Verify your identity to receive a reset code."}
            {step === 2 && "Enter the 6-character code sent to your email."}
            {step === 3 && "Choose a strong new password."}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1.5 mb-5">
          {["Your Details", "Verify OTP", "New Password"].map((label, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                  ${step === i + 1
                    ? "bg-[#1a3a8f] text-[#F5C518]"
                    : step > i + 1
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-400"}`}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span className={`text-[9px] font-semibold whitespace-nowrap
                  ${step === i + 1 ? "text-[#1a3a8f]" : "text-gray-300"}`}>
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div className={`w-7 h-px mb-3 ${step > i + 1 ? "bg-green-400" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="h-px bg-gray-100 mb-4" />

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="relative">
              <FiUser size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Trader ID (e.g. TRD001)"
                value={userCode}
                onChange={e => setUserCode(e.target.value.toUpperCase())}
                className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-[4px] focus:outline-none focus:border-[#1a3a8f] focus:ring-1 focus:ring-[#1a3a8f]/20 bg-white"
              />
            </div>

            <div className="relative">
              <FiPhone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                placeholder="Registered phone number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-[4px] focus:outline-none focus:border-[#1a3a8f] focus:ring-1 focus:ring-[#1a3a8f]/20 bg-white"
              />
            </div>

            <div className="relative">
              <FiMail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Registered email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-[4px] focus:outline-none focus:border-[#1a3a8f] focus:ring-1 focus:ring-[#1a3a8f]/20 bg-white"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-[4px]">
                {error}
              </div>
            )}

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-2.5 bg-[#1a3a8f] hover:bg-[#0f2460] text-[#F5C518] text-sm font-semibold rounded-[4px] transition disabled:opacity-60 mt-1"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="space-y-4">

            {/* Timer */}
            <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-[4px] text-sm font-semibold border
              ${expired
                ? "bg-red-50 border-red-200 text-red-500"
                : "bg-[#eef1f9] border-[#1a3a8f]/20 text-[#1a3a8f]"}`}>
              {expired ? (
                <span>OTP expired</span>
              ) : (
                <><FiClock size={14} /><span>{formatTime(timeLeft)} remaining</span></>
              )}
            </div>

            {/* OTP boxes */}
            <div className="flex gap-2 justify-center">
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  disabled={expired}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  className={`w-11 h-12 text-center text-base font-bold border rounded-[4px] focus:outline-none transition
                    ${expired
                      ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                      : digit
                      ? "border-[#1a3a8f] bg-[#eef1f9] text-[#1a3a8f]"
                      : "border-gray-200 bg-white text-gray-800 focus:border-[#1a3a8f] focus:ring-1 focus:ring-[#1a3a8f]/20"
                    }`}
                />
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-[4px]">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 text-xs px-3 py-2 rounded-[4px]">
                {success}
              </div>
            )}

            {expired ? (
              <button
                onClick={handleResendOtp}
                disabled={loading}
                className="w-full py-2.5 bg-[#1a3a8f] hover:bg-[#0f2460] text-[#F5C518] text-sm font-semibold rounded-[4px] transition disabled:opacity-60"
              >
                {loading ? "Resending..." : "Resend OTP"}
              </button>
            ) : (
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otpDigits.join("").length < 6}
                className="w-full py-2.5 bg-[#1a3a8f] hover:bg-[#0f2460] text-[#F5C518] text-sm font-semibold rounded-[4px] transition disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            )}

            <button
              onClick={() => { setStep(1); setError(""); setOtpDigits(["","","","","",""]); }}
              className="w-full text-xs text-gray-400 hover:text-[#1a3a8f] transition font-semibold"
            >
              ← Back to details
            </button>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full pl-3 pr-9 py-2.5 text-sm border border-gray-200 rounded-[4px] focus:outline-none focus:border-[#1a3a8f] focus:ring-1 focus:ring-[#1a3a8f]/20 bg-white"
              />
              <button onClick={() => setShowNew(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a3a8f] transition">
                {showNew ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full pl-3 pr-9 py-2.5 text-sm border border-gray-200 rounded-[4px] focus:outline-none focus:border-[#1a3a8f] focus:ring-1 focus:ring-[#1a3a8f]/20 bg-white"
              />
              <button onClick={() => setShowConfirm(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a3a8f] transition">
                {showConfirm ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>

            <p className="text-[10px] text-gray-400 leading-relaxed">
              Must be 8+ characters with uppercase, lowercase, number and special character (@$!%*?&)
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-[4px]">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 text-xs px-3 py-2 rounded-[4px]">
                {success}
              </div>
            )}

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full py-2.5 bg-[#1a3a8f] hover:bg-[#0f2460] text-[#F5C518] text-sm font-semibold rounded-[4px] transition disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default ForgotPasswordModal;