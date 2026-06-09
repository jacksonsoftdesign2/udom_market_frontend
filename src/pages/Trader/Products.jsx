import{ API } from "../../api";

import { useState, useEffect } from "react";
import {
  FaBox, FaEdit, FaTrash, FaPlus, FaSearch,
  FaChevronLeft, FaChevronRight, FaTimes, FaRedo, FaUpload, FaTag, FaList,
} from "react-icons/fa";
import { FiCheckCircle } from "react-icons/fi";
import ProductListView from "./ProductListView";
import { usePaymentStatus } from '../../hooks/usePaymentStatus'; 

// ── NEW: emptyForm now includes hierarchy fields ──
const emptyForm = {
  price: "", stock: "", stock_type: "stock", category: "", category_type: "product",
  brand_id: null, brand_name: "",
  model_id: null, model_name: "",
  variant_id: null, variant_name: "",
  status: "Available", description: "", images: [], imageFiles: [], specs: [],
};

const newSpec = () => ({ id: Date.now() + Math.random(), attribute: "", value: "", unit: "" });

/** Days elapsed since a given date (always positive) */
const daysElapsed = (date) =>
  Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));


const daysRemaining = (date) => Math.max(0, 90 - daysElapsed(date));


const getLabels = (type) => {
  if (type === 'service')     return { l1: 'Service Type', l2: 'Package', l3: 'Add-on' };
  if (type === 'agriculture') return { l1: 'Type', l2: 'Product', l3: 'Variety' };
  return { l1: 'Brand', l2: 'Model', l3: 'Variant' };
};


const getStockLabel = (type, stockType) => {
  if (type === 'service') return stockType === 'capacity' ? 'Capacity (clients/day)' : 'Stock (units)';
  return 'Stock';
};


