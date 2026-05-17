import { FiPhone, FiX, FiMessageSquare, FiMail } from "react-icons/fi";
import { IoKeyOutline } from "react-icons/io5";
import { BsWhatsapp } from "react-icons/bs";

function ForgotPasswordModal({ onClose }) {
  const PHONE = "+255748399067";
  const WHATSAPP_LINK = `https://wa.me/255748399067?text=${encodeURIComponent("Hello, I need help resetting my UDOM Market password.")}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-sm bg-white md:rounded-2xl rounded-t-2xl px-6 pt-6 pb-8"
        onClick={e => e.stopPropagation()}
        style={{ animation: "slideUp 0.3s cubic-bezier(.34,1.2,.64,1) both" }}
      >
        {/* Drag handle — mobile only */}
        <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-5 md:hidden" />

        {/* Close button */}
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <FiX size={18} />
          </button>
        </div>

        {/* Key icon + heading — centered */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <IoKeyOutline size={24} color="#374151" />
          </div>
          <h2 className="text-base font-bold text-gray-800 text-center">Forgot your password?</h2>
          <p className="text-xs text-gray-400 mt-1 text-center">Contact admin and we'll reset it right away.</p>
        </div>

        <div className="h-px bg-gray-100 mb-4" />

        {/* Phone */}
        <a
          href={`tel:${PHONE}`}
          className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition mb-3"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <FiPhone size={17} className="text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Call us</p>
            <p className="text-sm font-bold text-gray-800">{PHONE}</p>
          </div>
          <span className="text-xs text-blue-500 font-semibold">Call →</span>
        </a>

        {/* WhatsApp */}
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition mb-3"
        >
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
            <BsWhatsapp size={17} className="text-green-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">WhatsApp</p>
            <p className="text-sm font-bold text-gray-800">{PHONE}</p>
          </div>
          <span className="text-xs text-green-500 font-semibold">Message →</span>
        </a>

        {/* SMS */}
        <a
          href={`sms:${PHONE}`}
          className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition mb-3"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <FiMessageSquare size={17} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">SMS</p>
            <p className="text-sm font-bold text-gray-800">{PHONE}</p>
          </div>
          <span className="text-xs text-blue-400 font-semibold">Text →</span>
        </a>

        {/* Email */}
        <a
          href="mailto:jacksonduwanghe@gmail.com"
          className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
            <FiMail size={17} className="text-purple-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Email</p>
            <p className="text-sm font-bold text-gray-800">jacksonduwanghe@gmail.com</p>
          </div>
          <span className="text-xs text-purple-500 font-semibold">Send →</span>
        </a>
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