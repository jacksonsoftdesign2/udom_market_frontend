import { useState, useEffect, useCallback } from "react";
import ManagerLayout from "./ManagerLayout";
import { API } from "../../api";
import {
  FiPlus, FiEdit2, FiTrash2, FiImage, FiX, FiEye, FiEyeOff, FiUpload
} from "react-icons/fi";

const token = () => localStorage.getItem("token");

export default function ManagerAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [galleryAdId, setGalleryAdId] = useState(null); // which ad's gallery modal is open

  const emptyForm = {
    line1_text: "", line1_color: "#D85A30",
    line2_text: "", line2_color: "#185FA5",
    description: "", location: "", start_date: "", end_date: "",
    link_url: "", display_order: 0, priority_weight: 1, is_active: true,
  };
  const [form, setForm] = useState(emptyForm);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const fetchAds = useCallback(async () => {
    try {
      const res = await fetch(`${API}/advertisements`, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await res.json();
      setAds(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  const openCreateForm = () => {
    setForm(emptyForm);
    setIconFile(null);
    setIconPreview(null);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (ad) => {
    setForm({
      line1_text: ad.line1_text || "", line1_color: ad.line1_color || "#D85A30",
      line2_text: ad.line2_text || "", line2_color: ad.line2_color || "#185FA5",
      description: ad.description || "", location: ad.location || "",
      start_date: ad.start_date ? ad.start_date.slice(0, 10) : "",
      end_date: ad.end_date ? ad.end_date.slice(0, 10) : "",
      link_url: ad.link_url || "", display_order: ad.display_order || 0,
      priority_weight: ad.priority_weight || 1, is_active: ad.is_active,
    });
    setIconFile(null);
    setIconPreview(ad.icon_url);
    setEditingId(ad.id);
    setShowForm(true);
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.line1_text || !form.line1_color) {
      return showMsg("error", "Line 1 text and color are required");
    }
    if (!editingId && !iconFile) {
      return showMsg("error", "Icon image is required");
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => fd.append(key, val));
      if (iconFile) fd.append("icon", iconFile);

      const url = editingId ? `${API}/advertisements/${editingId}` : `${API}/advertisements`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);

      showMsg("success", editingId ? "Advertisement updated" : "Advertisement created");
      setShowForm(false);
      fetchAds();
    } catch (err) {
      showMsg("error", "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this advertisement? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API}/advertisements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      showMsg("success", "Advertisement deleted");
      fetchAds();
    } catch {
      showMsg("error", "Network error");
    }
  };

  const toggleActive = async (ad) => {
    try {
      const fd = new FormData();
      Object.entries({ ...ad, is_active: !ad.is_active }).forEach(([key, val]) => {
        if (val !== null && val !== undefined) fd.append(key, val);
      });
      const res = await fetch(`${API}/advertisements/${ad.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      showMsg("success", ad.is_active ? "Advertisement hidden" : "Advertisement shown");
      fetchAds();
    } catch {
      showMsg("error", "Network error");
    }
  };

  return (
    <ManagerLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Advertisements</h1>
          <p className="text-gray-500 text-sm mt-1">Manage the scrolling promo strip on the homepage</p>
        </div>
        <button onClick={openCreateForm}
          className="flex items-center gap-2 px-4 py-2 rounded-[4px] text-sm font-medium text-white"
          style={{ background: "#1a3a8f" }}>
          <FiPlus size={15} /> New Ad
        </button>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-[4px] text-sm font-medium border
          ${message.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-[4px] h-28 animate-pulse border border-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ads.map(ad => (
            <div key={ad.id} className="bg-white border border-gray-100 rounded-[4px] p-4">
              <div className="flex items-start gap-3 mb-3">
                <img src={ad.icon_url} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium truncate" style={{ color: ad.line1_color, textShadow: "1px 1px 0 rgba(0,0,0,0.1)" }}>
                    {ad.line1_text}
                  </p>
                  {ad.line2_text && (
                    <p className="text-xs truncate" style={{ color: ad.line2_color }}>{ad.line2_text}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-[4px] font-medium flex-shrink-0
                  ${ad.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                  {ad.is_active ? "Live" : "Hidden"}
                </span>
              </div>

              {ad.location && <p className="text-xs text-gray-400 mb-1">📍 {ad.location}</p>}
              {(ad.start_date || ad.end_date) && (
                <p className="text-xs text-gray-400 mb-2">
                  {ad.start_date?.slice(0,10)} — {ad.end_date?.slice(0,10) || "No end"}
                </p>
              )}
              <p className="text-xs text-gray-400 mb-3">Priority weight: {ad.priority_weight}</p>

              <div className="flex gap-2 flex-wrap">
                <button onClick={() => openEditForm(ad)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-[4px] text-xs font-medium text-[#1a3a8f] border border-[#1a3a8f]/20 hover:bg-[#e8edf7] transition">
                  <FiEdit2 size={12} /> Edit
                </button>
                <button onClick={() => setGalleryAdId(ad.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-[4px] text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition">
                  <FiImage size={12} /> Gallery
                </button>
                <button onClick={() => toggleActive(ad)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-[4px] text-xs font-medium text-amber-600 border border-amber-200 hover:bg-amber-50 transition">
                  {ad.is_active ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                  {ad.is_active ? "Hide" : "Show"}
                </button>
                <button onClick={() => handleDelete(ad.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-[4px] text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition">
                  <FiTrash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
          {ads.length === 0 && <p className="text-sm text-gray-400 col-span-2">No advertisements yet. Create your first one!</p>}
        </div>
      )}

      {/* ── Create/Edit form modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-[4px] w-full max-w-lg my-8">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100"
              style={{ background: "#1a3a8f" }}>
              <h2 className="text-white font-semibold text-sm">{editingId ? "Edit Advertisement" : "New Advertisement"}</h2>
              <button onClick={() => setShowForm(false)} className="text-blue-200 hover:text-white">
                <FiX size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Icon upload */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">Icon / Logo *</label>
                <div className="flex items-center gap-3">
                  {iconPreview ? (
                    <img src={iconPreview} alt="" className="w-14 h-14 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <FiImage size={20} />
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-3 py-2 rounded-[4px] text-xs font-medium text-[#1a3a8f] border border-[#1a3a8f]/20 cursor-pointer hover:bg-[#e8edf7] transition">
                    <FiUpload size={13} /> Choose Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleIconChange} />
                  </label>
                </div>
              </div>

              {/* Line 1 */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Line 1 Text *</label>
                  <input type="text" maxLength={30} value={form.line1_text}
                    onChange={e => setForm(f => ({ ...f, line1_text: e.target.value }))}
                    className="w-full border border-gray-200 rounded-[4px] px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Color</label>
                  <input type="color" value={form.line1_color}
                    onChange={e => setForm(f => ({ ...f, line1_color: e.target.value }))}
                    className="w-full h-[38px] border border-gray-200 rounded-[4px] cursor-pointer" />
                </div>
              </div>

              {/* Line 2 */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Line 2 Text (optional)</label>
                  <input type="text" maxLength={40} value={form.line2_text}
                    onChange={e => setForm(f => ({ ...f, line2_text: e.target.value }))}
                    className="w-full border border-gray-200 rounded-[4px] px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Color</label>
                  <input type="color" value={form.line2_color}
                    onChange={e => setForm(f => ({ ...f, line2_color: e.target.value }))}
                    className="w-full h-[38px] border border-gray-200 rounded-[4px] cursor-pointer" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Description</label>
                <textarea rows={3} value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-[4px] px-3 py-2 text-sm resize-none" />
              </div>

              {/* Location */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Location</label>
                <input type="text" value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Dodoma, UDOM Campus"
                  className="w-full border border-gray-200 rounded-[4px] px-3 py-2 text-sm" />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Start Date</label>
                  <input type="date" value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-[4px] px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">End Date / Expiry</label>
                  <input type="date" value={form.end_date}
                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-[4px] px-3 py-2 text-sm" />
                </div>
              </div>

              {/* Link URL */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">CTA Link (optional)</label>
                <input type="text" value={form.link_url}
                  onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-[4px] px-3 py-2 text-sm" />
              </div>

              {/* Priority weight + display order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Priority Weight</label>
                  <input type="number" min={1} value={form.priority_weight}
                    onChange={e => setForm(f => ({ ...f, priority_weight: parseInt(e.target.value) || 1 }))}
                    className="w-full border border-gray-200 rounded-[4px] px-3 py-2 text-sm" />
                  <p className="text-[10px] text-gray-400 mt-1">Higher = shown more often</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Display Order</label>
                  <input type="number" min={0} value={form.display_order}
                    onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-200 rounded-[4px] px-3 py-2 text-sm" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-2.5 rounded-[4px] text-sm font-medium text-white disabled:opacity-50"
                style={{ background: "#1a3a8f" }}>
                {submitting ? "Saving..." : editingId ? "Save Changes" : "Create Advertisement"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-[4px] text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Gallery modal ── */}
      {galleryAdId && (
        <GalleryModal adId={galleryAdId} onClose={() => setGalleryAdId(null)} showMsg={showMsg} />
      )}
    </ManagerLayout>
  );
}

// ── Gallery sub-component ──────────────────────────────────────────────
function GalleryModal({ adId, onClose, showMsg }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch(`${API}/advertisements/${adId}`);
      const data = await res.json();
      setImages(data.images || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [adId]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("display_order", images.length);
      const res = await fetch(`${API}/advertisements/${adId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      fetchImages();
    } catch {
      showMsg("error", "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      const res = await fetch(`${API}/advertisements/images/${imageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      fetchImages();
    } catch {
      showMsg("error", "Delete failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-[4px] w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100" style={{ background: "#1a3a8f" }}>
          <h2 className="text-white font-semibold text-sm">Gallery Images</h2>
          <button onClick={onClose} className="text-blue-200 hover:text-white"><FiX size={18} /></button>
        </div>

        <div className="p-5">
          <label className="flex items-center justify-center gap-2 py-3 rounded-[4px] text-sm font-medium text-[#1a3a8f] border-2 border-dashed border-[#1a3a8f]/30 cursor-pointer hover:bg-[#e8edf7] transition mb-4">
            <FiUpload size={15} /> {uploading ? "Uploading..." : "Add Image"}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>

          {loading ? (
            <p className="text-sm text-gray-400 text-center">Loading...</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {images.map(img => (
                <div key={img.id} className="relative group">
                  <img src={img.image_url} alt="" className="w-full h-20 object-cover rounded-[4px] border border-gray-100" />
                  <button onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">
                    <FiX size={11} />
                  </button>
                </div>
              ))}
              {images.length === 0 && <p className="text-xs text-gray-400 col-span-3 text-center py-4">No images yet</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}