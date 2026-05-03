

import { useState } from "react";
import { FiX } from "react-icons/fi";
import AddressMapPicker from "./AddressMapPicker";

const API = import.meta.env.VITE_API_URL;

export default function OrderModal({ product, onClose, onContact }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    explanation: "",
    quantity: 1,
  });

  const [address, setAddress] = useState({
    region: "",
    district: "",
    street: "",
    latitude: null,
    longitude: null,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Validation ──
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (form.phone.replace(/\D/g, "").length < 9) e.phone = "Enter a valid phone number";
    if (!address.region.trim()) e.region = "Region is required";
    if (!address.district.trim()) e.district = "District is required";
    if (!address.street.trim()) e.street = "Street / Village is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      // Scroll to top of modal to show errors
      document.getElementById("order-modal-body")?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    try {
      const customer_location = [address.region, address.district, address.street]
        .filter(Boolean)
        .join(", ");

      const res = await fetch(`${API}/orders/place`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          customer_name: form.name.trim(),
          customer_phone: form.phone.trim(),
          customer_location,
          customer_latitude: address.latitude,
          customer_longitude: address.longitude,
          note: form.explanation.trim(),
          quantity: form.quantity,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inp = (field) =>
    `w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-400 transition ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"
    }`;

  // ── Out of stock ──
  if (!product.stock || product.stock <= 0) return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-red-500 text-base">Out of Stock</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">✕</button>
        </div>
        <div className="p-6 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <h4 className="font-bold text-gray-800 text-lg">We're Sorry!</h4>
          <p className="text-sm text-gray-500">This product is currently out of stock. Contact the trader for more information.</p>
          <div className="flex gap-3 w-full mt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={onContact} className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition">Contact Trader</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        id="order-modal-body"
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-3xl">
          <div>
            <h3 className="font-bold text-gray-800 text-base">Place Order</h3>
            <p className="text-xs text-gray-400 truncate max-w-[240px]">{product.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
            <FiX size={14} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center py-10 px-6 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">✓</div>
            <h4 className="font-bold text-gray-800 text-lg">Order Placed!</h4>
            <p className="text-sm text-gray-500">The trader will contact you on <b>{form.phone}</b></p>
            <button onClick={onClose} className="mt-2 px-8 py-2.5 bg-blue-500 text-white rounded-xl font-semibold text-sm">Done</button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Price + Quantity */}
            <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
              <div>
                <p className="text-xs text-gray-400">Unit price</p>
                <p className="text-xs text-gray-500 font-semibold">Tsh {Number(product.price).toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Total</p>
                <p className="text-lg font-black text-blue-700">Tsh {(Number(product.price) * form.quantity).toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs text-gray-400">Quantity</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 font-bold text-gray-600">−</button>
                  <span className="w-6 text-center font-bold">{form.quantity}</span>
                  <button onClick={() => setForm(f => ({ ...f, quantity: Math.min(product.stock, f.quantity + 1) }))}
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 font-bold text-gray-600">+</button>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Full Name *</label>
              <input type="text" placeholder="Your full name" value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: "" })); }}
                className={inp("name")} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone Number *</label>
              <input type="tel" placeholder="e.g. 0712 345 678" value={form.phone}
                onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: "" })); }}
                className={inp("phone")} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {/* Address section */}
            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50 space-y-1">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">
                📍 Delivery Address <span className="text-red-500">*</span>
              </p>
              <AddressMapPicker
                address={address}
                onChange={(newAddr) => {
                  setAddress(newAddr);
                  // Clear address errors when user updates
                  setErrors(er => ({ ...er, region: "", district: "", street: "" }));
                }}
                errors={{
                  region: errors.region,
                  district: errors.district,
                  street: errors.street,
                }}
              />
            </div>

            {/* Explanation */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Note (optional)</label>
              <textarea placeholder="Any special request or delivery instructions…" value={form.explanation}
                onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-blue-400 transition"
                rows={2} />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1 pb-2">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 disabled:opacity-70">
                {submitting ? "Placing…" : "🛒 Place Order"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
