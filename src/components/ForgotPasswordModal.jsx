
import { FiPhone, FiX } from "react-icons/fi";
import { IoKeyOutline } from "react-icons/io5";
import { BsWhatsapp } from "react-icons/bs";
function ForgotPasswordModal({ onClose }) {
  const PHONE = "+255748399067";
  const WHATSAPP_LINK = `https://wa.me/255748399067?text=${encodeURIComponent("Hello, I need help resetting my UDOM Market password.")}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ animation: "popIn 0.25s cubic-bezier(.34,1.56,.64,1) both" }}
      >
        {/* ── top accent bar ── */}
        <div className="h-2 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />

        {/* ── close button ── */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl leading-none transition"
          aria-label="Close"
       ><FiX size={18} /></button>

        <div className="px-7 pt-6 pb-7">
          {/* ── icon ── */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-3xl shadow-lg mb-4">
             <IoKeyOutline size={28} color="white" />
</div>

          {/* ── heading ── */}
          <h2 className="text-xl font-extrabold text-gray-800 leading-tight">
            Forgot your password?
          </h2>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Contact the admin directly and we'll help you reset it right away.
          </p>

          {/* ── divider ── */}
          <div className="border-t border-gray-100 mb-5" />

          {/* ── contact options ── */}
          <div className="space-y-3">

            {/* Phone call */}
            <a
              href={`tel:${PHONE}`}
              className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                 <FiPhone size={20} className="text-blue-500" />
                </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Call us</p>
                <p className="text-sm font-bold text-gray-800">{PHONE}</p>
              </div>
              <span className="text-blue-400 text-xs font-semibold flex-shrink-0">Tap to call →</span>
            </a>

            {/* WhatsApp */}
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                 <BsWhatsapp size={20} className="text-green-500" />
                </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">WhatsApp</p>
                <p className="text-sm font-bold text-gray-800">{PHONE}</p>
              </div>
              <span className="text-green-500 text-xs font-semibold flex-shrink-0">Message →</span>
            </a>
          </div>

          {/* ── footer note ── */}
          <p className="text-center text-[11px] text-gray-400 mt-5">
            We'll verify your identity and reset your password manually.
          </p>
        </div>

        {/* ── keyframe ── */}
        <style>{`
          @keyframes popIn {
            from { opacity: 0; transform: scale(0.88) translateY(16px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
