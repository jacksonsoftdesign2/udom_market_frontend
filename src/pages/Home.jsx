import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import translations from "../translations";
import logo from "../assets/upmarket_logo.png";
import banner from "../assets/banner.jpg";
import Header from "../components/Header";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";

// ── Ad Banner Slides ────────────────────────────────────────────────
const AD_SLIDES = [
  {
    bg: "from-orange-500 to-red-500",
    tag: "🔥 FLASH SALE",
    title: "Up to 80% OFF",
    sub: "Free delivery on all orders today",
    emoji: "🛍️",
  },
  {
    bg: "from-blue-600 to-cyan-500",
    tag: "✨ NEW ARRIVALS",
    title: "Fresh Products Daily",
    sub: "Explore what traders just listed",
    emoji: "📦",
  },
  {
    bg: "from-emerald-500 to-teal-600",
    tag: "🏪 LOCAL TRADERS",
    title: "Support UDOM Market",
    sub: "Buy directly from campus traders",
    emoji: "🤝",
  },
];

function AdBanner({ banner: bannerImg }) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide(s => (s + 1) % AD_SLIDES.length), 4000);
    return () => clearInterval(id);
  }, []);

  const s = AD_SLIDES[slide];

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-xl h-[160px] md:h-[220px] mb-5 select-none">
      {/* bg image fallback */}
      <img src={bannerImg} alt="banner" className="absolute inset-0 w-full h-full object-cover object-center" />

      {/* colored overlay that transitions */}
      <div className={`absolute inset-0 bg-gradient-to-r ${s.bg} opacity-85 transition-all duration-700`} />

      {/* content */}
      <div className="relative z-10 h-full flex items-center px-6 gap-4">
        <div className="flex-1">
          <span className="text-xs font-bold bg-white/25 text-white px-3 py-1 rounded-full">{s.tag}</span>
          <h2 className="text-white font-extrabold text-2xl md:text-3xl mt-2 leading-tight">{s.title}</h2>
          <p className="text-white/80 text-sm mt-1">{s.sub}</p>
        </div>
        <div className="text-6xl md:text-7xl opacity-90 flex-shrink-0">{s.emoji}</div>
      </div>

      {/* dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {AD_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === slide ? "bg-white w-5" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Category pill ───────────────────────────────────────────────────
function CategoryBar({ categories, selected, onSelect }) {
  const ref = useRef(null);

  return (
    <div
      ref={ref}
      className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-none"
      style={{ scrollbarWidth: "none" }}
    >
      {[{ id: null, name: "All" }, ...categories].map((cat) => (
        <button
          key={cat.id ?? "all"}
          onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${
            selected === cat.id
              ? "bg-blue-500 text-white border-blue-500 shadow"
              : "bg-white/60 text-gray-700 border-gray-200 hover:bg-blue-50"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}

// ── Quick stats bar ─────────────────────────────────────────────────
function QuickLinks({ onSelect }) {
  const items = [
    { icon: "❤️", label: "Wish List", cat: null },
    { icon: "🆕", label: "New Arrival", cat: null },
    { icon: "💸", label: "Bargain", cat: null },
    { icon: "📦", label: "Wholesale", cat: null },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 mb-5">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => onSelect?.(item.cat)}
          className="flex flex-col items-center gap-1 bg-white/50 backdrop-blur rounded-xl py-3 border border-white/60 hover:bg-blue-50 transition"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl shadow-sm">
            {item.icon}
          </div>
          <span className="text-xs text-gray-700 font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Main Home ───────────────────────────────────────────────────────
function Home() {
  const navigate = useNavigate();
  const [lang] = useState("sw");
  const t = translations[lang] || translations["sw"];

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartToast, setCartToast] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  // ── fetch categories ──
  useEffect(() => {
    fetch(`${API}/api/users/categories`)
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // ── fetch products ──
  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (selectedCategory) params.append("category_id", selectedCategory);

    fetch(`${API}/api/products/public?${params}`)
      .then(r => r.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : data.products || []);
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, [search, selectedCategory]);

  // ── search submit ──
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  // ── add to cart ──
  const handleAddToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(c => c.id === item.id);
      if (exists) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    setCartToast(true);
    setTimeout(() => setCartToast(false), 2000);
  };

  // filtered products (client-side name/trader filter on top of API results)
  const displayed = products.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.trader_name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative min-h-screen text-gray-800 overflow-x-hidden">

      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-white via-blue-50 to-white" />
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] bg-white/60 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-blue-200/40 rounded-full blur-[120px]" />
      </div>
      <div className="fixed inset-0 -z-10 backdrop-blur-[6px]" />
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src={logo} alt="" className="w-[60vw] max-w-[600px] opacity-[0.07] object-contain" />
      </div>

      {/* ── HEADER ── */}
      <Header cartCount={cart.reduce((s, c) => s + c.qty, 0)} />

      {/* ── CART TOAST ── */}
      {cartToast && (
        <div className="fixed top-20 right-4 z-50 bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg animate-bounce">
          🛒 Added to cart!
        </div>
      )}

      {/* ── CONTENT ── */}
      <div className="pt-24 pb-10 px-3 md:px-6 lg:px-12 max-w-7xl mx-auto relative z-10">

        {/* ── SEARCH BAR ── */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-5">
          <div className="flex-1 flex items-center bg-white/80 backdrop-blur border border-gray-200 rounded-2xl px-4 shadow-sm">
            <span className="text-gray-400 mr-2">🔍</span>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search products, traders, categories..."
              className="flex-1 bg-transparent py-3 text-sm outline-none text-gray-700 placeholder-gray-400"
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(""); setSearch(""); }}
                className="text-gray-400 hover:text-gray-600 ml-1 text-lg leading-none">×</button>
            )}
          </div>
          <button type="submit"
            className="bg-blue-500 text-white px-5 rounded-2xl font-semibold text-sm hover:bg-blue-600 transition shadow-sm flex-shrink-0">
            Search
          </button>
        </form>

        {/* ── AD BANNER ── */}
        <AdBanner banner={banner} />

        {/* ── QUICK LINKS ── */}
        <QuickLinks />

        {/* ── CATEGORY BAR ── */}
        <CategoryBar
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* ── SECTION TITLE ── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-lg text-gray-800">
            {selectedCategory
              ? categories.find(c => c.id === selectedCategory)?.name
              : search ? `Results for "${search}"` : "🛍️ All Products"}
          </h2>
          {!loading && (
            <span className="text-xs text-gray-400 bg-white/60 px-3 py-1 rounded-full border border-gray-200">
              {displayed.length} item{displayed.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── PRODUCTS ── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/40 animate-pulse h-64" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-400">
            <p className="text-3xl mb-2">⚠️</p>
            <p className="font-semibold">{error}</p>
            <button onClick={() => setSearch("")}
              className="mt-3 text-sm text-blue-500 underline">Try again</button>
          </div>
        ) : (
          <ProductGrid items={displayed} t={t} onAddToCart={handleAddToCart} />
        )}

      </div>

      {/* ── FOOTER ── */}
      <Footer />
    </div>
  );
}

export default Home;
