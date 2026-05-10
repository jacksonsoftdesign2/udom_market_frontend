import { useState, useEffect, useRef } from "react";
import OrderModal from "../components/OrderModal";
import BuyOptionsModal from "../components/BuyOptionsModal";
import ContactModal from "../components/ContactModal";
import { useNavigate } from "react-router-dom";
import translations from "../translations";
import logo from "../assets/upmarket_logo.png";
import banner from "../assets/banner.jpg";
import Header from "../components/Header";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";
import QuickLinks from "../components/QuickLinks";
import { FiStar, FiZap, FiClock, FiTruck, FiPhone, FiMail, FiTrendingUp,
       FiUsers, FiMapPin, FiTag, FiShoppingBag } from "react-icons/fi";

// ── Ad Banner Slides ────────────────────────────────────────────────
const AD_SLIDES = [
  {
    bg: "from-blue-800 to-blue-950",
    tag: "UDOM MARKET",
    tagIcon: <FiShoppingBag size={11}/>,
    title: "Campus Marketplace",
    sub: "Buy directly with verified traders  fast, safe, and local.",
    footer: "UDOM Campus, Dodoma",
    footerIcon: <FiMapPin size={12}/>,
    cta: "Shop Now",
  },
  {
    bg: "from-emerald-700 to-emerald-950",
    tag: "FLASH DEALS",
    tagIcon: <FiZap size={11}/>,
    title: "Up to 80% Off Quality Products",
    sub: "Fresh products listed daily  food, clothes, services & more from verified traders.",
    footer: "Limited time offers",
    footerIcon: <FiClock size={12}/>,
    cta: "View Deals",
  },
  {
    bg: "from-amber-700 to-amber-950",
    tag: "24 hrs Customer Services",
    tagIcon: <FiTruck size={11}/>,
    title: "Contact Market Management",
    sub: "Our customer Service Desk works 24hrs for any issue call us .",
    footer: "+255 748 399 067",
    footerIcon: <FiPhone size={12}/>,
    cta: "Contact Us",
  },
  {
    bg: "from-pink-700 to-pink-950",
    tag: "JOIN US",
    tagIcon: <FiUsers size={11}/>,
    title: "Become a Verified Trader",
    sub: "Register your business, list your products, and reach hundreds of UDOM students daily.",
    footer: "jacksonduwanghe@gmail.com",
    footerIcon: <FiMail size={12}/>,
    cta: "Register",
  },
];

// ── Ad Banner ───────────────────────────────────────────────────────
function AdBanner({ bannerImg }) {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSlide(s => (s + 1) % AD_SLIDES.length), 4000);
    return () => clearInterval(id);
  }, []);
  const s = AD_SLIDES[slide];
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-xl h-[170px] md:h-[220px] mb-5 select-none">
      <img src={bannerImg} alt="banner" className="absolute inset-0 w-full h-full object-cover object-center" />
      <div className={`absolute inset-0 bg-gradient-to-r ${s.bg} opacity-90 transition-all duration-700`} />
      <div className="relative z-10 h-full flex flex-col justify-between px-5 py-4">

        {/* Top tag */}
        <div>
          <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-[11px] font-semibold px-3 py-1 rounded-full mb-2">
            {s.tagIcon} {s.tag}
          </span>
          <h2 className="text-white font-bold text-xl md:text-2xl leading-tight">{s.title}</h2>
          <p className="text-white/75 text-xs mt-1">{s.sub}</p>
        </div>

        {/* Bottom footer */}
        <div className="flex items-center justify-between border-t border-white/20 pt-3">
          <span className="flex items-center gap-1.5 text-white/80 text-xs">
            {s.footerIcon} {s.footer}
          </span>
          <button className="bg-white/20 hover:bg-white/30 transition text-white text-xs font-semibold px-4 py-1.5 rounded-full border border-white/30">
            {s.cta} →
          </button>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {AD_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setSlide(i)}
            className={`h-1.5 rounded-full transition-all ${i === slide ? "bg-white w-5" : "bg-white/40 w-1.5"}`} />
        ))}
      </div>
    </div>
  );
}

// ── Category Bar ────────────────────────────────────────────────────
function CategoryBar({ categories, selected, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mb-5" style={{ scrollbarWidth: "none" }}>
      {[{ id: null, name: "All" }, ...categories].map((cat) => (
        <button key={cat.id ?? "all"} onClick={() => onSelect(cat.id)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${
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
                🏪 {tr.name}
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
            ${compact ? "rounded-xl px-2" : "rounded-2xl px-3"}
            ${showInstant && !compact ? "border-blue-300 ring-2 ring-blue-100" : ""}`}
        >
          <span className="text-gray-400 mr-1.5 text-sm flex-shrink-0">🔍</span>
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
            ${compact ? "px-3 py-1.5 rounded-xl text-xs" : "px-3 py-2.5 rounded-2xl text-xs sm:text-sm sm:px-5 shadow-sm"}`}
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
            const res = await fetch(
              `${API}/users/nearby?lat=${latitude}&lng=${longitude}&radius=5`
            );
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) {
              setNearbyError("No traders found within 5km of your location.");
              setNearbyProducts([]);
            } else {
              // Get products from nearby traders
              const traderIds = data.map(t => t.id);
              const nearby = products.filter(p => traderIds.includes(p.trader_id));
              if (nearby.length === 0) {
                setNearbyError("Nearby traders found but they have no active products.");
              }
              setNearbyProducts(nearby);
            }
          } catch {
            setNearbyError("Failed to fetch nearby traders.");
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
          className="fixed left-0 right-0 z-40 bg-white/90 backdrop-blur-md shadow-sm px-3 py-2 md:hidden"
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
        <AdBanner bannerImg={banner} />

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
          <div className="text-center py-16 text-red-400">
            <p className="text-3xl mb-2">⚠️</p>
            <p className="font-semibold">{error}</p>
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

      <Footer />
    </div>
  );
}

export default Home;
