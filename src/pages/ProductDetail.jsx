import OrderModal from "../components/OrderModal";
import ContactModal from "../components/ContactModal";
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

      {showOrder && <OrderModal product={product} onClose={() => setShowOrder(false)} onContact={() => { setShowOrder(false); setShowContact(true); }} />}
      {showContact && <ContactModal product={product} onClose={() => setShowContact(false)} />}

  

{/* ── ZOOM MODAL ── */}
{imgZoomed && (
  <div
    className="fixed inset-0 z-[100] flex flex-col"
    style={{ background: "rgba(15,23,42,0.97)" }}
    onClick={() => setImgZoomed(false)}
  >
    {/* Top bar */}
    <div
      className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0"
      onClick={e => e.stopPropagation()}
    >
      <span className="text-white/60 text-xs font-medium tracking-widest uppercase">
        {activeImg + 1} / {images.length}
      </span>
      <button
        onClick={() => setImgZoomed(false)}
        className="flex items-center gap-2 text-white hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg bg-red-500 hover:bg-white/20 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Close
      </button>
    </div>

   {/* Image area */}
<div
  className="flex-1 flex items-center justify-center p-4 relative overflow-hidden"
  onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
  onTouchEnd={e => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      e.stopPropagation();
      if (diff > 0) setActiveImg(i => (i + 1) % images.length);
      else setActiveImg(i => (i - 1 + images.length) % images.length);
    }
    touchStartX.current = null;
  }}
>
      <img
        key={activeImg}
        src={images[activeImg]}
        alt=""
        className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
        onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.png"; }}
      />

      {/* Navigation arrows — both mobile and desktop */}
      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + images.length) % images.length); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % images.length); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </>
      )}
    </div>

    {/* Bottom thumbnail strip */}
    {images.length > 1 && (
      <div
        className="flex-shrink-0 border-t border-white/10 px-4 py-3"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex gap-2 overflow-x-auto justify-center" style={{ scrollbarWidth: "none" }}>
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                i === activeImg ? "border-blue-400 scale-105" : "border-white/20 opacity-50 hover:opacity-80"
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    )}

    {/* Hint */}
    <p
      className="text-center text-white/30 text-[10px] pb-2 flex-shrink-0"
      onClick={e => e.stopPropagation()}
    >
      Click anywhere outside image to close
    </p>
  </div>
)}
      <div className="pt-24 pb-12 px-3 md:px-6 lg:px-12 max-w-5xl mx-auto relative z-10">

        {/* ── BACK BUTTON ── */}
  <div className="mb-5 flex items-center gap-2">
  <button
    onClick={() => navigate(-1)}
    className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-white/70 backdrop-blur border border-gray-200 text-blue-600 hover:border-blue-300 hover:bg-white shadow-sm transition group"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
    Back
  </button>

  <button
    onClick={() => navigate("/")}
    className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-white/70 backdrop-blur border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-white shadow-sm transition group"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
    Home
  </button>
</div>
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
  <div className="bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100 space-y-2">
    <div className="flex items-center gap-2">
      {product.trader_image ? (
        <img src={product.trader_image} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-blue-100" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
          {product.trader_name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium">Sold by</p>
        <p className="text-sm font-bold text-gray-700 truncate">{product.trader_name}</p>
      </div>
    </div>

    {/* Trader contact details */}
    <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-gray-100">
      {product.trader_phone && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
          <span className="truncate">{product.trader_phone}</span>
        </div>
      )}
      {product.trader_email && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <span className="truncate">{product.trader_email}</span>
        </div>
      )}
      {product.trader_lat && product.trader_lng && (
        
         <a href={`https://maps.google.com/?q=${product.trader_lat},${product.trader_lng}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 col-span-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          View trader location on map
        </a>
      )}
    </div>
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
  className="px-4 py-3 rounded-2xl font-bold text-sm border-2 bg-green-500 text-white hover:bg-white hover:text-green-500 tansition"
>
 <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
</svg>
Contact
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
