import { useState } from "react";
import { FiX, FiUser, FiLock, FiMail } from "react-icons/fi";
import { setCustomerSession } from "../utils/customerAuth";

const API = import.meta.env.VITE_API_URL;

export default function CustomerAuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password.trim()) {
      setError("Please fill in all required fields");
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
        setError(data.message || "Something went wrong");
        return;
      }

      setCustomerSession(data.token, data.customer);
      onSuccess?.(data.customer);
      onClose();
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
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
          <h2 className="text-lg font-bold text-gray-800">
            {mode === "login" ? "Log in" : "Create account"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-4">
          {mode === "login"
            ? "Log in to like products and get personalized picks."
            : "Sign up to save favorites and see more of what you like."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div className="flex items-center gap-2 border border-gray-200 rounded-[4px] px-3 py-2.5">
              <FiUser size={15} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={e => setName(e.target.value)}
                className="flex-1 outline-none text-sm"
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
              className="flex-1 outline-none text-sm"
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
              className="flex-1 outline-none text-sm"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-[4px] px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-[4px] text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "#1a3a8f" }}
          >
            {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            className="text-blue-600 font-semibold"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}