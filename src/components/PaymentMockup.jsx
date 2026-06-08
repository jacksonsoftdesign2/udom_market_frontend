import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api";
import axios from "axios";

const CONTACT = "+255748399067";

const PAYMENT_METHODS = [
  { name: "M-Pesa",       src: "/payment-logos/mpesa.png",    provider: "Mpesa"    },
  { name: "Mix by YAS",   src: "/payment-logos/mixx.png",     provider: "Tigo"     },
  { name: "Airtel Money", src: "/payment-logos/airtel.png",   provider: "Airtel"   },
  { name: "HaloPesa",     src: "/payment-logos/halopesa.png", provider: "Halopesa" },
  { name: "Azam Pesa",    src: "/payment-logos/azampesa.png", provider: "Azampesa" },
  { name: "Visa",         src: "/payment-logos/visa.svg",     provider: null       },
];

export default function PaymentMockup({ user, onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState("main");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── AzamPay state ──
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [phone, setPhone] = useState("");
  const [payStatus, setPayStatus] = useState("idle"); // idle | loading | waiting | success | failed
  const [payMessage, setPayMessage] = useState("");
  const [paymentId, setPaymentId] = useState(null);
  const pollRef = useRef(null);

  // ── Fetch payment settings on mount ──
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API}/admin/payment-settings`);
        setSettings(res.data);

        // If registration payment is disabled/free, auto-approve and close
        if (!res.data.payments_active || !res.data.registration_active) {
          // Auto-approve: registration is free
          setTimeout(() => {
            onClose();
            navigate("/login");
          }, 1500);
        }
      } catch (err) {
        console.error('Error fetching payment settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // cleanup polling on unmount
  useEffect(() => () => clearInterval(pollRef.current), []);

  const handleClose = () => {
    clearInterval(pollRef.current);
    onClose();
    navigate("/login");
  };

  // ── Normalize phone to +255XXXXXXXXX ──
  const normalizePhone = (raw) => {
    let p = raw.replace(/[\s\-]/g, "");
    if (/^0[67]\d{8}$/.test(p)) p = "+255" + p.slice(1);
    if (/^255[67]\d{8}$/.test(p)) p = "+" + p;
    return p;
  };

  // ── Select a method ──
  const handleSelectMethod = (method) => {
    if (!method.provider) {
      // Visa → contact (not supported yet)
      setStep("contact");
      return;
    }
    setSelectedMethod(method);
    setPhone("");
    setPayStatus("idle");
    setPayMessage("");
    setStep("pay");
  };

  // ── Initiate registration payment ──
  const handlePay = async () => {
    const normalized = normalizePhone(phone);
    if (!/^\+255[67]\d{8}$/.test(normalized)) {
      setPayMessage("Enter a valid Tanzanian number e.g. 0748 399 067");
      return;
    }

    setPayStatus("loading");
    setPayMessage("");

    try {
      const res = await axios.post(
        `${API}/payments/registration-pay`,
        { user_code: user?.user_code, phone: normalized }
      );

      if (res.data.free) {
        // Registration is free
        setPayStatus("success");
        setPayMessage(res.data.message);
        setTimeout(() => {
          onClose();
          navigate("/login");
        }, 2000);
        return;
      }

      setPaymentId(res.data.payment_id);
      setPayStatus("waiting");
      setPayMessage(`Request sent! Check your ${selectedMethod.name} on ${normalized} and enter your PIN.`);

      // ── Poll for status every 4 seconds ──
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await axios.get(
            `${API}/payments/trader-status/${res.data.payment_id}`
          );
          const status = statusRes.data?.status;
          if (status === "approved") {
            clearInterval(pollRef.current);
            setPayStatus("success");
            setPayMessage("Payment successful! Your account has been activated. Redirecting...");
            setTimeout(() => {
              onClose();
              navigate("/login");
            }, 2000);
          } else if (status === "rejected") {
            clearInterval(pollRef.current);
            setPayStatus("failed");
            setPayMessage("Payment failed or was rejected. Please try again.");
          }
        } catch (_) {}
      }, 4000);

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollRef.current);
        if (payStatus === "waiting") {
          setPayStatus("failed");
          setPayMessage("Payment timed out. Please try again.");
        }
      }, 300000);

    } catch (err) {
      setPayStatus("failed");
      setPayMessage(err.response?.data?.message || "Failed to initiate payment. Try again.");
    }
  };

  // ── Header label per step ──
  const headerTitle = {
    main:    null,
    method:  "Select Payment Method",
    pay:     selectedMethod ? `Pay via ${selectedMethod.name}` : "Pay",
    contact: "Contact Management",
  };

  // ── If still loading settings, show spinner ──
  if (loading) {
    return (
      <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-[4px] p-8 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#c7d6f5] border-t-[#1a3a8f] rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#1a3a8f]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[10002] flex justify-center bg-black/60 backdrop-blur-sm px-4 ${step === "contact" ? "items-end md:items-center" : "items-center"}`}>
      <div className={`w-full max-w-sm bg-white shadow-2xl overflow-hidden ${step === "contact" ? "rounded-t-[4px] md:rounded-[4px]" : "rounded-[4px]"}`}>

        {step === "contact" && (
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>
        )}

        {/* ── Header ── */}
        {step === "main" ? (
          <div className="bg-[#1a3a8f] px-6 py-5 flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-[#F5C518]/15 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="#F5C518" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="text-[#F5C518] font-black text-xl text-center">Account Not Activated</h2>
            <p className="text-blue-300 text-xs text-center leading-relaxed">
              Complete the one-time registration fee to unlock full access.
            </p>
          </div>
        ) : (
          <div className="bg-[#1a3a8f] px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => {
                clearInterval(pollRef.current);
                setPayStatus("idle");
                if (step === "contact") setStep("method");
                else if (step === "pay") setStep("method");
                else setStep("main");
              }}
              className="text-[#F5C518]/70 hover:text-[#F5C518] transition flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[#F5C518] font-bold text-sm">{headerTitle[step]}</p>
              <p className="text-blue-300 text-xs font-mono truncate">{user?.user_code}</p>
            </div>
            <span className="bg-[#F5C518]/15 text-[#F5C518] text-xs font-bold px-3 py-1 rounded-[4px] border border-[#F5C518]/30 flex-shrink-0">
              TZS {settings?.registration_fee?.toLocaleString() || "0"}
            </span>
          </div>
        )}

        <div className="px-6 py-5 space-y-4">

          {/* ── MAIN STEP ── */}
          {step === "main" && (
            <>
              {user && (
                <div className="flex items-center gap-3 bg-[#f8fafc] rounded-[4px] px-4 py-3 border border-[#e2e8f0]">
                  <img
                    src={user.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.first_name || user.name || "") + " " + (user.last_name || ""))}&background=1a3a8f&color=F5C518`}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#c7d6f5] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">
                      {user.first_name || user.name} {user.last_name || ""}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">{user.user_code}</p>
                  </div>
                  <span className="text-xs bg-[#f0f4ff] text-[#1a3a8f] font-bold px-2 py-1 rounded-[4px] border border-[#c7d6f5] flex-shrink-0">
                    Inactive
                  </span>
                </div>
              )}

              <div className="bg-[#f0f4ff] border border-[#c7d6f5] rounded-[4px] px-4 py-4 text-center">
                <p className="text-xs text-[#4a6fa5] font-medium mb-1">One-time Registration Fee</p>
                <p className="text-4xl font-black text-[#1a3a8f]">{settings?.registration_fee?.toLocaleString() || "0"}</p>
                <p className="text-sm text-[#4a6fa5] font-semibold">TZS</p>
                <p className="text-xs text-gray-400 mt-2">Pay once · Access forever</p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setStep("method")}
                  className="w-full bg-[#1a3a8f] text-[#F5C518] py-3.5 rounded-[4px] font-bold text-sm hover:bg-[#0f2460] transition flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Make Payment
                </button>
                <button
                  onClick={() => setStep("contact")}
                  className="w-full bg-[#f0f4ff] border border-[#c7d6f5] text-[#1a3a8f] py-3 rounded-[4px] font-semibold text-sm hover:bg-[#e8edf7] transition flex items-center justify-center gap-2"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.69A2 2 0 012 .98h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  Call for Help
                </button>
                <button
                  onClick={handleClose}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] text-gray-500 py-2.5 rounded-[4px] font-medium text-sm hover:bg-[#f1f5f9] transition"
                >
                  Close for Now
                </button>
              </div>
            </>
          )}

          {/* ── METHOD STEP ── */}
          {step === "method" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectMethod(m)}
                    className="border border-[#e2e8f0] rounded-[4px] p-2.5 hover:border-[#1a3a8f] hover:bg-[#f0f4ff] transition bg-white flex flex-col items-center gap-1"
                  >
                    <img src={m.src} alt={m.name} className="w-full h-10 object-contain" />
                    <span className="text-[9px] text-gray-400 font-medium">{m.name}</span>
                  </button>
                ))}
              </div>

              <div className="bg-[#f0f4ff] border border-[#c7d6f5] rounded-[4px] px-3 py-2.5 flex gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#1a3a8f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-xs text-[#1a3a8f]">
                  Select your mobile money provider. Visa → contact management.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep("contact")}
                  className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] text-gray-600 py-2.5 rounded-[4px] font-medium text-sm hover:bg-[#f1f5f9] transition"
                >
                  Contact Instead
                </button>
                <button
                  onClick={() => setStep("main")}
                  className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] text-gray-600 py-2.5 rounded-[4px] font-medium text-sm hover:bg-[#f1f5f9] transition"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* ── PAY STEP ── */}
          {step === "pay" && (
            <div className="space-y-4">

              {/* Selected method badge */}
              <div className="flex items-center gap-3 bg-[#f0f4ff] border border-[#c7d6f5] rounded-[4px] px-4 py-3">
                <img src={selectedMethod?.src} alt={selectedMethod?.name} className="h-8 w-14 object-contain flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1a3a8f]">{selectedMethod?.name}</p>
                  <p className="text-xs text-gray-400">Mobile money payment</p>
                </div>
                <span className="text-xs font-black text-[#1a3a8f]">TZS {settings?.registration_fee?.toLocaleString() || "0"}</span>
              </div>

              {/* Phone input — only show when idle or failed */}
              {(payStatus === "idle" || payStatus === "failed") && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Your {selectedMethod?.name} Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); setPayMessage(""); }}
                      placeholder="e.g. 0748 399 067"
                      className="w-full px-4 py-3 border border-[#c7d6f5] rounded-[4px] text-sm focus:outline-none focus:border-[#1a3a8f] bg-white"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Enter the number registered with {selectedMethod?.name}</p>
                  </div>

                  {payMessage && (
                    <div className="bg-red-50 border border-red-100 rounded-[4px] px-3 py-2">
                      <p className="text-xs text-red-600">{payMessage}</p>
                    </div>
                  )}

                  <button
                    onClick={handlePay}
                    className="w-full bg-[#1a3a8f] text-[#F5C518] py-3.5 rounded-[4px] font-bold text-sm hover:bg-[#0f2460] transition flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Send Payment Request
                  </button>
                </>
              )}

              {/* Loading state */}
              {payStatus === "loading" && (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-12 h-12 border-4 border-[#c7d6f5] border-t-[#1a3a8f] rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-[#1a3a8f]">Sending request...</p>
                  <p className="text-xs text-gray-400 text-center">Connecting to {selectedMethod?.name}</p>
                </div>
              )}

              {/* Waiting for PIN */}
              {payStatus === "waiting" && (
                <div className="space-y-3">
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="w-14 h-14 rounded-full bg-[#f0f4ff] flex items-center justify-center">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="#1a3a8f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2"/>
                        <line x1="12" y1="18" x2="12.01" y2="18"/>
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-[#1a3a8f] text-center">Check your phone!</p>
                    <p className="text-xs text-gray-500 text-center leading-relaxed">{payMessage}</p>
                  </div>

                  <div className="bg-[#f0f4ff] border border-[#c7d6f5] rounded-[4px] px-4 py-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#1a3a8f] text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">1</div>
                      <p className="text-xs text-gray-600">A USSD prompt appeared on your phone</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#1a3a8f] text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">2</div>
                      <p className="text-xs text-gray-600">Enter your {selectedMethod?.name} PIN</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-[10px] flex items-center justify-center font-bold flex-shrink-0">3</div>
                      <p className="text-xs text-gray-400">This page updates automatically</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-2 h-2 bg-[#1a3a8f] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-[#1a3a8f] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-[#1a3a8f] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <p className="text-xs text-gray-400 ml-1">Waiting for confirmation...</p>
                  </div>
                </div>
              )}

              {/* Success */}
              {payStatus === "success" && (
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                      stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <p className="text-base font-black text-green-600">Payment Successful!</p>
                  <p className="text-xs text-gray-500 text-center">{payMessage}</p>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-[#1a3a8f] text-[#F5C518] py-3 rounded-[4px] font-bold text-sm hover:bg-[#0f2460] transition mt-2"
                  >
                    Go to Login
                  </button>
                </div>
              )}

              {/* Failed retry */}
              {payStatus === "failed" && (
                <div className="bg-red-50 border border-red-100 rounded-[4px] px-3 py-2.5 flex gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className="flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-xs text-red-600">{payMessage}</p>
                </div>
              )}

              {/* Back button when not waiting/loading */}
              {(payStatus === "idle" || payStatus === "failed") && (
                <button
                  onClick={() => { setStep("method"); setPayStatus("idle"); setPayMessage(""); }}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] text-gray-500 py-2.5 rounded-[4px] font-medium text-sm hover:bg-[#f1f5f9] transition"
                >
                  ← Choose Different Method
                </button>
              )}
            </div>
          )}

          {/* ── CONTACT STEP ── */}
          {step === "contact" && (
            <div className="space-y-3">
              <div className="bg-[#f0f4ff] border border-[#c7d6f5] rounded-[4px] px-4 py-4 space-y-1">
                <p className="text-xs font-bold text-[#1a3a8f] uppercase tracking-wide">
                  Contact Management
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Send your <span className="font-bold text-[#1a3a8f]">ID ({user?.user_code})</span> and
                  proof of payment to activate your account.
                </p>
                <p className="text-sm font-black text-[#1a3a8f] font-mono">{CONTACT}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://wa.me/${CONTACT.replace("+", "")}?text=Habari, ninaomba kuruhusiwa account yangu ya UDOM Market. ID yangu ni ${user?.user_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white py-3 rounded-[4px] text-xs font-bold transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>

                <a
                  href={`sms:${CONTACT}?body=Habari, ninaomba kuruhusiwa account yangu ya UDOM Market. ID yangu ni ${user?.user_code}`}
                  className="flex flex-col items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-[4px] text-xs font-bold transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                  SMS
                </a>

                <a
                  href={`tel:${CONTACT}`}
                  className="flex flex-col items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-[4px] text-xs font-bold transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.69A2 2 0 012 .98h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                  </svg>
                  Call
                </a>
              </div>

              <button
                onClick={() => setStep("main")}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] text-gray-600 py-2.5 rounded-[4px] font-medium text-sm hover:bg-[#f1f5f9] transition"
              >
                Back
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}