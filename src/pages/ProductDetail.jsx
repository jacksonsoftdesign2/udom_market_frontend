import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";


const API = import.meta.env.VITE_API_URL;

// ── Thumbnail Strip ─────────────────────────────────────────────────
function ThumbStrip({ images, active, onSelect }) {
  if (!images || images.length <= 1) return null;
  return (
    <div className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      {images.map((src, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
            i === active
              ? "border-blue-500 shadow-md scale-105"
              : "border-transparent opacity-60 hover:opacity-90"
          }`}
        >
          <img src={src} alt="" className="w-full h-full object-cover" />
        </button>
      ))}
    </div>
  );
}

// ── Related Product Mini-Card ───────────────────────────────────────
function RelatedCard({ item, onClick }) {
  return (
    <div
      onClick={() => onClick(item.id)}
      className="cursor-pointer group rounded-2xl overflow-hidden bg-white/60 backdrop-blur border border-white/60 shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      <div className="relative h-36 overflow-hidden">
        <img
          src={item.images?.[0] || item.imageUrl || "/placeholder.png"}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
          onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.png"; }}
        />
        <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 bg-blue-500 text-white rounded-full font-semibold">
          {item.category || "General"}
        </span>
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug">{item.name}</p>
        <p className="text-xs font-bold text-blue-700 mt-auto">
          Tsh {item.price ? Number(item.price).toLocaleString() : "—"}
        </p>
        {item.trader_name && (
          <p className="text-[10px] text-gray-400 truncate">{item.trader_name}</p>
        )}
      </div>
    </div>
  );
}

//order model

function OrderModal({ product, onClose }) {
  const [form, setForm] = useState({ name: "", phone: "", region: "", district: "", street: "", explanation: "", quantity: 1 });
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

  const inp = (field) => `w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-400 transition ${errors[field] ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-800 text-base">Place Order</h3>
            <p className="text-xs text-gray-400 truncate max-w-[240px]">{product.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">✕</button>
        </div>

        {success ? (
          <div className="flex flex-col items-center py-10 px-6 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">✓</div>
            <h4 className="font-bold text-gray-800 text-lg">Order Placed!</h4>
            <p className="text-sm text-gray-500">The trader will contact you on <b>{form.phone}</b></p>
            <button onClick={onClose} className="mt-2 px-8 py-2.5 bg-blue-500 text-white rounded-xl font-semibold text-sm">Done</button>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
              <div>
  <p className="text-xs text-gray-400">Unit price</p>
  <p className="text-xs text-gray-500 font-semibold">Tsh {Number(product.price).toLocaleString()}</p>
  <p className="text-xs text-gray-400 mt-1">Total</p>
  <p className="text-lg font-black text-blue-700">Tsh {(Number(product.price) * form.quantity).toLocaleString()}</p>
</div>
              <div className="flex flex-col items-center gap-1">
  <p className="text-xs text-gray-400">Quantity (Items)</p>
  <div className="flex items-center gap-2">
    <button onClick={() => setForm(f => ({ ...f, quantity: Math.max(1, f.quantity - 1) }))}
      className="w-8 h-8 rounded-full bg-white border border-gray-200 font-bold text-gray-600">−</button>
    <span className="w-6 text-center font-bold">{form.quantity}</span>
    <button onClick={() => setForm(f => ({ ...f, quantity: Math.min(product.stock, f.quantity + 1) }))}
      className="w-8 h-8 rounded-full bg-white border border-gray-200 font-bold text-gray-600">+</button>
  </div>
</div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Full Name *</label>
              <input type="text" placeholder="Your full name" value={form.name}
                onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: "" })); }}
                className={inp("name")} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone Number *</label>
              <input type="tel" placeholder="e.g. 0712 345 678" value={form.phone}
                onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setErrors(er => ({ ...er, phone: "" })); }}
                className={inp("phone")} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
  <label className="text-xs font-semibold text-gray-500 mb-1 block">Region</label>
  <input type="text" placeholder="e.g. Dodoma" value={form.region}
    onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
    className={inp("region")} />
</div>

<div>
  <label className="text-xs font-semibold text-gray-500 mb-1 block">District</label>
  <input type="text" placeholder="e.g. Bahi" value={form.district}
    onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
    className={inp("district")} />
</div>

<div>
  <label className="text-xs font-semibold text-gray-500 mb-1 block">Street</label>
  <input type="text" placeholder="e.g. Msalato Street" value={form.street}
    onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
    className={inp("street")} />
</div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Explanation (optional)</label>
              <textarea placeholder="Any special request..." value={form.explanation}
                onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                className={inp("explanation")} rows={2} />
            </div>

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

//contact model

function ContactModal({ product, onClose }) {
  const phone = product.trader_phone || "";
  const email = product.trader_email || "";
  const whatsapp = phone.replace(/\D/g, "").replace(/^0/, "255");
  const mapsUrl = product.trader_lat && product.trader_lng
    ? `https://maps.google.com/?q=${product.trader_lat},${product.trader_lng}`
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-base">Contact Trader</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">✕</button>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
            {product.trader_image ? (
              <img src={product.trader_image} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-blue-100" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-black text-blue-600">
                {product.trader_name?.charAt(0).toUpperCase() || "T"}
              </div>
            )}
            <div>
              <p className="font-bold text-gray-800">{product.trader_name || "Trader"}</p>
              {email && <p className="text-xs text-gray-400">{email}</p>}
              {phone && <p className="text-xs text-gray-400">{phone}</p>}
            </div>
          </div>

          {phone && (
            <a href={`tel:${phone}`}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition">
              <span className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-lg">📞</span>
              Call {phone}
            </a>
          )}

          {whatsapp && (
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-green-50 text-green-700 font-semibold text-sm hover:bg-green-100 transition">
              <span className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-lg">💬</span>
              WhatsApp
            </a>
          )}

          {email && (
            <a href={`mailto:${email}`}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-purple-50 text-purple-700 font-semibold text-sm hover:bg-purple-100 transition">
              <span className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-lg">✉️</span>
              Email Trader
            </a>
          )}

          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-orange-50 text-orange-700 font-semibold text-sm hover:bg-orange-100 transition">
              <span className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-lg">📍</span>
              View on Map
            </a>
          )}

          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


