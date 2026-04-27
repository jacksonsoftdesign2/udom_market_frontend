import { useState } from "react";
import { FiX } from "react-icons/fi";

const API = import.meta.env.VITE_API_URL;


export default function OrderModal({ product, onClose }) {
  const [form, setForm] = useState({
    name: "", phone: "", region: "", district: "", street: "",
    explanation: "", quantity: 1
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/orders/place`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          customer_name: form.name.trim(),
          customer_phone: form.phone.trim(),
          customer_location: [form.region, form.district, form.street].filter(Boolean).join(", "),
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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-800 text-base">Place Order</h3>
            <p className="text-xs text-gray-400 truncate max-w-[240px]">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
          >
            <FiX size={14} />
          </button>
        </div>

        {success ? (
          /* Success state */
          <div className="flex flex-col items-center py-10 px-6 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">✓</div>
            <h4 className="font-bold text-gray-800 text-lg">Order Placed!</h4>
            <p className="text-sm text-gray-500">
              The trader will contact you on <b>{form.phone}</b>
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-8 py-2.5 bg-blue-500 text-white rounded-xl font-semibold text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            {/* Price + Quantity */}
            <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
              <div>
                <p className="text-xs text-gray-400">Unit price</p>
                <p className="text-xs text-gray-500 font-semibold">
                  Tsh {Number(product.price).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">Total</p>
                <p className="text-lg font-black text-blue-700">
                  Tsh {(Number(product.price) * form.quantity).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs text-gray-400">Quantity</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 font-bold text-gray-600"
                  >−</button>
                  <span className="w-6 text-center font-bold">{form.quantity}</span>
                  <button
                    onClick={() => setForm(f => ({ ...f, quantity: Math.min(product.stock, f.quantity + 1) }))}
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 font-bold text-gray-600"
                  >+</button>
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

            {/* Region */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Region</label>
              <input type="text" placeholder="e.g. Dodoma" value={form.region}
                onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                className={inp("region")} />
            </div>

            {/* District */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">District</label>
              <input type="text" placeholder="e.g. Bahi" value={form.district}
                onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                className={inp("district")} />
            </div>

            {/* Street */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Street</label>
              <input type="text" placeholder="e.g. Msalato Street" value={form.street}
                onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
                className={inp("street")} />
            </div>

            {/* Explanation */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Explanation (optional)</label>
              <textarea placeholder="Any special request..." value={form.explanation}
                onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                className={inp("explanation")} rows={2} />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
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
