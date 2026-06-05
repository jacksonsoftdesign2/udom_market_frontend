import { API } from "../../api";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  FaBox, FaSearch, FaTimes, FaChevronLeft, FaChevronRight,
  FaList, FaArrowLeft,
} from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";

// ── Days helpers ───────────────────────────────────────────────────────────
const daysElapsed  = (d) => Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
const daysRemaining = (d) => Math.max(0, 90 - daysElapsed(d));

const PAGE_SIZE = 20;

// ── Component ──────────────────────────────────────────────────────────────
export default function ProductListView({ onClose }) {
  // ── filter state ──
  const [search,     setSearch]     = useState("");
  const [catId,      setCatId]      = useState("");
  const [brandId,    setBrandId]    = useState("");
  const [modelId,    setModelId]    = useState("");
  const [variantId,  setVariantId]  = useState("");
  const [status,     setStatus]     = useState("");
  const [page,       setPage]       = useState(1);

  // ── data ──
  const [products,   setProducts]   = useState([]);
  const [total,      setTotal]      = useState(0);
  const [pages,      setPages]      = useState(1);
  const [loading,    setLoading]    = useState(false);

  // ── dropdown options ──
  const [categories, setCategories] = useState([]);
  const [brands,     setBrands]     = useState([]);
  const [models,     setModels]     = useState([]);
  const [variants,   setVariants]   = useState([]);

  const token = localStorage.getItem("token");
  const searchTimer = useRef(null);

  // ── load categories once ──
  useEffect(() => {
    fetch(`${API}/users/categories`)
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : (d.categories || [])))
      .catch(() => {});
  }, []);

  // ── cascade: category → brands ──
  useEffect(() => {
    setBrandId(""); setModelId(""); setVariantId("");
    setBrands([]); setModels([]); setVariants([]);
    if (!catId) return;
    fetch(`${API}/products/brands?category_id=${catId}&q=`)
      .then(r => r.json())
      .then(d => setBrands(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [catId]);

  // ── cascade: brand → models ──
  useEffect(() => {
    setModelId(""); setVariantId("");
    setModels([]); setVariants([]);
    if (!brandId) return;
    fetch(`${API}/products/models?brand_id=${brandId}&q=`)
      .then(r => r.json())
      .then(d => setModels(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [brandId]);

  // ── cascade: model → variants ──
  useEffect(() => {
    setVariantId(""); setVariants([]);
    if (!modelId) return;
    fetch(`${API}/products/variants?model_id=${modelId}&q=`)
      .then(r => r.json())
      .then(d => setVariants(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [modelId]);

  // ── fetch products ──
  const fetchProducts = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: PAGE_SIZE });
      if (search)    params.set("search",      search);
      if (catId)     params.set("category_id", catId);
      if (brandId)   params.set("brand_id",    brandId);
      if (modelId)   params.set("model_id",    modelId);
      if (variantId) params.set("variant_id",  variantId);
      if (status)    params.set("status",      status);

      const res  = await fetch(`${API}/products/my_products_list?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(p);
    } catch { setProducts([]); }
    finally  { setLoading(false); }
  }, [search, catId, brandId, modelId, variantId, status, token]);

  // ── debounce search ──
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchProducts(1), 350);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  // ── re-fetch when filters change ──
  useEffect(() => { fetchProducts(1); }, [catId, brandId, modelId, variantId, status]);

  const inputCls = "px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-400 bg-white text-gray-700";

  return (
    <div className="space-y-3">

      {/* Back button */}
      <button
        onClick={onClose}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition"
      >
        <FaArrowLeft size={11} /> Back to products
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-800">All Products</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
        <FaSearch className="text-gray-400 flex-shrink-0" size={13} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name…"
          className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={11} />
          </button>
        )}
      </div>

      {/* Filters — all on one row */}
      <div className="flex gap-2 flex-wrap">
        <select value={catId} onChange={e => setCatId(e.target.value)} className={inputCls}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select value={brandId} onChange={e => setBrandId(e.target.value)} disabled={!catId} className={`${inputCls} ${!catId ? "opacity-40 cursor-not-allowed" : ""}`}>
          <option value="">Brand</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        <select value={modelId} onChange={e => setModelId(e.target.value)} disabled={!brandId} className={`${inputCls} ${!brandId ? "opacity-40 cursor-not-allowed" : ""}`}>
          <option value="">Model</option>
          {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>

        <select value={variantId} onChange={e => setVariantId(e.target.value)} disabled={!modelId} className={`${inputCls} ${!modelId ? "opacity-40 cursor-not-allowed" : ""}`}>
          <option value="">Variant</option>
          {variants.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>

        <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls}>
          <option value="">All statuses</option>
          <option value="Available">Available</option>
          <option value="Unavailable">Unavailable</option>
        </select>

        {/* Clear filters */}
        {(catId || brandId || modelId || variantId || status) && (
          <button
            onClick={() => { setCatId(""); setBrandId(""); setModelId(""); setVariantId(""); setStatus(""); }}
            className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 px-2"
          >
            <FaTimes size={10} /> Clear
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
              <div className="w-11 h-11 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                <div className="h-2.5 bg-gray-100 rounded animate-pulse w-1/2" />
              </div>
              <div className="space-y-1.5 text-right">
                <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
                <div className="h-2.5 bg-gray-100 rounded animate-pulse w-14" />
              </div>
            </div>
          ))
        ) : products.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <FaBox size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No products found</p>
          </div>
        ) : (
          products.map((p, idx) => {
            const remaining = daysRemaining(p.listing_date || p.created_at);
            const isLow     = remaining <= 10;
            const isExp     = remaining === 0;
            const isLowStk  = p.stock <= 5;
            const breadcrumb = [p.category, p.brand_name, p.model_name, p.variant_name].filter(Boolean).join(" › ");

            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition
                  ${idx < products.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                {/* Thumbnail */}
                <div className="w-11 h-11 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                  {p.thumb ? (
                    <img src={p.thumb} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FaBox size={16} />
                    </div>
                  )}
                </div>

                {/* Name + breadcrumb */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  {breadcrumb && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{breadcrumb}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {/* Status */}
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full
                      ${p.status === "Available" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.status}
                    </span>
                    {/* Stock */}
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full
                      ${isLowStk ? "bg-yellow-50 text-yellow-700" : "bg-blue-50 text-blue-600"}`}>
                      {p.stock_type === "capacity" ? "Cap" : "Stock"}: {p.stock}
                    </span>
                    {/* Days */}
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full
                      ${isExp ? "bg-red-100 text-red-600" : isLow ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-500"}`}>
                      {isExp ? "Expired" : `${remaining}d left`}
                    </span>
                  </div>
                </div>

                {/* Price + date */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {(p.price || 0).toLocaleString()}
                    <span className="text-xs font-normal text-gray-400 ml-0.5">TZS</span>
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {new Date(p.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-gray-400">
            Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => fetchProducts(page - 1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <FaChevronLeft size={11} />
            </button>
            {[...Array(Math.min(pages, 5))].map((_, i) => {
              const pg = i + 1;
              return (
                <button
                  key={pg}
                  onClick={() => fetchProducts(pg)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium border transition
                    ${page === pg
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  {pg}
                </button>
              );
            })}
            {pages > 5 && <span className="text-xs text-gray-400 self-center px-1">…{pages}</span>}
            <button
              onClick={() => fetchProducts(page + 1)}
              disabled={page === pages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <FaChevronRight size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
