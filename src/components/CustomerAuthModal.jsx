import { useState } from "react";
import { FiX, FiUser, FiLock, FiMail } from "react-icons/fi";
import { setCustomerSession } from "../utils/customerAuth";

const API = import.meta.env.VITE_API_URL;

export default function CustomerAuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register" | "otp"
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLoginOrRegister = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!identifier.trim() || !password.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError("Name is required");
      return;
    }

    setSubmitting(true);
    try {
      const url = mode === "login" ? `${API}/customers/login` : `${API}/customers/register`;
      const body = mode === "login"
        ? { identifier: identifier.trim(), password }
        : { name: name.trim(), identifier: identifier.trim(), password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.needsVerification) {
          setPendingEmail(data.email || identifier.trim());
          setMode("otp");
          setInfo("Please verify your email to continue.");
          return;
        }
        setError(data.message || "Something went wrong");
        return;
      }

      if (data.needsVerification) {
        setPendingEmail(data.email);
        setMode("otp");
        setInfo("We sent a 6-digit code to your email.");
        return;
      }

      if (data.token && data.customer) {
        setCustomerSession(data.token, data.customer);
        onSuccess?.(data.customer);
        onClose();
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError("Enter the 6-digit code");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/customers/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, code: otpCode.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Verification failed");
        return;
      }

      if (data.token && data.customer) {
        setCustomerSession(data.token, data.customer);
        onSuccess?.(data.customer);
        onClose();
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setInfo("");
    try {
      const res = await fetch(`${API}/customers/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Could not resend code");
        return;
      }
      setInfo("A new code has been sent.");
    } catch {
      setError("Network error — please try again");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-[8px] md:rounded-[8px] w-full md:max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-lg font-bold text-gray-800">
            {mode === "login" ? "Log in" : mode === "register" ? "Create account" : "Verify your email"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>

        {mode !== "otp" ? (
          <>
            <p className="text-xs md:text-sm text-gray-400 mb-4">
              {mode === "login"
                ? "Log in to like products and get personalized picks."
                : "Sign up to save favorites and see more of what you like."}
            </p>

            <form onSubmit={handleLoginOrRegister} className="space-y-3">
              {mode === "register" && (
                <div className="flex items-center gap-2 border border-gray-200 rounded-[4px] px-3 py-2.5">
                  <FiUser size={15} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="flex-1 outline-none text-sm md:text-base"
                    required
                  />
                </div>
              )}

              <div className="flex items-center gap-2 border border-gray-200 rounded-[4px] px-3 py-2.5">
                <FiMail size={15} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Email or phone number"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="flex-1 outline-none text-sm md:text-base"
                  required
                />
              </div>

              <div className="flex items-center gap-2 border border-gray-200 rounded-[4px] px-3 py-2.5">
                <FiLock size={15} className="text-gray-400 flex-shrink-0" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="flex-1 outline-none text-sm md:text-base"
                  required
                />
              </div>

              {error && (
                <p className="text-xs md:text-sm text-red-500 bg-red-50 border border-red-100 rounded-[4px] px-3 py-2">
                  {error}
                </p>
              )}
              {info && (
                <p className="text-xs md:text-sm text-blue-600 bg-blue-50 border border-blue-100 rounded-[4px] px-3 py-2">
                  {info}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-[4px] text-sm md:text-base font-semibold text-white disabled:opacity-50"
                style={{ background: "#1a3a8f" }}
              >
                {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
              </button>
            </form>

            <p className="text-xs md:text-sm text-gray-400 text-center mt-4">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setInfo(""); }}
                className="text-blue-600 font-semibold"
              >
                {mode === "login" ? "Sign up" : "Log in"}
              </button>
            </p>
          </>
        ) : (
          <>
            <p className="text-xs md:text-sm text-gray-400 mb-4">
              Enter the 6-digit code sent to <span className="font-semibold text-gray-600">{pendingEmail}</span>.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center text-xl md:text-2xl tracking-[0.4em] font-bold border border-gray-200 rounded-[4px] py-3 outline-none"
                required
              />

              {error && (
                <p className="text-xs md:text-sm text-red-500 bg-red-50 border border-red-100 rounded-[4px] px-3 py-2">
                  {error}
                </p>
              )}
              {info && (
                <p className="text-xs md:text-sm text-blue-600 bg-blue-50 border border-blue-100 rounded-[4px] px-3 py-2">
                  {info}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-[4px] text-sm md:text-base font-semibold text-white disabled:opacity-50"
                style={{ background: "#1a3a8f" }}
              >
                {submitting ? "Verifying..." : "Verify"}
              </button>
            </form>

            <p className="text-xs md:text-sm text-gray-400 text-center mt-4">
              Didn't get a code?{" "}
              <button onClick={handleResendOtp} className="text-blue-600 font-semibold">
                Resend
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}