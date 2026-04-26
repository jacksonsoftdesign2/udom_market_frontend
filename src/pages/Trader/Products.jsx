import{ API } from "../../api";

import { useState, useEffect } from "react";
import {
  FaBox, FaEdit, FaTrash, FaPlus, FaSearch,
  FaChevronLeft, FaChevronRight, FaTimes, FaRedo, FaUpload,
} from "react-icons/fa";
//fetching categories from backend to populate category options in add/edit forms will be done in the future, for now it's just a free text input

// ── helpers ────────────────────────────────────────────────────────────────

const emptyForm = {
  name: "", price: "", stock: "", category: "",
  status: "Available", description: "", images: [], imageFiles: [], specs: [],
};

const newSpec = () => ({ id: Date.now() + Math.random(), attribute: "", value: "", unit: "" });

/** Days elapsed since a given date (always positive) */
const daysElapsed = (date) =>
  Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));

/** Days remaining out of 90, floored at 0 */
const daysRemaining = (date) => Math.max(0, 90 - daysElapsed(date));

// ── component ──────────────────────────────────────────────────────────────

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

// use effect to fetch categories from backend in the future, for now it's just an empty array
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

  useEffect(() => {
  const id = setInterval(() => setTick((t) => t + 1), 60_000);
  return () => clearInterval(id);
}, []);

  // Auto-slide images every second
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
   // console.log('API response:', data);

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

  // ── add product ─────────────────────────────────────────────────────────

  const validateAdd = () => {
    const errors = {};
    if (!addForm.name.trim()) errors.name = true;
    if (!addForm.category.trim()) errors.category = true;
    if (!addForm.price) errors.price = true;
    if (!addForm.stock) errors.stock = true;
    if (addForm.images.length === 0) errors.images = true;
    return errors;
  };


const handleAddProduct = async () => {
    const errors = validateAdd();
    if (Object.keys(errors).length > 0) { setAddErrors(errors); return; }

    const data = new FormData();
    data.append('name',        addForm.name.trim());
    data.append('description', addForm.description);
    data.append('price',       addForm.price);
    data.append('stock',       addForm.stock);
    data.append('category_id', addForm.category.trim());
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

  const removeAddImage = (idx) => {
    setAddForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
      imageFiles: prev.imageFiles.filter((_, i) => i !== idx),
    }));
  };

  // Add-form spec helpers
  const addAddSpec = () =>
    setAddForm((prev) => ({ ...prev, specs: [...prev.specs, newSpec()] }));

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
    });
  };

  const handleEditChange = (field, value) =>
    setEditingProduct((prev) => ({ ...prev, [field]: value }));

const handleEditImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((f) => URL.createObjectURL(f));
    
    const currentTotal = editingProduct.images.length + files.length;
    if (currentTotal > 6) {
        alert('Maximum 6 images allowed');
        return;
    }
    
    setEditingProduct((prev) => ({
        ...prev,
        images: [...prev.images, ...urls], // blob URLs just for preview
        newImageFiles: [...(prev.newImageFiles || []), ...files], // actual files for upload
    }));
    e.target.value = "";
};

  const removeEditImage = (idx) => {
    setEditingProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
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

;
    
const saveEdit = async () => {
  
    const data = new FormData();
    data.append('name',        editingProduct.name);
    data.append('description', editingProduct.description);
    data.append('price',       editingProduct.price);
    data.append('stock',       editingProduct.stock);
    data.append('category_id', editingProduct.category_id || editingProduct.category);
    data.append('status',      editingProduct.status);
    data.append('specs',       JSON.stringify(editingProduct.specs));

    // ✅ Only send actual files (new uploads)
    (editingProduct.newImageFiles || []).forEach(file => data.append('images', file));

    // ✅ Only send existing http URLs as remaining (not blob URLs)
   const remainingUrls = (editingProduct.images || []).filter(url => 
    typeof url === 'string' && (url.startsWith('http') || url.startsWith('https'))
);
    console.log('remainingUrls:', remainingUrls);
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

      // ✅ Properly map result back to state
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...result.product,
        listingDate: result.product.listing_date,
        createdDate: result.product.created_at,
        specs: result.product.specs
          ? (typeof result.product.specs === 'string'
              ? JSON.parse(result.product.specs)
              : result.product.specs)
          : [],
        images: result.product.images || [],
      } : p));

      setEditingProduct(null);
      setSuccessMsg("Product updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
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
  // ── styles ────────────────────────────────────────────────────────────────

  const inputCls =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";
  const inputErrCls =
    "w-full px-3 py-2 border border-red-400 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400 bg-white";
  const labelCls =
    "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide";

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FaBox className="text-blue-600" />
          My Products
          <span className="text-sm font-normal text-gray-400">({products.length})</span>
        </h2>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setAddForm(emptyForm); setAddErrors({}); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium w-full sm:w-auto justify-center"
        >
          <FaPlus size={13} />
          Add Product
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
  <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-sm animate-fade-in">
    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <p className="text-sm font-medium">{successMsg}</p>
  </div>
)}

      {/* ── Add Form ── */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow border border-blue-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaPlus className="text-blue-500" size={14} /> New Product
          </h3>

          {/* Basic fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Product name"
                value={addForm.name}
                onChange={(e) => { setAddForm({ ...addForm, name: e.target.value }); setAddErrors((p) => ({ ...p, name: false })); }}
                className={addErrors.name ? inputErrCls : inputCls}
              />
              {addErrors.name && <p className="text-xs text-red-500 mt-1">Name is required.</p>}
            </div>
            <div>
              <label className={labelCls}>
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={addForm.category}
                onChange={(e)=>{
                  setAddForm({ ...addForm, category: e.target.value });
                  setAddErrors((p) => ({ ...p, category: false }));
                }}
                className={addErrors.category ? inputErrCls : inputCls}
              >
                <option value="">Select category</option>
                {categories.map(cat=>(
                  <option key={cat.id} value={cat.id}>{cat.name}
                  </option>
                ))}
              </select>
              {addErrors.category && <p className="text-xs text-red-500 mt-1">Category is required.</p>}
            </div>
            <div>
          <label className={labelCls}>
  Price (TZS) <span className="text-red-500">*</span>
</label>
<input
  type="text"
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="0"
  value={addForm.price}
  onChange={(e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (Number(val) > 999999999) return; // prevent excessively large numbers
    setAddForm({ ...addForm, price: val });
    setAddErrors((p) => ({ ...p, price: false }));
  }}
  className={addErrors.price ? inputErrCls : inputCls}
/>
              {addErrors.price && <p className="text-xs text-red-500 mt-1">Price is required.</p>}
            </div>
            <div>
              <label className={labelCls}>
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0"
                value={addForm.stock}
              onChange={(e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (Number(val) > 999999) return; // prevent excessively large numbers
    setAddForm({ ...addForm, stock: val });
    setAddErrors((p) => ({ ...p, stock: false }));
  }}
  className={addErrors.stock ? inputErrCls : inputCls}
/>
              {addErrors.stock && <p className="text-xs text-red-500 mt-1">Stock is required.</p>}
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                value={addForm.status}
                onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                className={inputCls}
              >
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className={labelCls}>Description</label>
           <textarea
          placeholder="Describe your product…"
          value={addForm.description}
          onChange={(e) => setAddForm({ ...addForm, description: e.target.value.slice(0, 100) })}
          className={inputCls}
          rows={3}
          maxLength={100}
        />
        <p className={`text-xs mt-1 text-right ${addForm.description.length >= 80 ? "text-red-400" : "text-gray-400"}`}>
          {addForm.description.length}/100
        </p>
          </div>

          {/* Images — required */}
          <div className="mb-4">
            <label className={labelCls}>
              Images <span className="text-red-500">*</span>
            </label>
            <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 cursor-pointer transition ${addErrors.images ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"}`}>
              <FaUpload className={addErrors.images ? "text-red-400" : "text-gray-400"} size={20} />
              <span className="text-sm text-gray-500">Click to upload images</span>
              <span className="text-xs text-gray-400">PNG, JPG · up to 6 images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleAddImageUpload}
              />
            </label>
            {addErrors.images && <p className="text-xs text-red-500 mt-1">At least one image is required.</p>}
            {addForm.images.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {addForm.images.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeAddImage(idx)}
                      className="absolute top-0.5 right-0.5 bg-black bg-opacity-50 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
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
              <button
                onClick={addAddSpec}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <FaPlus size={10} /> Add Detail
              </button>
            </div>
            {addForm.specs.length === 0 && (
              <p className="text-xs text-gray-400 italic mb-1">e.g. RAM: 4 GB, Storage: 256 GB</p>
            )}
            <div className="space-y-2">
              {addForm.specs.map((spec) => (
            <div key={spec.id} className="grid grid-cols-[1fr_1fr_80px_auto] gap-2 items-center">
                <input
  type="text"
  placeholder="Attribute (e.g. RAM)"
  value={spec.attribute}
  onChange={(e) => { updateAddSpec(spec.id, "attribute", e.target.value); if (e.target.value.length >= 10) setSpecLimitMsg("Max 10 characters allowed"); else setSpecLimitMsg(""); }}
  className={`${inputCls} flex-1`}
  maxLength={10}
/>
<input
  type="text"
  placeholder="Value (e.g. 4)"
  value={spec.value}
  onChange={(e) => { updateAddSpec(spec.id, "value", e.target.value); if (e.target.value.length >= 10) setSpecLimitMsg("Max 10 characters allowed"); else setSpecLimitMsg(""); }}
  className={`${inputCls} flex-1`}
  maxLength={10}
/>
<input
  type="text"
  placeholder="Unit"
  value={spec.unit}
  onChange={(e) => { updateAddSpec(spec.id, "unit", e.target.value); if (e.target.value.length >= 10) setSpecLimitMsg("Max 10 characters allowed"); else setSpecLimitMsg(""); }}
  className={`${inputCls} w-20`}
  maxLength={10}
/>
                  <button
                    onClick={() => removeAddSpec(spec.id)}
                    className="text-red-400 hover:text-red-600 flex-shrink-0"
                  >
                    <FaTimes size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          {specLimitMsg && <p className="text-xs text-red-500 mt-1">{specLimitMsg}</p>}

          {/* Submit */}
          <div className="flex gap-3">
            <button
  onClick={handleAddProduct}
  disabled={saving}
  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-70 flex items-center justify-center gap-2"
>
  {saving ? (
    <>
      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      Saving…
    </>
  ) : "Save Product"}
</button>
            <button
              onClick={() => { setShowAddForm(false); setAddForm(emptyForm); setAddErrors({}); }}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingProduct && (
       <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4 scroll-pb-30">
  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[79vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                <FaEdit className="text-blue-500" size={14} /> Edit Product
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-700">
                <FaTimes size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Basic fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Product Name</label>
                  <input type="text" value={editingProduct.name} onChange={(e) => handleEditChange("name", e.target.value)} className={inputCls} />
                </div>
                <div>
  <label className={labelCls}>Category</label>
  <select
    value={editingProduct.category_id || ""}
    onChange={(e) => handleEditChange("category_id", e.target.value)}
    className={inputCls}
  >
    <option value="">Select category</option>
    {categories.map(cat => (
      <option key={cat.id} value={cat.id}>{cat.name}</option>
    ))}
  </select>
</div>
                <div>
                 <label className={labelCls}>Price (TZS)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  value={editingProduct.price}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    handleEditChange("price", val);
                    if (Number(val) > 999999999) return; // prevent excessively large numbers
                  }}
                  className={inputCls}
                />
                </div>
                <div>
                 <label className={labelCls}>Stock</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  value={editingProduct.stock}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    handleEditChange("stock", val);
                    if (Number(val) > 999999) return; // prevent excessively large numbers
                  }}
                  className={inputCls}
                />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={editingProduct.status} onChange={(e) => handleEditChange("status", e.target.value)} className={inputCls}>
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>Description</label>
                <textarea 
                placeholder="Describe your product..."
                value={editingProduct.description}
                onChange={(e) => handleEditChange("description", e.target.value.slice(0,100))} 
                className={inputCls} 
                rows={3} />
                <p className={`text-xs mt-1 text-right ${editingProduct.description.length >=80 ? "text-red-400" : "text-green-500"}`}>
              {editingProduct.description.length}/100
            </p>
              </div>

              {/* Images */}
              <div>
                <label className={labelCls}>Images</label>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 rounded-xl p-4 cursor-pointer transition">
                  <FaUpload className="text-gray-400" size={16} />
                  <span className="text-xs text-gray-500">Click to add more images</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleEditImageUpload} />
                </label>
                {editingProduct.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {editingProduct.images.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeEditImage(idx)}
                          className="absolute top-0.5 right-0.5 bg-black bg-opacity-50 text-white rounded-full w-4 h-4 flex items-center justify-center"
                        >
                          <FaTimes size={8} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Specs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelCls}>Product Details</label>
                  <button onClick={addEditSpec} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                    <FaPlus size={10} /> Add Detail
                  </button>
                </div>
                {editingProduct.specs.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No details yet.</p>
                )}
                <div className="space-y-2">
                  {editingProduct.specs.map((spec) => (
                    <div key={spec.id} className="flex gap-2 ite">
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
            </div>

            <div className="px-5 flex gap-3" style={{ paddingBottom: "max(1.25rem, calc(env(safe-area-inset-bottom) + 1.25rem))" }}>
              <button
  onClick={saveEdit}
  disabled={saving}
  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-70 flex items-center justify-center gap-2"
>
  {saving ? (
    <>
      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      Saving…
    </>
  ) : "Save Changes"}
</button>
              <button onClick={() => setEditingProduct(null)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Products Grid ── */}
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
            if (!product || !product.id) return null; // skip invalid products
            const remaining = daysRemaining(product.listingDate || product.createdDate || new Date());
            const elapsed = daysElapsed(product.listingDate || product.createdDate || new Date());
            const isLowDays = remaining <= 10;
            const isExpired = remaining === 0;
            const isLowStock = product.stock <= 5;
            const currentImageIndex = imageIndexes[product.id] || 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden border border-gray-100 flex flex-col"
              >
                {/* Image area */}
                <div className="relative h-44 bg-gray-100 group">
                  {(product.images || []).length > 0 ? (
                    <img
                      src={product.images[currentImageIndex]}
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

                  {/* Image carousel nav */}
                  {(product.images|| []).length > 1 && (
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

                {/* Card body */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-2">
                    <h4 className="font-bold text-gray-800 text-sm leading-tight">{product.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                  </div>

                  {product.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                  )}

                  {/* Price / Stock stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-blue-500 font-medium">Price</p>
                      <p className="text-sm font-bold text-blue-700">{(product.price || 0) .toLocaleString()}</p>
                      <p className="text-xs text-blue-400">TZS</p>
                    </div>
                    <div className={`rounded-lg p-2 text-center ${isLowStock ? "bg-yellow-50" : "bg-green-50"}`}>
                      <p className={`text-xs font-medium ${isLowStock ? "text-yellow-500" : "text-green-500"}`}>Stock</p>
                      <p className={`text-sm font-bold ${isLowStock ? "text-yellow-700" : "text-green-700"}`}>{product.stock || 0}</p>
                      <p className={`text-xs ${isLowStock ? "text-yellow-400" : "text-green-400"}`}>units</p>
                    </div>
                  </div>

                  {/* Timer bar */}
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

                  {/* Specs */}
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

                  {/* Actions */}
                  <div className="mt-auto pt-2 border-t border-gray-100 space-y-2">
                    {/* Renew button — resets 90-day timer */}
                    <button
                      onClick={() => handleRenew(product.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition text-xs font-semibold"
                    >
                      <FaRedo size={11} /> Update Listing (Reset Timer)
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition text-xs font-semibold"
                      >
                        <FaEdit size={12} /> Edit
                      </button>
                      
<button
  onClick={() => setConfirmDelete(product.id)}
  disabled={deleting === product.id}
  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition text-xs font-semibold disabled:opacity-70"
>
  {deleting === product.id ? (
    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
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

      {/* ── Delete Confirmation Card ── */}
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
        <button
          onClick={() => setConfirmDelete(null)}
          className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={() => handleDeleteProduct(confirmDelete)}
          disabled={deleting === confirmDelete}
          className="flex-1 bg-red-500 text-white py-2.5 rounded-lg hover:bg-red-600 transition text-sm font-medium disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {deleting === confirmDelete ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Deleting…
            </>
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