function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [addErrors, setAddErrors] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageIndexes, setImageIndexes] = useState({});
  const [, setTick] = useState(0);
  const [imageLimitMsg, setImageLimitMsg] = useState("");

  // ── NEW: typeahead state
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [variants, setVariants] = useState([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [variantSearch, setVariantSearch] = useState("");
  const [brandDropOpen, setBrandDropOpen] = useState(false);
  const [modelDropOpen, setModelDropOpen] = useState(false);
  const [variantDropOpen, setVariantDropOpen] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [editBrands, setEditBrands] = useState([]);
  const [editModels, setEditModels] = useState([]);
  const [editVariants, setEditVariants] = useState([]);
  const [editBrandSearch, setEditBrandSearch] = useState("");
  const [editModelSearch, setEditModelSearch] = useState("");
  const [editVariantSearch, setEditVariantSearch] = useState("");
  const [editBrandDropOpen, setEditBrandDropOpen] = useState(false);
  const [editModelDropOpen, setEditModelDropOpen] = useState(false);
  const [editVariantDropOpen, setEditVariantDropOpen] = useState(false);
  const [loadingEditBrands, setLoadingEditBrands] = useState(false);
  const [loadingEditModels, setLoadingEditModels] = useState(false);
  const [loadingEditVariants, setLoadingEditVariants] = useState(false);
  const [showList, setShowList] = useState(false);
  const { isPaid, loading: paymentLoading } = usePaymentStatus();
  useEffect(() => {
    fetch(`${API}/users/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : (data.categories || [])))
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  // ── search ──────────────────────────────────────────────────────────────

  const filteredProducts = products.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── image carousel ──────────────────────────────────────────────────────

  const nextImage = (productId) => {
    const product = products.find((p) => p.id === productId);
    const current = imageIndexes[productId] || 0;
    setImageIndexes((prev) => ({
      ...prev,
      [productId]: (current + 1) % product.images.length,
    }));
  };


  const fetchEditBrands = async (categoryId, q = '') => {
  setLoadingEditBrands(true);
  try {
    const res = await fetch(`${API}/products/brands?category_id=${categoryId}&q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setEditBrands(Array.isArray(data) ? data : []);
  } catch { setEditBrands([]); }
  finally { setLoadingEditBrands(false); }
};

const fetchEditModels = async (brandId, q = '') => {
  setLoadingEditModels(true);
  try {
    const res = await fetch(`${API}/products/models?brand_id=${brandId}&q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setEditModels(Array.isArray(data) ? data : []);
  } catch { setEditModels([]); }
  finally { setLoadingEditModels(false); }
};

const fetchEditVariants = async (modelId, q = '') => {
  setLoadingEditVariants(true);
  try {
    const res = await fetch(`${API}/products/variants?model_id=${modelId}&q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setEditVariants(Array.isArray(data) ? data : []);
  } catch { setEditVariants([]); }
  finally { setLoadingEditVariants(false); }
};
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setImageIndexes((prev) => {
        const updated = { ...prev };
        products.forEach((p) => {
          if ((p.images || []).length > 1) {
            const current = updated[p.id] || 0;
            updated[p.id] = (current + 1) % p.images.length;
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [products]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/products/my_product`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setProducts(Array.isArray(data) ? data.map(p => ({
          ...p,
          listingDate: p.listing_date,
          createdDate: p.created_at,
          specs: p.specs ? (typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs) : [],
          images: p.images || [],
        })) : []);
      } catch (err) {
        console.error('Failed to load products', err);
      }
    };
    load();
  }, []);

  const prevImage = (productId) => {
    const product = products.find((p) => p.id === productId);
    const current = imageIndexes[productId] || 0;
    setImageIndexes((prev) => ({
      ...prev,
      [productId]: (current - 1 + product.images.length) % product.images.length,
    }));
  };

  // ── NEW: typeahead fetch functions ────────────────────────────────────────

  const fetchBrands = async (categoryId, q = '') => {
    setLoadingBrands(true);
    try {
      const res = await fetch(`${API}/products/brands?category_id=${categoryId}&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch (err) { setBrands([]); }
    finally { setLoadingBrands(false); }
  };

  const fetchModels = async (brandId, q = '') => {
    setLoadingModels(true);
    try {
      const res = await fetch(`${API}/products/models?brand_id=${brandId}&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setModels(Array.isArray(data) ? data : []);
    } catch (err) { setModels([]); }
    finally { setLoadingModels(false); }
  };

  const fetchVariants = async (modelId, q = '') => {
    setLoadingVariants(true);
    try {
      const res = await fetch(`${API}/products/variants?model_id=${modelId}&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setVariants(Array.isArray(data) ? data : []);
    } catch (err) { setVariants([]); }
    finally { setLoadingVariants(false); }
  };

  // ── NEW: cascade handlers ─────────────────────────────────────────────────

  const handleCategoryChange = (catId) => {
    const cat = categories.find(c => String(c.id) === String(catId));
    setAddForm(prev => ({
      ...prev,
      category: catId,
      category_type: cat?.type || 'product',
      brand_id: null, brand_name: '',
      model_id: null, model_name: '',
      variant_id: null, variant_name: '',
      stock_type: 'stock',
    }));
    setBrands([]); setModels([]); setVariants([]);
    setBrandSearch(''); setModelSearch(''); setVariantSearch('');
    setAddErrors(p => ({ ...p, category: false }));
    if (catId) fetchBrands(catId);
  };

  const handleBrandSelect = (brand) => {
    setAddForm(prev => ({
      ...prev,
      brand_id: brand.id, brand_name: brand.name,
      model_id: null, model_name: '',
      variant_id: null, variant_name: '',
    }));
    setModels([]); setVariants([]);
    setModelSearch(''); setVariantSearch('');
    setBrandDropOpen(false);
    setBrandSearch('');
    setAddErrors(p => ({ ...p, brand: false }));
    fetchModels(brand.id);
  };

  const handleModelSelect = (model) => {
    setAddForm(prev => ({
      ...prev,
      model_id: model.id, model_name: model.name,
      variant_id: null, variant_name: '',
    }));
    setVariants([]);
    setVariantSearch('');
    setModelDropOpen(false);
    setModelSearch('');
    setAddErrors(p => ({ ...p, model: false }));
    fetchVariants(model.id);
  };

  const handleVariantSelect = (variant) => {
    setAddForm(prev => ({
      ...prev,
      variant_id: variant.id, variant_name: variant.name,
    }));
    setVariantDropOpen(false);
    setVariantSearch('');
    setAddErrors(p => ({ ...p, variant: false }));
  };

  // ── add product ─────────────────────────────────────────────────────────

  // ── UPDATED: validate uses hierarchy fields instead of name ──
  const validateAdd = () => {
    const errors = {};
    if (!addForm.category)   errors.category = true;
    if (!addForm.brand_id)   errors.brand    = true;
    if (!addForm.model_id)   errors.model    = true;
    if (!addForm.variant_id) errors.variant  = true;
    if (!addForm.price)      errors.price    = true;
    if (!addForm.stock)      errors.stock    = true;
    if (addForm.images.length === 0) errors.images = true;
    if (!addForm.description.trim()) errors.description = true;
    if (addForm.specs.length < 3)    errors.specs = true;
    return errors;
  };

  // ── UPDATED: handleAddProduct sends hierarchy ids + generated name ──
  const handleAddProduct = async () => {
    const errors = validateAdd();
    if (Object.keys(errors).length > 0) { setAddErrors(errors); return; }

    const generatedName = `${addForm.brand_name} ${addForm.variant_name}`.trim();

    const data = new FormData();
    data.append('name',        generatedName);
    data.append('description', addForm.description);
    data.append('price',       addForm.price);
    data.append('stock',       addForm.stock);
    data.append('stock_type',  addForm.stock_type);
    data.append('category_id', addForm.category);
    data.append('brand_id',    addForm.brand_id);
    data.append('model_id',    addForm.model_id);
    data.append('variant_id',  addForm.variant_id);
    data.append('status',      addForm.status);
    data.append('specs',       JSON.stringify(addForm.specs));
    addForm.imageFiles.forEach(file => data.append('images', file));

    setSaving(true);
    try {
      const res = await fetch(`${API}/products/add`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: data
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setProducts(prev => [...prev, { ...result.product, images: result.product.images || [] }]);
      setAddForm(emptyForm);
      setAddErrors({});
      setShowAddForm(false);
      setBrands([]); setModels([]); setVariants([]);
      setSuccessMsg("Product saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setAddForm((prev) => ({
      ...prev,
      images: [...prev.images, ...urls].slice(0, 6),
      imageFiles: [...prev.imageFiles, ...files].slice(0, 6),
    }));
    setAddErrors((prev) => ({ ...prev, images: false }));
    e.target.value = "";
  };

  const removeEditImage = (idx) => {
    setEditingProduct((prev) => {
      const removedUrl = prev.images[idx];
      const isBlobUrl = removedUrl?.startsWith('blob:');
      const blobUrls = prev.images.filter(u => u?.startsWith('blob:'));
      const blobIdx = blobUrls.indexOf(removedUrl);
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== idx),
        newImageFiles: isBlobUrl
          ? (prev.newImageFiles || []).filter((_, i) => i !== blobIdx)
          : (prev.newImageFiles || []),
      };
    });
  };

  // Add-form spec helpers
const addAddSpec = () => {
  if (addForm.specs.length >= 12) { setSpecLimitMsg("Maximum 12 specs allowed."); return; }
  setAddForm((prev) => ({ ...prev, specs: [...prev.specs, newSpec()] }));
  setAddErrors(p => ({ ...p, specs: false }));
};

  const updateAddSpec = (id, field, value) =>
    setAddForm((prev) => ({
      ...prev,
      specs: prev.specs.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));

  const removeAddSpec = (id) =>
    setAddForm((prev) => ({
      ...prev,
      specs: prev.specs.filter((s) => s.id !== id),
    }));

  const removeAddImage = (idx) => {
    setAddForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
      imageFiles: prev.imageFiles.filter((_, i) => i !== idx),
    }));
  };

  // ── delete ───────────────────────────────────────────────────────────────

  const handleDeleteProduct = async (id) => {
    setDeleting(id);
    setConfirmDelete(null);
    try {
      const res = await fetch(`${API}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Delete failed');
      setProducts(prev => prev.filter(p => p.id !== id));
      setSuccessMsg("Product deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  // ── renew listing (reset 90-day timer) ──────────────────────────────────

  const handleRenew = async (id) => {
    try {
      const res = await fetch(`${API}/products/renew/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Renew failed');
      setProducts(prev =>
        prev.map(p => p.id === id ? { ...p, listingDate: new Date() } : p)
      );
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // ── edit ─────────────────────────────────────────────────────────────────

const openEdit = (product) => {
  setEditingProduct({
    ...product,
    price: String(product.price),
    stock: String(product.stock),
    specs: (product.specs || []).map((s) => ({ ...s })),
    images: (product.images || []).map(img =>
      typeof img === 'object' ? (img.image_url || '') : img
    ).filter(Boolean),
    newImageFiles: [],
    // naming fields
    brand_id:    product.brand_id    || null,
    brand_name:  product.brand_name  || '',
    model_id:    product.model_id    || null,
    model_name:  product.model_name  || '',
    variant_id:  product.variant_id  || null,
    variant_name: product.variant_name || '',
    category_type: categories.find(c => String(c.id) === String(product.category_id))?.type || 'product',
  });
  // pre-load dropdowns if category already set
  if (product.category_id) fetchEditBrands(product.category_id);
  if (product.brand_id)    fetchEditModels(product.brand_id);
  if (product.model_id)    fetchEditVariants(product.model_id);
  setEditBrandSearch(''); setEditModelSearch(''); setEditVariantSearch('');
};

  const handleEditChange = (field, value) =>
    setEditingProduct((prev) => ({ ...prev, [field]: value }));

  const handleEditImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((f) => URL.createObjectURL(f));
    const existingCount = editingProduct.images.length;
    const totalAfter = existingCount + files.length;
    if (totalAfter > 6) {
      setImageLimitMsg(`You have ${existingCount} image${existingCount !== 1 ? "s" : ""}. You can only add ${6 - existingCount} more (max 6).`);
      return;
    }
    setEditingProduct((prev) => ({
      ...prev,
      images: [...prev.images, ...urls],
      newImageFiles: [...(prev.newImageFiles || []), ...files],
    }));
    e.target.value = "";
    setImageLimitMsg("");
  };
     

  const handleEditCategoryChange = (catId) => {
  const cat = categories.find(c => String(c.id) === String(catId));
  setEditingProduct(prev => ({
    ...prev,
    category_id: catId,
    category_type: cat?.type || 'product',
    brand_id: null, brand_name: '',
    model_id: null, model_name: '',
    variant_id: null, variant_name: '',
    name: '',
  }));
  setEditBrands([]); setEditModels([]); setEditVariants([]);
  setEditBrandSearch(''); setEditModelSearch(''); setEditVariantSearch('');
  if (catId) fetchEditBrands(catId);
};

const handleEditBrandSelect = (brand) => {
  setEditingProduct(prev => ({
    ...prev,
    brand_id: brand.id, brand_name: brand.name,
    model_id: null, model_name: '',
    variant_id: null, variant_name: '',
    name: brand.name,
  }));
  setEditModels([]); setEditVariants([]);
  setEditModelSearch(''); setEditVariantSearch('');
  setEditBrandDropOpen(false); setEditBrandSearch('');
  fetchEditModels(brand.id);
};

const handleEditModelSelect = (model) => {
  setEditingProduct(prev => ({
    ...prev,
    model_id: model.id, model_name: model.name,
    variant_id: null, variant_name: '',
  }));
  setEditVariants([]);
  setEditVariantSearch('');
  setEditModelDropOpen(false); setEditModelSearch('');
  fetchEditVariants(model.id);
};

const handleEditVariantSelect = (variant) => {
  setEditingProduct(prev => ({
    ...prev,
    variant_id: variant.id, variant_name: variant.name,
    name: `${prev.brand_name} ${variant.name}`.trim(),
  }));
  setEditVariantDropOpen(false); setEditVariantSearch('');
};
  const handleSpecChange = (id, field, value) =>
    setEditingProduct((prev) => ({
      ...prev,
      specs: prev.specs.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));

  const addEditSpec = () =>
    setEditingProduct((prev) => ({
      ...prev,
      specs: [...prev.specs, newSpec()],
    }));

  const removeEditSpec = (id) =>
    setEditingProduct((prev) => ({
      ...prev,
      specs: prev.specs.filter((s) => s.id !== id),
    }));

  const saveEdit = async () => {
    const data = new FormData();
    data.append('name',        editingProduct.name);
    data.append('description', editingProduct.description);
    data.append('price',       editingProduct.price);
    data.append('stock',       editingProduct.stock);
    data.append('category_id', editingProduct.category_id || editingProduct.category);
    if (editingProduct.brand_id)   data.append('brand_id',   editingProduct.brand_id);
    if (editingProduct.model_id)   data.append('model_id',   editingProduct.model_id);
    if (editingProduct.variant_id) data.append('variant_id', editingProduct.variant_id);
    data.append('status',      editingProduct.status);
    data.append('specs',       JSON.stringify(editingProduct.specs));
    (editingProduct.newImageFiles || []).forEach(file => data.append('images', file));
    const remainingUrls = (editingProduct.images || []).filter(url =>
      typeof url === 'string' && (url.startsWith('http') || url.startsWith('https'))
    );
    data.append('remainingImages', JSON.stringify(remainingUrls));

    setSaving(true);
    try {
      const res = await fetch(`${API}/products/edit/${editingProduct.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: data
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
  ...result.product,
  brand_id:     editingProduct.brand_id,
  model_id:     editingProduct.model_id,
  variant_id:   editingProduct.variant_id,
  brand_name:   editingProduct.brand_name,
  model_name:   editingProduct.model_name,
  variant_name: editingProduct.variant_name,
  listingDate: result.product.listing_date,
  createdDate: result.product.created_at,
  specs: result.product.specs
    ? (typeof result.product.specs === 'string'
        ? JSON.parse(result.product.specs)
        : result.product.specs)
    : [],
  images: result.product.images || [],
} : p));
      setEditSuccessMsg("updated");
      setTimeout(() => {
        setEditSuccessMsg("");
        setEditingProduct(null);
        setSuccessMsg("Product updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }, 5000);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const [specLimitMsg, setSpecLimitMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editSuccessMsg, setEditSuccessMsg] = useState("");

  // ── styles ────────────────────────────────────────────────────────────────

  const inputCls =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";
  const inputErrCls =
    "w-full px-3 py-2 border border-red-400 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400 bg-white";
  const labelCls =
    "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide";

  // ── render ────────────────────────────────────────────────────────────────
if (showList) return <ProductListView onClose={() => setShowList(false)} />;
  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
<h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
  <FaBox className="text-blue-600" />
  My Products
  <span className="text-sm font-normal text-gray-400">({products.length})</span>
  <button
    onClick={() => setShowList(true)}
    className="text-xs text-blue-500 font-normal flex items-center gap-1 hover:text-blue-700 ml-1"
  >
    <FaList size={11} /> See all
  </button>
</h2>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setAddForm(emptyForm); setAddErrors({}); setBrands([]); setModels([]); setVariants([]); }}
           disabled={!isPaid || paymentLoading}
  className={`px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm font-medium w-full sm:w-auto justify-center ${
    isPaid && !paymentLoading
      ? 'bg-blue-600 text-white hover:bg-blue-700'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
  }`}
>
          <FaPlus size={13} />
           {paymentLoading ? 'Checking...' : 'Add Product'}
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-lg border border-gray-200 shadow-sm">
        <FaSearch className="text-gray-400" size={14} />
        <input
          type="text"
          placeholder="Search by name or category…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} className="text-gray-400 hover:text-gray-600">
            <FaTimes size={12} />
          </button>
        )}
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-sm">
          <FiCheckCircle size={20} className="text-green-500 flex-shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}


      {!isPaid && !paymentLoading && (
  <div className="bg-red-50 border border-red-200 rounded-[4px] p-4 mb-4">
    <div className="flex items-start gap-3">
      <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-red-700 font-semibold text-sm">Payment Required</p>
        <p className="text-red-600 text-sm mt-1">
          You need to pay your monthly fee to add products. Visit the Payments page to complete payment.
        </p>
      </div>
    </div>
  </div>
)}


{showAddForm && isPaid && (
        <div className="bg-white rounded-xl shadow border border-blue-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaPlus className="text-blue-500" size={14} /> New Product
          </h3>

          {/* ── Step 1: Category ── */}
          <div className="mb-4">
            <label className={labelCls}>Category <span className="text-red-500">*</span></label>
            <select
              value={addForm.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={addErrors.category ? inputErrCls : inputCls}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {addErrors.category && <p className="text-xs text-red-500 mt-1">Category is required.</p>}
          </div>

          {/* ── Steps 2-4: Cascading dropdowns — only show after category selected ── */}
          {addForm.category && (() => {
            const labels = getLabels(addForm.category_type);
            return (
              <div className="space-y-3 mb-4">

                {/* ── Brand dropdown ── */}
                <div className="relative">
                  <label className={labelCls}>
                    {labels.l1} <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`${addErrors.brand ? inputErrCls : inputCls} flex items-center justify-between cursor-pointer`}
                    onClick={() => { setBrandDropOpen(p => !p); setModelDropOpen(false); setVariantDropOpen(false); }}
                  >
                    <span className={addForm.brand_name ? "text-gray-800" : "text-gray-400"}>
                      {addForm.brand_name || `Search ${labels.l1}...`}
                    </span>
                    {addForm.brand_id
                      ? <button onClick={(e) => { e.stopPropagation(); setAddForm(p => ({ ...p, brand_id: null, brand_name: '', model_id: null, model_name: '', variant_id: null, variant_name: '' })); setModels([]); setVariants([]); }} className="text-gray-400 hover:text-gray-600"><FaTimes size={11} /></button>
                      : <span className="text-gray-400 text-xs">▼</span>
                    }
                  </div>
                  {brandDropOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                        <FaSearch size={12} className="text-gray-400" />
                        <input
                          autoFocus
                          type="text"
                          placeholder={`Search ${labels.l1}...`}
                          value={brandSearch}
                          onChange={(e) => { setBrandSearch(e.target.value); fetchBrands(addForm.category, e.target.value); }}
                          className="flex-1 text-sm outline-none bg-transparent"
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {loadingBrands
                          ? <p className="text-xs text-gray-400 px-3 py-2">Loading...</p>
                          : brands.length > 0
                            ? brands.map(b => <div key={b.id} onClick={() => handleBrandSelect(b)} className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer">{b.name}</div>)
                            : <p className="text-xs text-gray-400 px-3 py-2 italic">No results found</p>
                        }
                      </div>
                      <div className="border-t border-gray-100 px-3 py-2 flex items-center justify-between bg-amber-50">
                        <span className="text-xs text-gray-400">Not found?</span>
                        <button
                          onClick={() => setBrandDropOpen(false)}
                          className="text-xs font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1"
                        >
                          <FaTag size={10} /> Submit name request
                        </button>
                      </div>
                    </div>
                  )}
                  {addErrors.brand && <p className="text-xs text-red-500 mt-1">{labels.l1} is required.</p>}
                </div>

                {/* ── Model dropdown ── */}
                <div className="relative">
                  <label className={`${labelCls} ${!addForm.brand_id ? 'opacity-40' : ''}`}>
                    {labels.l2} <span className="text-red-500">*</span>
                    {addForm.brand_name && <span className="text-gray-400 font-normal normal-case ml-1">(within {addForm.brand_name})</span>}
                  </label>
                  <div
                    className={`${!addForm.brand_id ? 'opacity-40 cursor-not-allowed bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm' : addErrors.model ? inputErrCls : inputCls} flex items-center justify-between ${addForm.brand_id ? 'cursor-pointer' : ''}`}
                    onClick={() => { if (!addForm.brand_id) return; setModelDropOpen(p => !p); setBrandDropOpen(false); setVariantDropOpen(false); }}
                  >
                    <span className={addForm.model_name ? "text-gray-800" : "text-gray-400"}>
                      {!addForm.brand_id ? `Select ${labels.l1} first...` : addForm.model_name || `Search ${labels.l2}...`}
                    </span>
                    {addForm.model_id
                      ? <button onClick={(e) => { e.stopPropagation(); setAddForm(p => ({ ...p, model_id: null, model_name: '', variant_id: null, variant_name: '' })); setVariants([]); }} className="text-gray-400 hover:text-gray-600"><FaTimes size={11} /></button>
                      : <span className="text-gray-400 text-xs">▼</span>
                    }
                  </div>
                  {modelDropOpen && addForm.brand_id && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                        <FaSearch size={12} className="text-gray-400" />
                        <input
                          autoFocus
                          type="text"
                          placeholder={`Search ${labels.l2}...`}
                          value={modelSearch}
                          onChange={(e) => { setModelSearch(e.target.value); fetchModels(addForm.brand_id, e.target.value); }}
                          className="flex-1 text-sm outline-none bg-transparent"
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {loadingModels
                          ? <p className="text-xs text-gray-400 px-3 py-2">Loading...</p>
                          : models.length > 0
                            ? models.map(m => <div key={m.id} onClick={() => handleModelSelect(m)} className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer">{m.name}</div>)
                            : <p className="text-xs text-gray-400 px-3 py-2 italic">No results found</p>
                        }
                      </div>
                      <div className="border-t border-gray-100 px-3 py-2 flex items-center justify-between bg-amber-50">
                        <span className="text-xs text-gray-400">Not found?</span>
                        <button
                          onClick={() => setModelDropOpen(false)}
                          className="text-xs font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1"
                        >
                          <FaTag size={10} /> Submit name request
                        </button>
                      </div>
                    </div>
                  )}
                  {addErrors.model && <p className="text-xs text-red-500 mt-1">{labels.l2} is required.</p>}
                </div>

                {/* ── Variant dropdown ── */}
                <div className="relative">
                  <label className={`${labelCls} ${!addForm.model_id ? 'opacity-40' : ''}`}>
                    {labels.l3} <span className="text-red-500">*</span>
                    {addForm.model_name && <span className="text-gray-400 font-normal normal-case ml-1">(within {addForm.model_name})</span>}
                  </label>
                  <div
                    className={`${!addForm.model_id ? 'opacity-40 cursor-not-allowed bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm' : addErrors.variant ? inputErrCls : inputCls} flex items-center justify-between ${addForm.model_id ? 'cursor-pointer' : ''}`}
                    onClick={() => { if (!addForm.model_id) return; setVariantDropOpen(p => !p); setBrandDropOpen(false); setModelDropOpen(false); }}
                  >
                    <span className={addForm.variant_name ? "text-gray-800" : "text-gray-400"}>
                      {!addForm.model_id ? `Select ${labels.l2} first...` : addForm.variant_name || `Search ${labels.l3}...`}
                    </span>
                    {addForm.variant_id
                      ? <button onClick={(e) => { e.stopPropagation(); setAddForm(p => ({ ...p, variant_id: null, variant_name: '' })); }} className="text-gray-400 hover:text-gray-600"><FaTimes size={11} /></button>
                      : <span className="text-gray-400 text-xs">▼</span>
                    }
                  </div>
                  {variantDropOpen && addForm.model_id && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                        <FaSearch size={12} className="text-gray-400" />
                        <input
                          autoFocus
                          type="text"
                          placeholder={`Search ${labels.l3}...`}
                          value={variantSearch}
                          onChange={(e) => { setVariantSearch(e.target.value); fetchVariants(addForm.model_id, e.target.value); }}
                          className="flex-1 text-sm outline-none bg-transparent"
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {loadingVariants
                          ? <p className="text-xs text-gray-400 px-3 py-2">Loading...</p>
                          : variants.length > 0
                            ? variants.map(v => <div key={v.id} onClick={() => handleVariantSelect(v)} className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer">{v.name}</div>)
                            : <p className="text-xs text-gray-400 px-3 py-2 italic">No results found</p>
                        }
                      </div>
                      <div className="border-t border-gray-100 px-3 py-2 flex items-center justify-between bg-amber-50">
                        <span className="text-xs text-gray-400">Not found?</span>
                        <button
                          onClick={() => setVariantDropOpen(false)}
                          className="text-xs font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1"
                        >
                          <FaTag size={10} /> Submit name request
                        </button>
                      </div>
                    </div>
                  )}
                  {addErrors.variant && <p className="text-xs text-red-500 mt-1">{labels.l3} is required.</p>}
                </div>

                {/* ── Display name preview ── */}
                {addForm.brand_id && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <p className="text-xs text-blue-400 mb-0.5">Product name (generated)</p>
                    <p className="text-sm font-semibold text-blue-700">
                      {addForm.brand_name}
                      {addForm.variant_name
                        ? ` ${addForm.variant_name}`
                        : <span className="text-blue-300 font-normal italic"> — select {labels.l3} to complete</span>
                      }
                    </p>
                    {addForm.model_name && (
                      <p className="text-xs text-blue-300 mt-0.5">
                        {[categories.find(c => String(c.id) === String(addForm.category))?.name, addForm.brand_name, addForm.model_name, addForm.variant_name].filter(Boolean).join(' › ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Price / Stock / Status — dimmed until variant selected ── */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 ${!addForm.variant_id ? 'opacity-40 pointer-events-none' : ''}`}>
            <div>
              <label className={labelCls}>Price (TZS) <span className="text-red-500">*</span></label>
              <input
                type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0"
                value={addForm.price}
                onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); if (Number(val) > 999999999) return; setAddForm({ ...addForm, price: val }); setAddErrors(p => ({ ...p, price: false })); }}
                className={addErrors.price ? inputErrCls : inputCls}
              />
              {addErrors.price && <p className="text-xs text-red-500 mt-1">Price is required.</p>}
            </div>

            <div>
              {/* ── Stock type toggle — only for service categories ── */}
              {addForm.category_type === 'service' && (
                <div className="flex gap-3 mb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="stock_type" value="stock"
                      checked={addForm.stock_type === 'stock'}
                      onChange={() => setAddForm(p => ({ ...p, stock_type: 'stock' }))}
                      className="accent-blue-600"
                    />
                    <span className="text-xs text-gray-600">Stock (units)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="stock_type" value="capacity"
                      checked={addForm.stock_type === 'capacity'}
                      onChange={() => setAddForm(p => ({ ...p, stock_type: 'capacity' }))}
                      className="accent-blue-600"
                    />
                    <span className="text-xs text-gray-600">Capacity (per day)</span>
                  </label>
                </div>
              )}
              <label className={labelCls}>
                {getStockLabel(addForm.category_type, addForm.stock_type)} <span className="text-red-500">*</span>
              </label>
              <input
                type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0"
                value={addForm.stock}
                onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); if (Number(val) > 999999) return; setAddForm({ ...addForm, stock: val }); setAddErrors(p => ({ ...p, stock: false })); }}
                className={addErrors.stock ? inputErrCls : inputCls}
              />
              {addErrors.stock && <p className="text-xs text-red-500 mt-1">This field is required.</p>}
            </div>

            <div>
              <label className={labelCls}>Status</label>
              <select value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value })} className={inputCls}>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          {/* ── Description, Images, Specs, Submit — dimmed until variant selected ── */}
          <div className={!addForm.variant_id ? 'opacity-40 pointer-events-none' : ''}>

            {/* Description */}
            <div className="mb-4">
              <label className={labelCls}>Description</label>
              <textarea
                placeholder="Describe your product…"
                value={addForm.description}
                onChange={(e) => { setAddForm({ ...addForm, description: e.target.value.slice(0, 100) }); setAddErrors(p => ({ ...p, description: false })); }}
                className={inputCls} rows={3} maxLength={100}
              />
             <p className={`text-xs mt-1 text-right ${addForm.description.length >= 80 ? "text-red-400" : "text-gray-400"}`}>
                {addForm.description.length}/100
              </p>
              {addErrors.description && <p className="text-xs text-red-500 mt-1">Description is required.</p>}
            </div>

            {/* Images */}
            <div className="mb-4">
              <label className={labelCls}>Images <span className="text-red-500">*</span></label>
              <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 cursor-pointer transition ${addErrors.images ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"}`}>
                <FaUpload className={addErrors.images ? "text-red-400" : "text-gray-400"} size={20} />
                <span className="text-sm text-gray-500">Click to upload images</span>
                <span className="text-xs text-gray-400">PNG, JPG · up to 6 images</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleAddImageUpload} />
              </label>
              {addErrors.images && <p className="text-xs text-red-500 mt-1">At least one image is required.</p>}
              {addForm.images.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {addForm.images.map((url, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeAddImage(idx)} className="absolute top-0.5 right-0.5 bg-black bg-opacity-50 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                        <FaTimes size={8} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Specs */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className={labelCls}>Product Details</label>
                <button onClick={addAddSpec} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                  <FaPlus size={10} /> Add Detail
                </button>
              </div>
              {addForm.specs.length === 0 && (
                <p className="text-xs text-gray-400 italic mb-1">e.g. RAM: 4 GB, Storage: 256 GB</p>
              )}
              <div className="space-y-2">
                {addForm.specs.map((spec) => (
                  <div key={spec.id} className="grid grid-cols-[1fr_1fr_80px_auto] gap-2 items-center">
                    <input type="text" placeholder="Attribute (e.g. RAM)" value={spec.attribute} onChange={(e) => { updateAddSpec(spec.id, "attribute", e.target.value); if (e.target.value.length >= 10) setSpecLimitMsg("Max 10 characters allowed"); else setSpecLimitMsg(""); }} className={`${inputCls} flex-1`} maxLength={10} />
                    <input type="text" placeholder="Value (e.g. 4)" value={spec.value} onChange={(e) => { updateAddSpec(spec.id, "value", e.target.value); if (e.target.value.length >= 10) setSpecLimitMsg("Max 10 characters allowed"); else setSpecLimitMsg(""); }} className={`${inputCls} flex-1`} maxLength={10} />
                    <input type="text" placeholder="Unit" value={spec.unit} onChange={(e) => { updateAddSpec(spec.id, "unit", e.target.value); if (e.target.value.length >= 10) setSpecLimitMsg("Max 10 characters allowed"); else setSpecLimitMsg(""); }} className={`${inputCls} w-20`} maxLength={10} />
                    <button onClick={() => removeAddSpec(spec.id)} className="text-red-400 hover:text-red-600 flex-shrink-0"><FaTimes size={13} /></button>
                  </div>
                ))}
              </div>
            </div>
            {specLimitMsg && <p className="text-xs text-red-500 mt-1">{specLimitMsg}</p>}
            {addErrors.specs && <p className="text-xs text-red-500 mt-1">At least 3 product details are required (max 12).</p>}

            {/* Submit */}


            <div className="flex gap-3">
              <button
                onClick={handleAddProduct}
                disabled={saving || !addForm.variant_id}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Saving…</>
                ) : "Save Product"}
              </button>
              <button
                onClick={() => { setShowAddForm(false); setAddForm(emptyForm); setAddErrors({}); setBrands([]); setModels([]); setVariants([]); }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal — UNCHANGED ── */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4 scroll-pb-30">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[79vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <FaEdit className="text-blue-500" size={14} /> Edit Product
              </h3>
              <button onClick={() => { setEditingProduct(null); setImageLimitMsg(""); setEditSuccessMsg(""); }} className="text-gray-400 hover:text-gray-700">
                <FaTimes size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-3">
{/* Category */}
<div>
  <label className={labelCls}>Category <span className="text-red-500">*</span></label>
  <select
    value={editingProduct.category_id || ""}
    onChange={(e) => handleEditCategoryChange(e.target.value)}
    className={inputCls}
  >
    <option value="">Select category</option>
    {categories.map(cat => (
      <option key={cat.id} value={cat.id}>{cat.name}</option>
    ))}
  </select>
</div>

{/* Brand / Model / Variant — same cascade as Add Product */}
{editingProduct.category_id && (() => {
  const labels = getLabels(editingProduct.category_type || 'product');
  return (
    <div className="space-y-3">

      {/* Brand */}
      <div className="relative">
        <label className={labelCls}>{labels.l1} <span className="text-red-500">*</span></label>
        <div
          className={`${inputCls} flex items-center justify-between cursor-pointer`}
          onClick={() => { setEditBrandDropOpen(p => !p); setEditModelDropOpen(false); setEditVariantDropOpen(false); }}
        >
          <span className={editingProduct.brand_name ? "text-gray-800" : "text-gray-400"}>
            {editingProduct.brand_name || `Search ${labels.l1}...`}
          </span>
          {editingProduct.brand_id
            ? <button onClick={(e) => { e.stopPropagation(); setEditingProduct(p => ({ ...p, brand_id: null, brand_name: '', model_id: null, model_name: '', variant_id: null, variant_name: '', name: '' })); setEditModels([]); setEditVariants([]); }} className="text-gray-400 hover:text-gray-600"><FaTimes size={11}/></button>
            : <span className="text-gray-400 text-xs">▼</span>
          }
        </div>
        {editBrandDropOpen && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
              <FaSearch size={12} className="text-gray-400" />
              <input autoFocus type="text" placeholder={`Search ${labels.l1}...`}
                value={editBrandSearch}
                onChange={(e) => { setEditBrandSearch(e.target.value); fetchEditBrands(editingProduct.category_id, e.target.value); }}
                className="flex-1 text-sm outline-none bg-transparent"
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              {loadingEditBrands
                ? <p className="text-xs text-gray-400 px-3 py-2">Loading...</p>
                : editBrands.length > 0
                  ? editBrands.map(b => <div key={b.id} onClick={() => handleEditBrandSelect(b)} className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer">{b.name}</div>)
                  : <p className="text-xs text-gray-400 px-3 py-2 italic">No results</p>
              }
            </div>
          </div>
        )}
      </div>

      {/* Model */}
      <div className="relative">
        <label className={`${labelCls} ${!editingProduct.brand_id ? 'opacity-40' : ''}`}>{labels.l2} <span className="text-red-500">*</span></label>
        <div
          className={`${inputCls} flex items-center justify-between ${editingProduct.brand_id ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed bg-gray-50'}`}
          onClick={() => { if (!editingProduct.brand_id) return; setEditModelDropOpen(p => !p); setEditBrandDropOpen(false); setEditVariantDropOpen(false); }}
        >
          <span className={editingProduct.model_name ? "text-gray-800" : "text-gray-400"}>
            {!editingProduct.brand_id ? `Select ${labels.l1} first...` : editingProduct.model_name || `Search ${labels.l2}...`}
          </span>
          {editingProduct.model_id
            ? <button onClick={(e) => { e.stopPropagation(); setEditingProduct(p => ({ ...p, model_id: null, model_name: '', variant_id: null, variant_name: '' })); setEditVariants([]); }} className="text-gray-400 hover:text-gray-600"><FaTimes size={11}/></button>
            : <span className="text-gray-400 text-xs">▼</span>
          }
        </div>
        {editModelDropOpen && editingProduct.brand_id && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
              <FaSearch size={12} className="text-gray-400" />
              <input autoFocus type="text" placeholder={`Search ${labels.l2}...`}
                value={editModelSearch}
                onChange={(e) => { setEditModelSearch(e.target.value); fetchEditModels(editingProduct.brand_id, e.target.value); }}
                className="flex-1 text-sm outline-none bg-transparent"
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              {loadingEditModels
                ? <p className="text-xs text-gray-400 px-3 py-2">Loading...</p>
                : editModels.length > 0
                  ? editModels.map(m => <div key={m.id} onClick={() => handleEditModelSelect(m)} className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer">{m.name}</div>)
                  : <p className="text-xs text-gray-400 px-3 py-2 italic">No results</p>
              }
            </div>
          </div>
        )}
      </div>

      {/* Variant */}
      <div className="relative">
        <label className={`${labelCls} ${!editingProduct.model_id ? 'opacity-40' : ''}`}>{labels.l3} <span className="text-red-500">*</span></label>
        <div
          className={`${inputCls} flex items-center justify-between ${editingProduct.model_id ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed bg-gray-50'}`}
          onClick={() => { if (!editingProduct.model_id) return; setEditVariantDropOpen(p => !p); setEditBrandDropOpen(false); setEditModelDropOpen(false); }}
        >
          <span className={editingProduct.variant_name ? "text-gray-800" : "text-gray-400"}>
            {!editingProduct.model_id ? `Select ${labels.l2} first...` : editingProduct.variant_name || `Search ${labels.l3}...`}
          </span>
          {editingProduct.variant_id
            ? <button onClick={(e) => { e.stopPropagation(); setEditingProduct(p => ({ ...p, variant_id: null, variant_name: '', name: p.brand_name })); }} className="text-gray-400 hover:text-gray-600"><FaTimes size={11}/></button>
            : <span className="text-gray-400 text-xs">▼</span>
          }
        </div>
        {editVariantDropOpen && editingProduct.model_id && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
              <FaSearch size={12} className="text-gray-400" />
              <input autoFocus type="text" placeholder={`Search ${labels.l3}...`}
                value={editVariantSearch}
                onChange={(e) => { setEditVariantSearch(e.target.value); fetchEditVariants(editingProduct.model_id, e.target.value); }}
                className="flex-1 text-sm outline-none bg-transparent"
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              {loadingEditVariants
                ? <p className="text-xs text-gray-400 px-3 py-2">Loading...</p>
                : editVariants.length > 0
                  ? editVariants.map(v => <div key={v.id} onClick={() => handleEditVariantSelect(v)} className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer">{v.name}</div>)
                  : <p className="text-xs text-gray-400 px-3 py-2 italic">No results</p>
              }
            </div>
          </div>
        )}
      </div>

      {/* Generated name preview */}
      {editingProduct.brand_id && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          <p className="text-xs text-blue-400 mb-0.5">Product name (generated)</p>
          <p className="text-sm font-semibold text-blue-700">
            {editingProduct.brand_name}
            {editingProduct.variant_name
              ? ` ${editingProduct.variant_name}`
              : <span className="text-blue-300 font-normal italic"> — select {labels.l3} to complete</span>
            }
          </p>
        </div>
      )}
    </div>
  );
})()}
</div>
                <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Price (TZS)</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={editingProduct.price}
                    onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); handleEditChange("price", val); if (Number(val) > 999999999) return; }}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Stock</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" value={editingProduct.stock}
                    onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ''); handleEditChange("stock", val); if (Number(val) > 999999) return; }}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={editingProduct.status} onChange={(e) => handleEditChange("status", e.target.value)} className={inputCls}>
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea placeholder="Describe your product..." value={editingProduct.description} onChange={(e) => handleEditChange("description", e.target.value.slice(0, 100))} className={inputCls} rows={3} />
                <p className={`text-xs mt-1 text-right ${editingProduct.description.length >= 80 ? "text-red-400" : "text-green-500"}`}>
                  {editingProduct.description.length}/100
                </p>
              </div>

              <div>
                <label className={labelCls}>Images</label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 rounded-xl p-4 cursor-pointer transition">
                  <FaUpload className="text-gray-400" size={16} />
                  <span className="text-xs text-gray-500">Click to add more images</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleEditImageUpload} />
                </label>
                {imageLimitMsg && (
                  <div className="mt-3 flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <FaUpload className="text-orange-500" size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-orange-700 mb-0.5">Image Limit Reached</p>
                      <p className="text-xs text-orange-600">{imageLimitMsg}</p>
                    </div>
                    <button onClick={() => setImageLimitMsg("")} className="text-orange-400 hover:text-orange-600 flex-shrink-0">
                      <FaTimes size={12} />
                    </button>
                  </div>
                )}
                {editingProduct.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {editingProduct.images.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removeEditImage(idx)} className="absolute top-0.5 right-0.5 bg-black bg-opacity-50 text-white rounded-full w-4 h-4 flex items-center justify-center">
                          <FaTimes size={8} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls}>Product Details</label>
                  <button onClick={addEditSpec} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                    <FaPlus size={10} /> Add Detail
                  </button>
                </div>
                {editingProduct.specs.length === 0 && <p className="text-xs text-gray-400 italic">No details yet.</p>}
                <div className="space-y-2">
                  {editingProduct.specs.map((spec) => (
                    <div key={spec.id} className="flex gap-2">
                      <input type="text" placeholder="Attribute" value={spec.attribute} onChange={(e) => { handleSpecChange(spec.id, "attribute", e.target.value); if (e.target.value.length >= 10) setSpecLimitMsg("Max 10 characters allowed"); else setSpecLimitMsg(""); }} className={`${inputCls} flex`} maxLength={10} />
                      <input type="text" placeholder="Value" value={spec.value} onChange={(e) => { handleSpecChange(spec.id, "value", e.target.value); if (e.target.value.length >= 10) setSpecLimitMsg("Max 10 characters allowed"); else setSpecLimitMsg(""); }} className={`${inputCls} flex`} maxLength={10} />
                      <input type="text" placeholder="Unit" value={spec.unit} onChange={(e) => { handleSpecChange(spec.id, "unit", e.target.value); if (e.target.value.length >= 10) setSpecLimitMsg("Max 10 characters allowed"); else setSpecLimitMsg(""); }} className={`${inputCls} flex`} maxLength={10} />
                      <button onClick={() => removeEditSpec(spec.id)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                        <FaTimes size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            {specLimitMsg && <p className="text-xs text-red-500 mt-1">{specLimitMsg}</p>}
            {addErrors.specs && <p className="text-xs text-red-500 mt-1">At least 3 product details are required (max 12).</p>}

            </div>

            {editSuccessMsg && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-2xl border border-green-200 px-8 py-8 flex flex-col items-center justify-center gap-3 text-center max-w-xs w-full">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <FiCheckCircle size={36} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-green-700">Product Updated!</p>
                    <p className="text-xs text-green-500 mt-1">Changes saved successfully. Closing...</p>
                  </div>
                </div>
              </div>
            )}

            <div className="px-5 flex gap-3" style={{ paddingBottom: "max(1.25rem, calc(env(safe-area-inset-bottom) + 1.25rem))" }}>
              <button onClick={saveEdit} disabled={saving} className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-70 flex items-center justify-center gap-2">
                {saving ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Saving…</>
                ) : "Save Changes"}
              </button>
              <button onClick={() => { setEditingProduct(null); setImageLimitMsg(""); setEditSuccessMsg(""); }} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Products Grid — UNCHANGED except ⚠ banner for old products ── */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
          <FaBox size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-base font-semibold">No products found</p>
          <p className="text-sm mt-1">
            {products.length === 0 ? 'Click "Add Product" to get started.' : "Try adjusting your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            if (!product || !product.id) return null;
            const remaining = daysRemaining(product.listingDate || product.createdDate || new Date());
            const elapsed = daysElapsed(product.listingDate || product.createdDate || new Date());
            const isLowDays = remaining <= 10;
            const isExpired = remaining === 0;
            const isLowStock = product.stock <= 5;
            const currentImageIndex = imageIndexes[product.id] || 0;

            return (
              <div key={product.id} className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden border border-gray-100 flex flex-col">
                {/* Image area */}
                <div className="relative h-44 bg-gray-100 group">
                  {(product.images || []).length > 0 ? (
                    <img
                      src={(() => { const r = product.images[currentImageIndex]; return typeof r === 'object' ? (r.thumb_webp || r.image_url) : r; })()}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FaBox size={36} />
                    </div>
                  )}

                  {/* Status badge */}
                  <span className={`absolute top-2 left-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${product.status === "Available" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {product.status}
                  </span>

                  {/* Days badge */}
                  <span className={`absolute top-2 right-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${isExpired ? "bg-red-200 text-red-700" : isLowDays ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                    {isExpired ? "Expired" : `${remaining}days left`}
                  </span>

                  {/* ── NEW: ⚠ needs update banner for old products without brand_id ── */}
                    {(!product.brand_id || !product.model_id || !product.variant_id) && (
                      <button
                        onClick={() => openEdit(product)}
                        className="absolute bottom-0 left-0 right-0 bg-amber-500 bg-opacity-90 text-white text-xs font-semibold px-2 py-1 flex items-center gap-1 hover:bg-amber-600 transition w-full"
                      >
                        <span>⚠</span> Tap to update naming
                      </button>
                    )}
                  {/* Image carousel nav */}
                  {(product.images || []).length > 1 && (
                    <>
                      <button onClick={() => prevImage(product.id)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <FaChevronLeft size={11} />
                      </button>
                      <button onClick={() => nextImage(product.id)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <FaChevronRight size={11} />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {product.images.map((_, idx) => (
                          <div key={idx} className={`w-1.5 h-1.5 rounded-full transition ${idx === currentImageIndex ? "bg-white" : "bg-white bg-opacity-50"}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Card body — UNCHANGED */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-2">
                    <h4 className="font-bold text-gray-800 text-sm leading-tight">{product.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                  </div>

                  {product.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-blue-500 font-medium">Price</p>
                      <p className="text-sm font-bold text-blue-700">{(product.price || 0).toLocaleString()}</p>
                      <p className="text-xs text-blue-400">TZS</p>
                    </div>
                    <div className={`rounded-lg p-2 text-center ${isLowStock ? "bg-yellow-50" : "bg-green-50"}`}>
                      <p className={`text-xs font-medium ${isLowStock ? "text-yellow-500" : "text-green-500"}`}>
                        {product.stock_type === 'capacity' ? 'Capacity' : 'Stock'}
                      </p>
                      <p className={`text-sm font-bold ${isLowStock ? "text-yellow-700" : "text-green-700"}`}>{product.stock || 0}</p>
                      <p className={`text-xs ${isLowStock ? "text-yellow-400" : "text-green-400"}`}>
                        {product.stock_type === 'capacity' ? 'per day' : 'units'}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Listing timer</span>
                      <span>{elapsed} / 90 days</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${isExpired ? "bg-red-500" : isLowDays ? "bg-orange-400" : "bg-blue-400"}`}
                        style={{ width: `${Math.min(100, (elapsed / 90) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {Array.isArray(product.specs) && product.specs.length > 0 && (
                    <div className="border-t border-gray-100 pt-2 mb-3">
                      <div className="grid grid-cols-3 gap-1 mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Attribute</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Value</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Unit</span>
                      </div>
                      <div className="space-y-1">
                        {product.specs.map((spec) => (
                          <div key={spec.id} className="grid grid-cols-3 gap-1 text-xs">
                            <span className="text-gray-500 font-medium">{spec.attribute}</span>
                            <span className="text-gray-700">{spec.value}</span>
                            <span className="text-gray-700">{spec.unit || "—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-2 border-t border-gray-100 space-y-2">
                    <button onClick={() => handleRenew(product.id)} className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition text-xs font-semibold">
                      <FaRedo size={11} /> Update Listing (Reset Timer)
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(product)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition text-xs font-semibold">
                        <FaEdit size={12} /> Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(product.id)}
                        disabled={deleting === product.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition text-xs font-semibold disabled:opacity-70"
                      >
                        {deleting === product.id ? (
                          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                        ) : (
                          <><FaTrash size={12} /> Delete</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete Confirmation — UNCHANGED ── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <FaTrash className="text-red-500" size={18} />
              </div>
              <h3 className="font-bold text-gray-800 text-base">Delete Product?</h3>
              <p className="text-sm text-gray-500">
                This will permanently remove the product and all its images. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(confirmDelete)}
                disabled={deleting === confirmDelete}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition text-sm font-medium disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {deleting === confirmDelete ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Deleting…</>
                ) : (
                  <><FaTrash size={12} /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
