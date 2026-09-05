import { useState, useEffect } from "react";
import { FiMapPin, FiX, FiPlus, FiTrash2, FiGlobe } from "react-icons/fi";

const API = import.meta.env.VITE_API_URL;

export default function ProductVisibilityModal({ product, onClose, onSaved }) {
  const [regions, setRegions] = useState([]);
  const [targets, setTargets] = useState([]); // [{ region_id, district_id }]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    Promise.all([
      fetch(`${API}/regions`).then(r => r.json()),
      fetch(`${API}/products/${product.id}/visibility`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
    ])
      .then(([regionsData, visibilityData]) => {
        setRegions(Array.isArray(regionsData) ? regionsData : []);
        setTargets(
          Array.isArray(visibilityData)
            ? visibilityData.map(v => ({ region_id: v.region_id, district_id: v.district_id }))
            : []
        );
      })
      .catch(() => setError("Could not load regions"))
      .finally(() => setLoading(false));
  }, [product.id]);

  const addTarget = () => {
    setTargets(prev => [...prev, { region_id: "", district_id: "" }]);
  };

  const removeTarget = (idx) => {
    setTargets(prev => prev.filter((_, i) => i !== idx));
  };

  const updateTargetRegion = (idx, regionId) => {
    setTargets(prev => prev.map((t, i) => i === idx ? { region_id: regionId, district_id: "" } : t));
  };

  const updateTargetDistrict = (idx, districtId) => {
    setTargets(prev => prev.map((t, i) => i === idx ? { ...t, district_id: districtId } : t));
  };

  const getDistrictsFor = (regionId) => {
    const region = regions.find(r => String(r.id) === String(regionId));
    return region?.districts || [];
  };

  const handleSave = async () => {
    setError("");
    // Every added row must at least have a region selected
    if (targets.some(t => !t.region_id)) {
      setError("Select a region for each row, or remove empty rows.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/products/${product.id}/visibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          targets: targets.map(t => ({
            region_id: parseInt(t.region_id),
            district_id: t.district_id ? parseInt(t.district_id) : null,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
            <FiMapPin className="text-purple-500" size={16} /> Customize Availability
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <FiX size={18} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-xs text-gray-500 mb-1 truncate">{product.name}</p>

          {loading ? (
            <div className="py-10 flex justify-center">
              <svg className="animate-spin w-6 h-6 text-purple-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          ) : (
            <>
              {targets.length === 0 ? (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-3 mb-4">
                  <FiGlobe size={16} className="text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-blue-600">
                    Currently visible <strong>everywhere</strong>. Add a region below to restrict visibility.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {targets.map((t, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-2">
                        <select
                          value={t.region_id}
                          onChange={(e) => updateTargetRegion(idx, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                        >
                          <option value="">Select region</option>
                          {regions.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>

                        {t.region_id && (
                          <select
                            value={t.district_id}
                            onChange={(e) => updateTargetDistrict(idx, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                          >
                            <option value="">Whole region (all districts)</option>
                            {getDistrictsFor(t.region_id).map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                      <button
                        onClick={() => removeTarget(idx)}
                        className="text-red-400 hover:text-red-600 p-2 flex-shrink-0"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={addTarget}
                className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 mb-2"
              >
                <FiPlus size={12} /> Add {targets.length > 0 ? "another " : ""}region
              </button>

              {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </>
          )}
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 transition text-sm font-medium disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {saving ? "Saving..." : "Save Availability"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}