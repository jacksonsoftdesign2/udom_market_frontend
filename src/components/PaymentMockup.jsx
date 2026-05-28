import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CONTACT = "+255748399067";

const PAYMENT_METHODS = [
  { name: "M-Pesa",       src: "/payment-logos/mpesa.png" },
  { name: "Mix by YAS",   src: "/payment-logos/mixx.png" },
  { name: "Airtel Money", src: "/payment-logos/airtel.png" },
  { name: "HaloPesa",     src: "/payment-logos/halopesa.png" },
  { name: "Azam Pesa",    src: "/payment-logos/azampesa.png" },
  { name: "Visa",         src: "/payment-logos/visa.svg" },
];

export default function PaymentMockup({ user, onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState("main");

  const handleClose = () => {
    onClose();
    navigate("/login");
  };

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
              onClick={() => setStep(step === "contact" ? "method" : "main")}
              className="text-[#F5C518]/70 hover:text-[#F5C518] transition flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[#F5C518] font-bold text-sm">
                {step === "method" ? "Select Payment Method" : "Contact Management"}
              </p>
              <p className="text-blue-300 text-xs font-mono truncate">{user?.user_code}</p>
            </div>
            <span className="bg-[#F5C518]/15 text-[#F5C518] text-xs font-bold px-3 py-1 rounded-[4px] border border-[#F5C518]/30 flex-shrink-0">
              TZS 10,000
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
                    src={user.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name + " " + user.last_name)}&background=1a3a8f&color=F5C518`}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#c7d6f5] flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">
                      {user.first_name} {user.last_name}
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
                <p className="text-4xl font-black text-[#1a3a8f]">10,000</p>
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
                    onClick={() => setStep("contact")}
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
                  Online payment coming soon. Contact management to complete payment manually.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep("contact")}
                  className="flex-1 bg-[#1a3a8f] text-[#F5C518] py-2.5 rounded-[4px] font-bold text-sm hover:bg-[#0f2460] transition"
                >
                  Contact to Pay
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

              {/* ── 3 contact buttons ── */}
              <div className="grid grid-cols-3 gap-2">

                {/* WhatsApp */}
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

                {/* SMS */}
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

                {/* Call */}
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