// ── Main ProductDetail ──────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [imgZoomed, setImgZoomed] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const touchStartX = useRef(null);
  const [searchParams] = useSearchParams();

useEffect(() => {
  if (searchParams.get("order") === "1" && product) {
    setShowOrder(true);
  }
}, [product, searchParams]);

  // ── fetch product ──
  useEffect(() => {
    setLoading(true);
    setError("");
    setActiveImg(0);

    fetch(`${API}/products/public/${id}`)
      .then(r => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(data => {
        const p = data.product || data;
        setProduct({
          ...p,
          images: p.images || [],
          specs: p.specs
            ? typeof p.specs === "string" ? JSON.parse(p.specs) : p.specs
            : [],
        });
      })
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  // ── fetch related products (same category OR same trader) ──
  useEffect(() => {
    if (!product) return;

    const params = new URLSearchParams();
    if (product.category_id) params.append("category_id", product.category_id);

    fetch(`${API}/products/public?${params}`)
      .then(r => r.json())
      .then(data => {
        const all = Array.isArray(data) ? data : data.products || [];
        const filtered = all.filter(p => {
          if (p.id === product.id) return false;
          const sameCategory = p.category_id === product.category_id;
          const sameTrader = p.trader_id === product.trader_id;
          return sameCategory || sameTrader;
        });
        setRelated(filtered.slice(0, 8));
      })
      .catch(() => setRelated([]));
  }, [product]);

  // ── swipe gestures for mobile image gallery ──
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || !product?.images?.length) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setActiveImg(i => (i + 1) % product.images.length);
      else setActiveImg(i => (i - 1 + product.images.length) % product.images.length);
    }
    touchStartX.current = null;
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
    // You can wire this up to your global cart state / context
  };

  // ── loading ──
  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
        <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full" />
        <p className="font-semibold text-gray-500">Loading product…</p>
      </div>
      <Footer />
    </div>
  );

  // ── error ──
  if (error || !product) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400 px-6 text-center">
        <p className="text-5xl">😕</p>
        <p className="font-bold text-lg text-gray-600">{error || "Product not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition"
        >
          ← Go Back
        </button>
      </div>
      <Footer />
    </div>
  );

  const images = product.images?.length ? product.images : ["/placeholder.png"];
  const isAvailable = product.status === "Available";

  return (
    <div className="relative min-h-screen text-gray-800 overflow-x-hidden">

      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-white via-blue-50 to-white" />
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] bg-white/60 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-blue-200/40 rounded-full blur-[120px]" />
      </div>

      <Header />

      {showOrder && <OrderModal product={product} onClose={() => setShowOrder(false)} />}
      {showContact && <ContactModal product={product} onClose={() => setShowContact(false)} />}

  

      {/* ── ZOOM MODAL ── */}
      {imgZoomed && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setImgZoomed(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl font-light w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
            onClick={() => setImgZoomed(false)}
          >×</button>
          <img
            src={images[activeImg]}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
          {images.length > 1 && (
            <div className="absolute bottom-6 flex gap-3">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setActiveImg(i); }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeImg ? "bg-white scale-125" : "bg-white/40"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="pt-24 pb-12 px-3 md:px-6 lg:px-12 max-w-5xl mx-auto relative z-10">

        {/* ── BACK BUTTON ── */}
        <button
          onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 font-semibold transition group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
        </button>

        {/* ── MAIN CARD ── */}
        <div className="bg-white/60 backdrop-blur-lg border border-white/60 rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">

            {/* ── IMAGE PANEL ── */}
            <div className="md:w-[46%] p-4 flex flex-col">
              {/* Main image */}
              <div
                className="relative rounded-2xl overflow-hidden bg-gray-100 cursor-zoom-in shadow-md"
                style={{ paddingBottom: "75%" }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => setImgZoomed(true)}
              >
                <img
                  key={activeImg}
                  src={images[activeImg]}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                  onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.png"; }}
                />

                {/* prev / next arrows — only when multiple images */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + images.length) % images.length); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition text-sm"
                    >‹</button>
                    <button
                      onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % images.length); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition text-sm"
                    >›</button>
                  </>
                )}

                {/* image counter */}
                {images.length > 1 && (
                  <span className="absolute bottom-2 right-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded-full font-medium">
                    {activeImg + 1} / {images.length}
                  </span>
                )}

                {/* zoom hint */}
                <span className="absolute top-2 right-2 text-[10px] bg-black/40 text-white px-2 py-0.5 rounded-full">
                  🔍 Tap to zoom
                </span>
              </div>

              {/* Thumbnail strip */}
              <ThumbStrip images={images} active={activeImg} onSelect={setActiveImg} />
            </div>

            {/* ── INFO PANEL ── */}
            <div className="md:w-[54%] p-5 md:p-7 flex flex-col gap-4">

              {/* Category + Status badges */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                  {product.category || "General"}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {isAvailable ? "✓ Available" : "Unavailable"}
                </span>
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-semibold">
                    ⚡ Only {product.stock} left!
                  </span>
                )}
              </div>

              {/* Product name */}
              <h2 className="text-2xl font-semibold text-gray-900 leading-tight">{product.name}</h2>

              {/* Price */}
              <div className="flex items-end gap-2">
                <p className="text-xl font-bold text-blue-700">
                  Tsh {Number(product.price || 0).toLocaleString()}
                </p>
                <span className="text-sm text-gray-400 mb-1">/ Product</span>
              </div>

              {/* Trader info */}
              {product.trader_name && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                    {product.trader_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Sold by</p>
                    <p className="text-sm font-bold text-gray-700">{product.trader_name}</p>
                  </div>
                  {product.location && (
                    <p className="ml-auto text-xs text-gray-400">📍 {product.location}</p>
                  )}
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Description</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Stock */}
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">In Stock</p>
                <span className={`text-sm font-semibold ${product.stock <= 5 ? "text-yellow-600" : "text-green-600"}`}>
                  {product.stock || 0} Products
                </span>
              </div>

              {/* Specs */}
              {Array.isArray(product.specs) && product.specs.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Specifications</p>
                  <div className="rounded-xl overflow-hidden border border-gray-100">
                    {product.specs.map((spec, i) => (
                      <div key={spec.id || i} className={`grid grid-cols-3 px-3 py-2 text-xs ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                        <span className="font-semibold text-gray-500">{spec.attribute}</span>
                        <span className="text-gray-800 font-bold">{spec.value}</span>
                        <span className="text-gray-400">{spec.unit || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA buttons */}
              <div className="flex gap-3 mt-auto pt-2">
               <button
  onClick={() => setShowOrder(true)}
  disabled={!isAvailable}
  className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95 ${
    isAvailable ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
  }`}
>
  🛒 Add to Cart
</button>
<button
  onClick={() => setShowContact(true)}
  className="px-4 py-3 rounded-2xl font-bold text-sm border-2 border-blue-400 text-blue-600 hover:bg-blue-50 transition"
>
  💬 Contact
</button>
              </div>
            </div>
          </div>
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-gray-800">
                🔗 Related Products
              </h2>
              <span className="text-xs text-gray-400 bg-white/60 border border-gray-200 px-3 py-1 rounded-full">
                {related.length} item{related.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {related.map((item, i) => (
                <RelatedCard
                  key={item.id || i}
                  item={item}
                  onClick={(productId) => navigate(`/product/${productId}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
