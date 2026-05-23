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

  const unitPrice = Number(product.price);
  const total = unitPrice * form.quantity;
  const maxQty = product.stock || 99;

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
      document.getElementById("order-modal-body")?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    try {
      const customer_location = [address.region, address.district, address.street]
        .filter(Boolean).join(", ");
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

  const changeQty = (d) => {
    setForm(f => ({ ...f, quantity: Math.min(maxQty, Math.max(1, f.quantity + d)) }));
  };

  const handleQtyInput = (e) => {
    let v = parseInt(e.target.value) || 1;
    if (v < 1) v = 1;
    if (v > maxQty) v = maxQty;
    setForm(f => ({ ...f, quantity: v }));
  };

  // ── Out of stock ──
  if (!product.stock || product.stock <= 0) return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white shadow-2xl w-full max-w-sm overflow-hidden" style={{ borderRadius: 4 }} onClick={e => e.stopPropagation()}>
        <div style={{ background: "#1a3a8f", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Out of Stock</div>
            <div style={{ color: "#F5C518", fontSize: 12 }}>{product.name}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 3, color: "#fff", width: 22, height: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiX size={13} />
          </button>
        </div>
        <div style={{ padding: "24px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📦</div>
          <p style={{ fontWeight: 600, color: "#333", marginBottom: 6 }}>We're Sorry!</p>
          <p style={{ fontSize: 13, color: "#777", marginBottom: 16 }}>This product is currently out of stock. Contact the trader for more information.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "9px", border: "1px solid #ccc", background: "#fff", borderRadius: 3, fontSize: 13, color: "#444", cursor: "pointer" }}>Cancel</button>
            <button onClick={onContact} style={{ flex: 1, padding: "9px", background: "#1a3a8f", color: "#fff", border: "none", borderRadius: 3, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Contact Trader</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 4,
          width: "100%",
          maxWidth: 340,
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.22)",
        }}
      >

        {/* ── HEADER ── */}
        <div style={{ background: "#1a3a8f", padding: "7px 13px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>Place Order</div>
            <div style={{ color: "#F5C518", fontSize: 12, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid rgba(255,255,255,0.55)", borderRadius: 3, color: "#fff", width: 22, height: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FiX size={13} />
          </button>
        </div>

        {/* ── PRICE + QTY BAR ── */}
        <div style={{ padding: "6px 13px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e0e0e0", flexShrink: 0, background: "#fff" }}>
          <div>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 2 }}>Unit price: Tsh {unitPrice.toLocaleString()}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#222" }}>
              Total:{" "}
              <span style={{ background: "#F5C518", color: "#1a3a8f", padding: "1px 8px", borderRadius: 2, fontWeight: 700, fontSize: 13, marginLeft: 2 }}>
                Tsh {total.toLocaleString()}
              </span>
            </div>
          </div>
          {/* Qty control */}
          <div style={{ display: "flex", alignItems: "center", border: "1px solid #bbb", borderRadius: 3, overflow: "hidden" }}>
            <button onClick={() => changeQty(-1)} style={{ background: "#fff", border: "none", borderRight: "1px solid #bbb", color: "#333", width: 26, height: 26, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            <input
              type="number"
              value={form.quantity}
              min={1}
              max={maxQty}
              onChange={handleQtyInput}
              style={{ width: 32, height: 26, border: "none", textAlign: "center", fontSize: 13, color: "#333", background: "#fff", outline: "none", MozAppearance: "textfield" }}
            />
<button onClick={() => changeQty(1)} style={{ background: "#fff", border: "none", borderLeft: "1px solid #bbb", color: "#333", width: 26, height: 26, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
          <div style={{ fontSize: 10, color: "#999", textAlign: "center", marginTop: 2 }}>Max: {maxQty}</div>
        </div>

        {/* ── BODY ── */}
        {success ? (
          <div style={{ padding: "32px 16px", textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
            <div style={{ fontWeight: 600, fontSize: 16, color: "#333", marginBottom: 6 }}>Order Placed!</div>
            <p style={{ fontSize: 13, color: "#777", marginBottom: 20 }}>The trader will contact you on <strong>{form.phone}</strong></p>
            <button onClick={onClose} style={{ padding: "9px 32px", background: "#1a3a8f", color: "#fff", border: "none", borderRadius: 3, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Done</button>
          </div>
        ) : (
          <div id="order-modal-body" style={{ overflowY: "auto", padding: "8px 13px", flex: 1 }}>

            {/* Phone */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 3 }}>Phone Number <span style={{ color: "#e24b4a" }}>*</span></div>
              <input
                type="tel"
                placeholder="e.g. 0712 345 678"
                value={form.phone}
                onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: "" })); }}
                style={{ width: "100%", padding: "7px 9px", border: `1px solid ${errors.phone ? "#e24b4a" : "#ccc"}`, borderRadius: 3, fontSize: 13, color: "#333", background: errors.phone ? "#fff5f5" : "#fff", outline: "none", boxSizing: "border-box" }}
              />
              {errors.phone && <div style={{ fontSize: 11, color: "#e24b4a", marginTop: 2 }}>{errors.phone}</div>}
            </div>

            {/* Full Name */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 3 }}>Full Name <span style={{ color: "#e24b4a" }}>*</span></div>
              <input
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: "" })); }}
                style={{ width: "100%", padding: "7px 9px", border: `1px solid ${errors.name ? "#e24b4a" : "#ccc"}`, borderRadius: 3, fontSize: 13, color: "#333", background: errors.name ? "#fff5f5" : "#fff", outline: "none", boxSizing: "border-box" }}
              />
              {errors.name && <div style={{ fontSize: 11, color: "#e24b4a", marginTop: 2 }}>{errors.name}</div>}
            </div>

            {/* Delivery Address */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8, marginTop: 4 }}>
              <span style={{ width: 7, height: 7, background: "#1a3a8f", borderRadius: "50%", flexShrink: 0, display: "inline-block" }}></span>
              <span style={{ fontSize: 12, color: "#1a3a8f", fontWeight: 600 }}>Delivery Address <span style={{ color: "#e24b4a" }}>*</span></span>
            </div>

            <AddressMapPicker
              address={address}
              onChange={(newAddr) => {
                setAddress(newAddr);
                setErrors(er => ({ ...er, region: "", district: "", street: "" }));
              }}
              errors={{ region: errors.region, district: errors.district, street: errors.street }}
              inputStyle={{ width: "100%", padding: "7px 9px", border: "1px solid #ccc", borderRadius: 3, fontSize: 13, color: "#333", background: "#fff", outline: "none", boxSizing: "border-box", marginBottom: 6 }}
              labelStyle={{ fontSize: 11, color: "#555", marginBottom: 3, display: "block" }}
              locationBtnStyle={{ width: "100%", padding: 8, border: "1.5px solid #1a3a8f", background: "#fff", borderRadius: 3, color: "#1a3a8f", fontSize: 12, fontWeight: 500, cursor: "pointer", marginBottom: 4 }}
              mapHintStyle={{ fontSize: 11, color: "#999", textAlign: "center", marginBottom: 11 }}
            />

            {/* Note */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 12, color: "#1a3a8f", fontWeight: 500, marginBottom: 3 }}>Note (optional)</div>
              <textarea
                placeholder="Any special request or delivery instructions..."
                value={form.explanation}
                onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                rows={3}
                style={{ width: "100%", padding: "7px 9px", border: "1px solid #ccc", borderRadius: 3, fontSize: 13, color: "#333", background: "#fff", outline: "none", resize: "vertical", boxSizing: "border-box", minHeight: 44 }}
              />
            </div>

          </div>
        )}

        {/* ── FOOTER ── */}
        {!success && (
          <div style={{ padding: "10px 13px", borderTop: "1px solid #e0e0e0", display: "flex", gap: 8, flexShrink: 0, background: "#fff" }}>
            <button onClick={onClose} style={{ flex: 1, padding: 9, border: "1px solid #ccc", background: "#fff", borderRadius: 4, fontSize: 13, color: "#444", cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting} style={{ flex: 1.5, padding: 9, background: "#1a3a8f", color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 500, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Placing…" : "Place Order"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}



