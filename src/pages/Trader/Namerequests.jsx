import { API } from "../../api";
import { useState, useEffect } from "react";
import {
  FaTag, FaPlus, FaTimes, FaCheck, FaClock, FaExclamationCircle,
  FaChevronDown, FaSearch,
} from "react-icons/fa";
import { FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";

// ── helpers ────────────────────────────────────────────────────────────────

const STATUS_TABS = ["pending", "approved", "rejected"];

const statusBadge = (status) => {
  if (status === "approved") return "bg-green-100 text-green-700";
  if (status === "rejected") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
};

const statusIcon = (status) => {
  if (status === "approved") return <FiCheckCircle size={14} className="text-green-500" />;
  if (status === "rejected") return <FiXCircle     size={14} className="text-red-500"   />;
  return                            <FiClock       size={14} className="text-amber-500" />;
};

const chainItem = (text, isNew = false) => (
  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isNew ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
    {text}{isNew && <span className="ml-1 opacity-60">(new)</span>}
  </span>
);

// ── component ──────────────────────────────────────────────────────────────

export default function NameRequests() {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [showForm, setShowForm]   = useState(false);

  // ── form state ────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category_id: "", category_type: "product",
    brand_id: null, brand_name: "",
    model_id: null, model_name: "",
    new_brand: "", new_model: "", new_variant: "",
    // which levels are new
    brand_is_new: false, model_is_new: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // typeahead
  const [brands,   setBrands]   = useState([]);
  const [models,   setModels]   = useState([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [brandDropOpen, setBrandDropOpen] = useState(false);
  const [modelDropOpen, setModelDropOpen] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const inputCls   = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";
  const inputErrCls = "w-full px-3 py-2 border border-red-400 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400 bg-white";
  const labelCls   = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide";

  const getLabels = (type) => {
    if (type === "service")     return { l1: "Service Type", l2: "Package",  l3: "Add-on"  };
    if (type === "agriculture") return { l1: "Type",         l2: "Product",  l3: "Variety" };
    return                             { l1: "Brand",        l2: "Model",    l3: "Variant" };
  };

  // ── load requests ─────────────────────────────────────────────────────────
  useEffect(() => {
    loadRequests();
    fetch(`${API}/users/categories`)
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : (data.categories || [])))
      .catch(() => {});
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/products/name-requests/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch { setRequests([]); }
    finally { setLoading(false); }
  };

  // ── typeahead ─────────────────────────────────────────────────────────────
  const fetchBrands = async (categoryId, q = "") => {
    setLoadingBrands(true);
    try {
      const res  = await fetch(`${API}/products/brands?category_id=${categoryId}&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch { setBrands([]); }
    finally { setLoadingBrands(false); }
  };

  const fetchModels = async (brandId, q = "") => {
    setLoadingModels(true);
    try {
      const res  = await fetch(`${API}/products/models?brand_id=${brandId}&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setModels(Array.isArray(data) ? data : []);
    } catch { setModels([]); }
    finally { setLoadingModels(false); }
  };

  // ── form handlers ─────────────────────────────────────────────────────────
  const handleCategoryChange = (catId) => {
    const cat = categories.find(c => String(c.id) === String(catId));
    setForm({
      category_id: catId, category_type: cat?.type || "product",
      brand_id: null, brand_name: "",
      model_id: null, model_name: "",
      new_brand: "", new_model: "", new_variant: "",
      brand_is_new: false, model_is_new: false,
    });
    setBrands([]); setModels([]);
    setBrandSearch(""); setModelSearch("");
    setFormErrors({});
    if (catId) fetchBrands(catId);
  };

  const handleBrandSelect = (brand) => {
    setForm(p => ({
      ...p,
      brand_id: brand.id, brand_name: brand.name, brand_is_new: false,
      model_id: null, model_name: "", new_model: "", model_is_new: false,
      new_brand: "",
    }));
    setModels([]); setModelSearch("");
    setBrandDropOpen(false); setBrandSearch("");
    setFormErrors(p => ({ ...p, brand: false }));
    fetchModels(brand.id);
  };

  const handleBrandNew = () => {
    // trader typed a new brand name — mark as new, clear model
    setForm(p => ({
      ...p,
      brand_id: null, brand_is_new: true,
      model_id: null, model_name: "", new_model: "", model_is_new: true,
    }));
    setBrandDropOpen(false);
    setModels([]);
  };

  const handleModelSelect = (model) => {
    setForm(p => ({
      ...p,
      model_id: model.id, model_name: model.name, model_is_new: false,
      new_model: "",
    }));
    setModelDropOpen(false); setModelSearch("");
    setFormErrors(p => ({ ...p, model: false }));
  };

  const handleModelNew = () => {
    setForm(p => ({ ...p, model_id: null, model_is_new: true }));
    setModelDropOpen(false);
  };

  const resetForm = () => {
    setForm({
      category_id: "", category_type: "product",
      brand_id: null, brand_name: "",
      model_id: null, model_name: "",
      new_brand: "", new_model: "", new_variant: "",
      brand_is_new: false, model_is_new: false,
    });
    setBrands([]); setModels([]);
    setBrandSearch(""); setModelSearch("");
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!form.category_id) errors.category = true;
    if (!form.brand_is_new && !form.brand_id) errors.brand = true;
    if (form.brand_is_new  && !form.new_brand.trim())  errors.new_brand  = true;
    if (!form.model_is_new && !form.model_id) errors.model = true;
    if (form.model_is_new  && !form.new_model.trim())  errors.new_model  = true;
    if (!form.new_variant.trim()) errors.new_variant = true;
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    const body = {
      category_id: form.category_id,
      new_variant:  form.new_variant.trim(),
    };

    if (form.brand_is_new) {
      body.new_brand = form.new_brand.trim();
      body.new_model = form.new_model.trim();
    } else {
      body.brand_id = form.brand_id;
      if (form.model_is_new) {
        body.new_model = form.new_model.trim();
      } else {
        body.model_id = form.model_id;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/products/name-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccessMsg("Request submitted! Admin will review shortly.");
      setTimeout(() => setSuccessMsg(""), 4000);
      setShowForm(false);
      resetForm();
      loadRequests();
      setActiveTab("pending");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── filtered requests ─────────────────────────────────────────────────────
  const filtered = requests.filter(r => r.status === activeTab);

  const labels = getLabels(form.category_type);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FaTag className="text-blue-600" />
          Name Requests
          <span className="text-sm font-normal text-gray-400">({requests.filter(r => r.status === "pending").length} pending)</span>
        </h2>
        <button
          onClick={() => { setShowForm(!showForm); resetForm(); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium w-full sm:w-auto justify-center"
        >
          <FaPlus size={13} /> New Request
        </button>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-sm">
          <FiCheckCircle size={20} className="text-green-500 flex-shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* ── New Request Form ── */}
      {showForm && (
        <div className="bg-white rounded-xl shadow border border-blue-100 p-5">
          <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
            <FaTag className="text-blue-500" size={14} /> Submit Name Request
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Fill from the first level that doesn't exist. Admin will review and may correct spelling before approving.
          </p>

          {/* Category */}
          <div className="mb-4">
            <label className={labelCls}>Category <span className="text-red-500">*</span></label>
            <select
              value={form.category_id}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={formErrors.category ? inputErrCls : inputCls}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {formErrors.category && <p className="text-xs text-red-500 mt-1">Category is required.</p>}
          </div>

          {form.category_id && (
            <div className="space-y-4">

              {/* ── Brand level ── */}
              <div>
                <label className={labelCls}>{labels.l1} <span className="text-red-500">*</span></label>

                {!form.brand_is_new ? (
                  <>
                    {/* Search existing brands */}
                    <div className="relative">
                      <div
                        className={`${formErrors.brand ? inputErrCls : inputCls} flex items-center justify-between cursor-pointer`}
                        onClick={() => setBrandDropOpen(p => !p)}
                      >
                        <span className={form.brand_name ? "text-gray-800" : "text-gray-400"}>
                          {form.brand_name || `Search existing ${labels.l1}…`}
                        </span>
                        {form.brand_id
                          ? <button onClick={(e) => { e.stopPropagation(); setForm(p => ({ ...p, brand_id: null, brand_name: "" })); setBrands([]); setModels([]); }} className="text-gray-400 hover:text-gray-600"><FaTimes size={11}/></button>
                          : <FaChevronDown size={11} className="text-gray-400" />
                        }
                      </div>
                      {brandDropOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                            <FaSearch size={12} className="text-gray-400" />
                            <input
                              autoFocus
                              type="text"
                              placeholder={`Search ${labels.l1}…`}
                              value={brandSearch}
                              onChange={(e) => { setBrandSearch(e.target.value); fetchBrands(form.category_id, e.target.value); }}
                              className="flex-1 text-sm outline-none bg-transparent"
                              onClick={e => e.stopPropagation()}
                            />
                          </div>
                          <div className="max-h-36 overflow-y-auto">
                            {loadingBrands ? (
                              <p className="text-xs text-gray-400 px-3 py-2">Loading…</p>
                            ) : brands.length > 0 ? brands.map(b => (
                              <div key={b.id} onClick={() => handleBrandSelect(b)} className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer">{b.name}</div>
                            )) : (
                              <p className="text-xs text-gray-400 px-3 py-2 italic">No existing {labels.l1.toLowerCase()} found</p>
                            )}
                          </div>
                          <div className="border-t border-gray-100 px-3 py-2">
                            <button onClick={handleBrandNew} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                              + This is a new {labels.l1.toLowerCase()} — add it
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {formErrors.brand && <p className="text-xs text-red-500 mt-1">{labels.l1} is required.</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      Not found above?{" "}
                      <button onClick={handleBrandNew} className="text-blue-600 font-medium hover:underline">
                        Enter new {labels.l1.toLowerCase()}
                      </button>
                    </p>
                  </>
                ) : (
                  <>
                    {/* New brand name input */}
                    <div className="flex gap-2 items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder={`New ${labels.l1} name`}
                          value={form.new_brand}
                          onChange={(e) => { setForm(p => ({ ...p, new_brand: e.target.value })); setFormErrors(p => ({ ...p, new_brand: false })); }}
                          className={`${formErrors.new_brand ? inputErrCls : inputCls} border-amber-300 focus:ring-amber-400`}
                        />
                        {formErrors.new_brand && <p className="text-xs text-red-500 mt-1">{labels.l1} name is required.</p>}
                      </div>
                      <button
                        onClick={() => { setForm(p => ({ ...p, brand_is_new: false, new_brand: "", model_is_new: false, new_model: "" })); }}
                        className="mt-1 text-gray-400 hover:text-gray-600 text-xs"
                      >
                        <FaTimes size={13}/>
                      </button>
                    </div>
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <FaExclamationCircle size={11}/> New — will be reviewed by admin
                    </p>
                  </>
                )}
              </div>

              {/* ── Model level ── */}
              {(form.brand_id || form.brand_is_new) && (
                <div>
                  <label className={labelCls}>
                    {labels.l2} <span className="text-red-500">*</span>
                    {form.brand_name && <span className="text-gray-400 font-normal normal-case ml-1">(within {form.brand_name})</span>}
                    {form.brand_is_new && <span className="text-amber-500 font-normal normal-case ml-1">(must be new since brand is new)</span>}
                  </label>

                  {form.brand_is_new || form.model_is_new ? (
                    <>
                      <input
                        type="text"
                        placeholder={`New ${labels.l2} name`}
                        value={form.new_model}
                        onChange={(e) => { setForm(p => ({ ...p, new_model: e.target.value })); setFormErrors(p => ({ ...p, new_model: false })); }}
                        className={`${formErrors.new_model ? inputErrCls : inputCls} border-amber-300 focus:ring-amber-400`}
                      />
                      {formErrors.new_model && <p className="text-xs text-red-500 mt-1">{labels.l2} name is required.</p>}
                      {!form.brand_is_new && (
                        <button onClick={() => setForm(p => ({ ...p, model_is_new: false, new_model: "" }))} className="text-xs text-gray-400 hover:text-gray-600 mt-1">
                          ← Search existing instead
                        </button>
                      )}
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <FaExclamationCircle size={11}/> New — will be reviewed by admin
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <div
                          className={`${formErrors.model ? inputErrCls : inputCls} flex items-center justify-between cursor-pointer`}
                          onClick={() => setModelDropOpen(p => !p)}
                        >
                          <span className={form.model_name ? "text-gray-800" : "text-gray-400"}>
                            {form.model_name || `Search existing ${labels.l2}…`}
                          </span>
                          {form.model_id
                            ? <button onClick={(e) => { e.stopPropagation(); setForm(p => ({ ...p, model_id: null, model_name: "" })); }} className="text-gray-400 hover:text-gray-600"><FaTimes size={11}/></button>
                            : <FaChevronDown size={11} className="text-gray-400" />
                          }
                        </div>
                        {modelDropOpen && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                              <FaSearch size={12} className="text-gray-400" />
                              <input
                                autoFocus
                                type="text"
                                placeholder={`Search ${labels.l2}…`}
                                value={modelSearch}
                                onChange={(e) => { setModelSearch(e.target.value); fetchModels(form.brand_id, e.target.value); }}
                                className="flex-1 text-sm outline-none bg-transparent"
                                onClick={e => e.stopPropagation()}
                              />
                            </div>
                            <div className="max-h-36 overflow-y-auto">
                              {loadingModels ? (
                                <p className="text-xs text-gray-400 px-3 py-2">Loading…</p>
                              ) : models.length > 0 ? models.map(m => (
                                <div key={m.id} onClick={() => handleModelSelect(m)} className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer">{m.name}</div>
                              )) : (
                                <p className="text-xs text-gray-400 px-3 py-2 italic">No existing {labels.l2.toLowerCase()} found</p>
                              )}
                            </div>
                            <div className="border-t border-gray-100 px-3 py-2">
                              <button onClick={handleModelNew} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                                + This is a new {labels.l2.toLowerCase()} — add it
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      {formErrors.model && <p className="text-xs text-red-500 mt-1">{labels.l2} is required.</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        Not found?{" "}
                        <button onClick={handleModelNew} className="text-blue-600 font-medium hover:underline">
                          Enter new {labels.l2.toLowerCase()}
                        </button>
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* ── Variant level — always new ── */}
              {(form.brand_id || form.brand_is_new) && (form.model_id || form.model_is_new) && (
                <div>
                  <label className={labelCls}>
                    {labels.l3} <span className="text-red-500">*</span>
                    <span className="text-amber-500 font-normal normal-case ml-1">(always new)</span>
                  </label>
                  <input
                    type="text"
                    placeholder={`New ${labels.l3} name e.g. S25 Ultra 512GB Black`}
                    value={form.new_variant}
                    onChange={(e) => { setForm(p => ({ ...p, new_variant: e.target.value })); setFormErrors(p => ({ ...p, new_variant: false })); }}
                    className={`${formErrors.new_variant ? inputErrCls : inputCls} border-amber-300 focus:ring-amber-400`}
                  />
                  {formErrors.new_variant && <p className="text-xs text-red-500 mt-1">{labels.l3} name is required.</p>}
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <FaExclamationCircle size={11}/> Always new — this is the reason for the request
                  </p>
                </div>
              )}

              {/* ── Summary ── */}
              {form.new_variant && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-3">
                  <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Request summary</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {chainItem(categories.find(c => String(c.id) === String(form.category_id))?.name || "—")}
                    <span className="text-gray-300 text-xs">›</span>
                    {form.brand_is_new
                      ? chainItem(form.new_brand || "…", true)
                      : chainItem(form.brand_name)
                    }
                    <span className="text-gray-300 text-xs">›</span>
                    {form.model_is_new || form.brand_is_new
                      ? chainItem(form.new_model || "…", true)
                      : chainItem(form.model_name)
                    }
                    <span className="text-gray-300 text-xs">›</span>
                    {chainItem(form.new_variant, true)}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Admin will review and may correct spelling/casing before approving. You will be notified.
                  </p>
                </div>
              )}

              {/* Submit */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !form.new_variant.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Submitting…</>
                  ) : (
                    <><FaTag size={12}/> Submit Request</>
                  )}
                </button>
                <button
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          {STATUS_TABS.map(tab => {
            const count = requests.filter(r => r.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide transition flex items-center justify-center gap-1.5 ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab === "pending"  && <FiClock       size={13}/>}
                {tab === "approved" && <FiCheckCircle size={13}/>}
                {tab === "rejected" && <FiXCircle     size={13}/>}
                {tab}
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    tab === "pending"  ? "bg-amber-100 text-amber-700" :
                    tab === "approved" ? "bg-green-100 text-green-700" :
                    "bg-red-100 text-red-700"
                  }`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Request list ── */}
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="py-10 text-center text-gray-400">
              <svg className="animate-spin w-6 h-6 mx-auto mb-2" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <p className="text-sm">Loading requests…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              <FaTag size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No {activeTab} requests</p>
              {activeTab === "pending" && (
                <p className="text-xs mt-1">Submit a request when you can't find a brand, model or variant.</p>
              )}
            </div>
          ) : (
            filtered.map(req => (
              <div key={req.id} className="p-4">
                {/* Chain */}
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  {chainItem(req.category_name || "—")}
                  <span className="text-gray-300 text-xs">›</span>
                  {req.new_brand
                    ? chainItem(req.corrected_brand || req.new_brand, req.status !== "approved")
                    : chainItem(req.brand_name || "—")
                  }
                  <span className="text-gray-300 text-xs">›</span>
                  {req.new_model
                    ? chainItem(req.corrected_model || req.new_model, req.status !== "approved")
                    : chainItem(req.model_name || "—")
                  }
                  <span className="text-gray-300 text-xs">›</span>
                  {chainItem(req.corrected_variant || req.new_variant, req.status !== "approved")}
                </div>

                {/* Status + date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {statusIcon(req.status)}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusBadge(req.status)}`}>
                      {req.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Approved info */}
                {req.status === "approved" && (req.corrected_brand || req.corrected_model || req.corrected_variant) && (
                  <div className="mt-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    <p className="text-xs text-green-600 font-medium mb-1">Admin made corrections:</p>
                    <div className="space-y-0.5">
                      {req.corrected_brand   && <p className="text-xs text-green-700">Brand corrected to: <strong>{req.corrected_brand}</strong></p>}
                      {req.corrected_model   && <p className="text-xs text-green-700">Model corrected to: <strong>{req.corrected_model}</strong></p>}
                      {req.corrected_variant && <p className="text-xs text-green-700">Variant corrected to: <strong>{req.corrected_variant}</strong></p>}
                    </div>
                  </div>
                )}

                {/* Approved — names now available */}
                {req.status === "approved" && (
                  <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <FaCheck size={10}/> Names now available in Add Product dropdowns
                  </div>
                )}

                {/* Rejected reason */}
                {req.status === "rejected" && req.rejection_reason && (
                  <div className="mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <p className="text-xs text-red-600 font-medium mb-0.5">Rejection reason:</p>
                    <p className="text-xs text-red-500">{req.rejection_reason}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}