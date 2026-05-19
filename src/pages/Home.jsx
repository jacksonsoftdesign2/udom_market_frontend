import { useState, useEffect, useRef } from "react";
import OrderModal from "../components/OrderModal";
import BuyOptionsModal from "../components/BuyOptionsModal";
import ContactModal from "../components/ContactModal";
import { useNavigate } from "react-router-dom";
import translations from "../translations";
import logo from "../assets/upmarket_logo.png";
import Header from "../components/Header";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";
import QuickLinks from "../components/QuickLinks";
import AdBanner from "../components/AdBanner";
import { FiStar, FiZap, FiClock, FiTruck, FiPhone, FiMail, FiTrendingUp,
       FiUsers, FiMapPin, FiTag, FiShoppingBag, FiSearch } from "react-icons/fi";



// ── Category Bar ────────────────────────────────────────────────────
function CategoryBar({ categories, selected, onSelect }) {
  return (
    <div className="flex gap-2 pb-1 mb-5 overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      {[{ id: null, name: "All" }, ...categories].map((cat) => (
        <button key={cat.id ?? "all"} onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 md:flex-1 md:min-w-[60px] px-4 py-1.5 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${
            selected === cat.id
              ? "bg-blue-500 text-white border-blue-500 shadow"
              : "bg-white/60 text-gray-700 border-gray-200 hover:bg-blue-50"
          }`}>
          {cat.name}
        </button>
      ))}
    </div>
  );
}

// ── Quick link labels ───────────────────────────────────────────────
const QUICK_LABELS = {
  new_arrival: <><FiStar className="inline mb-0.5 mr-1 text-violet-500"/> New Arrivals</>,
  popular:     <><FiTrendingUp className="inline mb-0.5 mr-1 text-orange-500"/> Popular</>,
  nearby:      <><FiMapPin className="inline mb-0.5 mr-1 text-blue-500"/> Nearby</>,
  deals:       <><FiTag className="inline mb-0.5 mr-1 text-amber-500"/> Deals</>,
};
// ── Instant search algorithm ────────────────────────────────────────
function buildInstantResults(query, products, categories) {
  const q = query.toLowerCase().trim();
  if (!q) return { products: [], matchedCategories: [], matchedTraders: [] };

  const nameStarts = [];
  const nameContains = [];
  const otherMatch = [];

  products.forEach(p => {
    const name = (p.name || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    if (name.startsWith(q)) {
      nameStarts.push(p);
    } else if (name.includes(q)) {
      nameContains.push(p);
    } else if (desc.includes(q)) {
      otherMatch.push(p);
    }
  });

  const matchedProducts = [...nameStarts, ...nameContains, ...otherMatch];

  const matchedCategories = categories.filter(c =>
    (c.name || "").toLowerCase().includes(q)
  );

  const traderMap = new Map();
  products.forEach(p => {
    if (p.trader_name && p.trader_name.toLowerCase().includes(q)) {
      if (!traderMap.has(p.trader_id)) {
        traderMap.set(p.trader_id, { id: p.trader_id, name: p.trader_name });
      }
    }
  });
  const matchedTraders = [...traderMap.values()];

  return { products: matchedProducts, matchedCategories, matchedTraders };
}

// ── Instant Search Results Panel ────────────────────────────────────
function InstantResults({ results, onSelectCategory, onSelectTrader, onClose }) {
  const { products, matchedCategories, matchedTraders } = results;
  const hasAny = products.length > 0 || matchedCategories.length > 0 || matchedTraders.length > 0;

  if (!hasAny) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-gray-100 z-50 px-4 py-5 text-center text-gray-400 text-sm">
        No results found
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-gray-100 z-50 max-h-[60vh] overflow-y-auto">

      {products.length > 0 && (
        <div className="px-3 pt-3 pb-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Products</p>
          <div className="space-y-1">
            {products.slice(0, 6).map(p => (
              <button
                key={p.id}
                onClick={() => onClose(p)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-blue-50 transition text-left"
              >
                {p.images?.[0] ? (
                  <img
                    src={
                      typeof p.images[0] === 'object'
                        ? p.images[0].thumb_webp || p.images[0].image_url
                        : p.images[0]
                    }
                    alt={p.name}
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 text-base">📦</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{p.category} · Tsh {Number(p.price).toLocaleString()}</p>
                </div>
              </button>
            ))}
            {products.length > 6 && (
              <p className="text-[10px] text-blue-400 px-2 pb-1">+{products.length - 6} more — press Search</p>
            )}
          </div>
        </div>
      )}

      {matchedCategories.length > 0 && (
        <div className="px-3 pt-2 pb-1 border-t border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Categories</p>
          <div className="flex flex-wrap gap-1.5 px-1 pb-1">
            {matchedCategories.map(c => (
              <button
                key={c.id}
                onClick={() => onSelectCategory(c)}
                className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-semibold hover:bg-green-100 transition"
              >
                🏷️ {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {matchedTraders.length > 0 && (
        <div className="px-3 pt-2 pb-3 border-t border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Traders</p>
          <div className="flex flex-wrap gap-1.5 px-1">
            {matchedTraders.map(tr => (
              <button
                key={tr.id}
                onClick={() => onSelectTrader(tr)}
                className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-semibold hover:bg-purple-100 transition"
              >
                <FiShoppingBag size={11} className="inline mb-0.5 mr-1" /> {tr.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Search With Instant Panel ───────────────────────────────────────
// IMPORTANT: defined at module level (outside Home) so it never remounts on re-render
function SearchWithInstant({
  searchInput,
  onInputChange,
  onSearch,
  onSelectCategory,
  onSelectTrader,
  onSelectProduct,
  showInstant,
  setShowInstant,
  instantResults,
  hasInstantResults,
  instantRef,
  compact = false,
}) {
  return (
    <div className="relative w-full" ref={!compact ? instantRef : undefined}>
      <form onSubmit={onSearch} className="flex gap-1.5 w-full">
        <div
         className={`flex-1 flex items-center bg-white/80 backdrop-blur border border-gray-200 shadow-sm
            ${compact ? "rounded-md px-2" : "rounded-lg px-3"}
            ${showInstant && !compact ? "border-blue-300 ring-2 ring-blue-100" : ""}`}
        >
          <FiSearch className="text-gray-400 mr-1.5 flex-shrink-0" size={15} />
          <input
            type="search"
            value={searchInput}
            onChange={e => onInputChange(e.target.value)}
            onFocus={() => searchInput.trim() && setShowInstant(true)}
            placeholder="Search products, traders..."
            className={`flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 min-w-0
              ${compact ? "py-1.5 text-xs" : "py-2.5 text-xs sm:text-sm"}`}
            autoComplete="off"
            enterKeyHint="search"
          />

        </div>
        <button
          type="submit"
          className={`bg-blue-500 text-white font-semibold hover:bg-blue-600 transition flex-shrink-0 whitespace-nowrap
            ${compact ? "px-3 py-1.5 rounded-md text-xs" : "px-3 py-2.5 rounded-lg text-xs sm:text-sm sm:px-5 shadow-sm"}`}
        >
          Search
        </button>
      </form>

      {/* Instant results dropdown — only on main (non-compact) search */}
      {!compact && showInstant && hasInstantResults && (
        <InstantResults
          results={instantResults}
          onSelectCategory={onSelectCategory}
          onSelectTrader={onSelectTrader}
          onClose={onSelectProduct}
        />
      )}
    </div>
  );
}

// ── Main Home ───────────────────────────────────────────────────────
function Home() {
  const navigate = useNavigate();
  const [lang] = useState("sw");
  const t = translations[lang] || translations["sw"];
  const [orderItem, setOrderItem] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartToast, setCartToast] = useState(false);
  const [searchSticky, setSearchSticky] = useState(false);
  const [buyItem, setBuyItem] = useState(null);
  const [contactItem, setContactItem] = useState(null);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const searchRef = useRef(null);

  // ── instant search ──
  const [showInstant, setShowInstant] = useState(false);
  const instantRef = useRef(null);

  // ── QuickLinks state ──
  const [quickFilter, setQuickFilter] = useState(null);
  const [nearbyProducts, setNearbyProducts] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState("");

  const API = import.meta.env.VITE_API_URL;

  // ── close instant panel on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (instantRef.current && !instantRef.current.contains(e.target)) {
        setShowInstant(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  // ── sticky observer ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setSearchSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-72px 0px 0px 0px" }
    );
    if (searchRef.current) observer.observe(searchRef.current);
    return () => observer.disconnect();
  }, []);

  // ── keep backend alive ──
  useEffect(() => {
    const ping = () => fetch(`${API}/users/categories`).catch(() => {});
    const id = setInterval(ping, 14 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // ── fetch categories ──
  useEffect(() => {
    fetch(`${API}/users/categories`)
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // ── fetch products with auto-refresh ──
  useEffect(() => {
    if (quickFilter === "nearby") return;

    const fetchProducts = () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory) params.append("category_id", selectedCategory);

fetch(`${API}/products/public?${params}`)
  .then(r => r.json())
  .then(data => {
    const prods = Array.isArray(data) ? data : data.products || [];
    console.log('IMAGE SAMPLE:', JSON.stringify(prods[0]?.images));
    setProducts(prods);
  })
        .catch(() => setError("Failed to load products"))
        .finally(() => setLoading(false));
    };

    setLoading(true);
    setError("");
    fetchProducts();

    const interval = setInterval(fetchProducts, 30000);
    return () => clearInterval(interval);
  }, [search, selectedCategory, quickFilter]);

  // ── instant results (derived) ──
  const instantResults = buildInstantResults(searchInput, products, categories);
  const hasInstantResults = searchInput.trim().length > 0;

  // ── handle typing ──
  const handleInputChange = (val) => {
    setSearchInput(val);
    if (!val.trim()) setSearch("");
    setShowInstant(val.trim().length > 0);
  };

  // ── commit search (Enter / Search button) ──
  const handleSearch = (e) => {
    e.preventDefault();
    setShowInstant(false);
    setSearch(searchInput.trim());
  };

  // ── user taps a product in instant panel ──
  const handleInstantProduct = (product) => {
    setShowInstant(false);
    setSearch(product.name);
    setSearchInput(product.name);
  };

  // ── user taps a category chip in instant panel ──
  const handleInstantCategory = (cat) => {
    setShowInstant(false);
    setSearchInput("");
    setSearch("");
    setSelectedCategory(cat.id);
    setQuickFilter(null);
  };

  // ── user taps a trader chip in instant panel ──
  const handleInstantTrader = (trader) => {
    setShowInstant(false);
    setSearchInput(trader.name);
    setSearch(trader.name);
  };

  // ── QuickLinks ──
const handleQuickSelect = (key) => {
    if (key === null) {
      setQuickFilter(null);
      setNearbyProducts([]);
      setNearbyError("");
      setPage(1);
      return;
    }
    setQuickFilter(key);
    setPage(1);
if (key === "nearby") {
  setNearbyLoading(true);
  setNearbyError("");
  setNearbyProducts([]);

  if (!navigator.geolocation) {
    setNearbyError("Your browser doesn't support location.");
    setNearbyLoading(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;

        // ✅ Call products/nearby directly — returns products with distance
        const res = await fetch(
          `${API}/products/nearby?lat=${latitude}&lng=${longitude}&radius=50`
        );
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          setNearbyError("No products found within 5km of your location.");
          setNearbyProducts([]);
        } else {
          setNearbyProducts(data);
        }
      } catch {
        setNearbyError("Failed to fetch nearby products.");
      } finally {
        setNearbyLoading(false);
      }
    },
    (err) => {
      setNearbyLoading(false);
      if (err.code === 1) {
        setNearbyError("Location access denied. Please allow location in your browser.");
      } else {
        setNearbyError("Could not get your location. Please try again.");
      }
    },
    { timeout: 10000, maximumAge: 60000 }
  );
}
  };

  // ── derive displayed products ──
  const getDisplayed = () => {
    if (quickFilter === "nearby") return nearbyProducts;

    let base = products.filter(p => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.trader_name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    });

    if (quickFilter === "new_arrival") return [...base].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (quickFilter === "popular") return [...base].sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));
    if (quickFilter === "deals") return [...base].sort((a, b) => Number(a.price) - Number(b.price));
    return base;
  };

  const displayed = getDisplayed();

  const handleAddToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(c => c.id === item.id);
      if (exists) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
    setCartToast(true);
    setTimeout(() => setCartToast(false), 2000);
  };

  const sectionTitle = () => {
    if (quickFilter && QUICK_LABELS[quickFilter]) return QUICK_LABELS[quickFilter];
    if (selectedCategory) return categories.find(c => c.id === selectedCategory)?.name;
    if (search) return `Results for "${search}"`;
   return <><FiShoppingBag className="inline mb-0.5 mr-1"/> All Products</>;
  };

  // ── shared props for SearchWithInstant ──
  const searchProps = {
    searchInput,
    onInputChange: handleInputChange,
    onSearch: handleSearch,
    onSelectCategory: handleInstantCategory,
    onSelectTrader: handleInstantTrader,
    onSelectProduct: handleInstantProduct,
    showInstant,
    setShowInstant,
    instantResults,
    hasInstantResults,
    instantRef,
  };

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
      <Header
        cartCount={cart.reduce((s, c) => s + c.qty, 0)}
        stickySearch={searchSticky ? <SearchWithInstant {...searchProps} compact /> : null}
      />

      {/* ── STICKY SEARCH — mobile only ── */}
      {searchSticky && (
        <div
          className="fixed left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-200 px-3 py-2 md:hidden"
          style={{ top: "56px" }}
        >
          <SearchWithInstant {...searchProps} compact />
        </div>
      )}

      {/* ── CART TOAST ── */}
      {cartToast && (
        <div className="fixed top-20 right-4 z-50 bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg">
          🛒 Added to cart!
        </div>
      )}

      {/* ── CONTENT ── */}
      <div className="pt-24 pb-10 px-3 md:px-6 lg:px-12 max-w-7xl mx-auto relative z-10">

        {/* INLINE SEARCH with instant panel */}
        <div ref={searchRef} className="mb-5">
          <SearchWithInstant {...searchProps} />
        </div>

        {/* ── AD BANNER ── */}
<AdBanner
  onCtaClick={(slideIndex) => {
    if (slideIndex === 0) {
      navigate('/register-trader');
    } else if (slideIndex === 1) {
      setShowContactOptions(true);
    } else if (slideIndex === 2) {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } else if (slideIndex === 3) {
      setShowContactOptions(true);
    }
  }}
/>

        {/* ── QUICK LINKS ── */}
        <QuickLinks
          activeKey={quickFilter}
          onSelect={handleQuickSelect}
          nearbyLoading={nearbyLoading}
        />

        {/* ── CATEGORY BAR ── */}
        <CategoryBar
          categories={categories}
          selected={selectedCategory}
          onSelect={(id) => {
            setSelectedCategory(id);
            setQuickFilter(null);
            setNearbyProducts([]);
          }}
        />

        {/* ── SECTION TITLE ── */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-lg text-gray-800">{sectionTitle()}</h2>
          {!loading && !nearbyLoading && (
            <span className="text-xs text-gray-400 bg-white/60 px-3 py-1 rounded-full border border-gray-200">
              {displayed.length} item{displayed.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── Nearby / coming soon banner ── */}
        {nearbyError && (
          <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-xl">
            <span className="text-xl">🗺️</span>
            <p className="flex-1">{nearbyError}</p>
            <button
              onClick={() => { setQuickFilter(null); setNearbyError(""); }}
              className="ml-auto flex-shrink-0 text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-lg transition"
            >
              Got it
            </button>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {(loading && quickFilter !== "nearby") || nearbyLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="animate-spin w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full mb-4" />
            <p className="font-semibold text-gray-600">
              {nearbyLoading ? "Finding nearby products..." : "Loading products..."}
            </p>
            <p className="text-xs mt-1 text-gray-400">
              {nearbyLoading ? "Getting your location" : "This may take a moment on first load"}
            </p>
          </div>
) : error ? (
  <div className="text-center py-16">
    <div className="flex flex-col items-center mb-2">
      <svg width="200" height="200" viewBox="0 0 680 340" style={{ overflow: 'visible' }}>
        <style>{`
          @keyframes ping1{0%{r:88;opacity:.3}100%{r:118;opacity:0}}
          @keyframes ping2{0%{r:88;opacity:.18}100%{r:106;opacity:0}}
          @keyframes bounce{0%,100%{transform:translateY(0px)}50%{transform:translateY(-6px)}}
          @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
          .r1{animation:ping1 2.4s ease-out infinite}
          .r2{animation:ping2 2.4s ease-out .6s infinite}
          .cart-grp{animation:bounce 2.2s ease-in-out infinite}
          .wl{transform-origin:292px 246px;animation:spin 1.1s linear infinite}
          .wr{transform-origin:388px 246px;animation:spin 1.1s linear infinite}
        `}</style>
        <circle className="r1" cx="340" cy="168" r="88" fill="none" stroke="#fb923c" strokeWidth="1.5"/>
        <circle className="r2" cx="340" cy="168" r="88" fill="none" stroke="#fdba74" strokeWidth="1"/>
        <circle cx="340" cy="168" r="88" fill="#fff7ed" stroke="#fed7aa" strokeWidth="2.5"/>
        <g className="cart-grp">
          <line x1="248" y1="108" x2="248" y2="136" stroke="#ea580c" strokeWidth="7" strokeLinecap="round"/>
          <line x1="248" y1="136" x2="284" y2="136" stroke="#ea580c" strokeWidth="7" strokeLinecap="round"/>
          <line x1="284" y1="136" x2="420" y2="136" stroke="#ea580c" strokeWidth="7" strokeLinecap="round"/>
          <line x1="284" y1="136" x2="296" y2="212" stroke="#ea580c" strokeWidth="7" strokeLinecap="round"/>
          <line x1="420" y1="136" x2="408" y2="212" stroke="#ea580c" strokeWidth="7" strokeLinecap="round"/>
          <line x1="296" y1="212" x2="408" y2="212" stroke="#ea580c" strokeWidth="7" strokeLinecap="round"/>
          <circle cx="352" cy="174" r="34" fill="#fff7ed" stroke="#ea580c" strokeWidth="7"/>
          <line x1="328" y1="150" x2="376" y2="198" stroke="#ea580c" strokeWidth="7" strokeLinecap="round"/>
        </g>
        <g className="wl">
          <circle cx="292" cy="246" r="20" fill="none" stroke="#ea580c" strokeWidth="6.5"/>
          <line x1="292" y1="226" x2="292" y2="266" stroke="#ea580c" strokeWidth="5" strokeLinecap="round"/>
          <line x1="272" y1="246" x2="312" y2="246" stroke="#ea580c" strokeWidth="5" strokeLinecap="round"/>
          <line x1="278" y1="232" x2="306" y2="260" stroke="#ea580c" strokeWidth="4" strokeLinecap="round"/>
          <line x1="306" y1="232" x2="278" y2="260" stroke="#ea580c" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="292" cy="246" r="5" fill="#ea580c"/>
        </g>
        <g className="wr">
          <circle cx="388" cy="246" r="20" fill="none" stroke="#ea580c" strokeWidth="6.5"/>
          <line x1="388" y1="226" x2="388" y2="266" stroke="#ea580c" strokeWidth="5" strokeLinecap="round"/>
          <line x1="368" y1="246" x2="408" y2="246" stroke="#ea580c" strokeWidth="5" strokeLinecap="round"/>
          <line x1="374" y1="232" x2="402" y2="260" stroke="#ea580c" strokeWidth="4" strokeLinecap="round"/>
          <line x1="402" y1="232" x2="374" y2="260" stroke="#ea580c" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="388" cy="246" r="5" fill="#ea580c"/>
        </g>
      </svg>
    </div>
    <p className="font-semibold text-orange-500 mt-1">{error}</p>
    <button
      type="button"
      onClick={() => {
        setSearch("");
        setError("");
        setSearchInput("");
        setSelectedCategory(null);
        setQuickFilter(null);
      }}
      className="mt-3 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 active:scale-95 transition"
    >
      Reload
    </button>
  </div>
        ) : (
          <ProductGrid
            items={displayed}
            t={t}
            onAddToCart={handleAddToCart}
            onBuy={(item) => setBuyItem(item)}
          />
        )}

      </div>

      {buyItem && (
        <BuyOptionsModal
          product={buyItem}
          onClose={() => setBuyItem(null)}
          onOrder={() => { setOrderItem(buyItem); setBuyItem(null); }}
          onContact={() => { setContactItem(buyItem); setBuyItem(null); }}
        />
      )}
      {orderItem && (
        <OrderModal
          product={orderItem}
          onClose={() => setOrderItem(null)}
          onContact={() => { setOrderItem(null); setContactItem(orderItem); }}
        />
      )}
     {contactItem && <ContactModal product={contactItem} onClose={() => setContactItem(null)} />}

{/* ── Contact Options Modal ── */}
{showContactOptions && (
  <div
    className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
    onClick={() => setShowContactOptions(false)}
  >
    <div
      className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-sm p-6 pb-10 md:pb-6"
      onClick={e => e.stopPropagation()}
    >
      <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 md:hidden" />
      <h3 className="text-center font-bold text-gray-800 text-base mb-1">Contact Us</h3>
      <p className="text-center text-xs text-gray-400 mb-6">Choose how you want to reach us</p>

      <div className="flex justify-around items-center">

        {/* Call */}
        <a href="tel:+255748399067" className="flex flex-col items-center gap-2 group">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition shadow-sm">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.07 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
            </svg>
          </div>
          <span className="text-xs font-semibold text-gray-600">Call</span>
        </a>

        {/* WhatsApp */}
        <a href="https://wa.me/255748399067" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition shadow-sm">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <span className="text-xs font-semibold text-gray-600">WhatsApp</span>
        </a>

        {/* SMS */}
        <a href="sms:+255748399067" className="flex flex-col items-center gap-2 group">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition shadow-sm">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <span className="text-xs font-semibold text-gray-600">SMS</span>
        </a>

      </div>

      <button
        onClick={() => setShowContactOptions(false)}
        className="mt-6 w-full py-2.5 rounded-xl bg-green-400 text-white text-sm font-semibold hover:bg-gray-200 transition"
      >
        Cancel
      </button>
    </div>
  </div>
)}

      <Footer />
    </div>
  );
}

export default Home;
