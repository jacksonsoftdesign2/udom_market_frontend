import { useState, useEffect } from "react";
import { FiMapPin, FiX, FiPlus, FiTrash2, FiGlobe, FiChevronDown, FiChevronRight, FiCheck } from "react-icons/fi";

const API = import.meta.env.VITE_API_URL;

export default function ProductVisibilityModal({ product, onClose, onSaved }) {
  const [regions, setRegions] = useState([]);
  const [targets, setTargets] = useState([]); // [{ region_id, district_id }]
  const [expandedRegion, setExpandedRegion] = useState(null);
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

  const isRegionSelected = (regionId) =>
    targets.some(t => String(t.region_id) === String(regionId) && !t.district_id);

  const isDistrictSelected = (regionId, districtId) =>
    targets.some(t => String(t.region_id) === String(regionId) && String(t.district_id) === String(districtId));

  const hasAnySelectionInRegion = (regionId) =>
    targets.some(t => String(t.region_id) === String(regionId));

  // Selecting "whole region" removes any district-level picks for that region
  const toggleWholeRegion = (regionId) => {
    setTargets(prev => {
      const withoutRegion = prev.filter(t => String(t.region_id) !== String(regionId));
      if (isRegionSelected(regionId)) return withoutRegion; // deselect
      return [...withoutRegion, { region_id: regionId, district_id: null }];
    });
  };

  // Selecting a district removes the "whole region" pick if present, toggles that district
  const toggleDistrict = (regionId, districtId) => {
    setTargets(prev => {
      const withoutWholeRegion = prev.filter(
        t => !(String(t.region_id) === String(regionId) && !t.district_id)
      );
      const exists = withoutWholeRegion.some(
        t => String(t.region_id) === String(regionId) && String(t.district_id) === String(districtId)
      );
      if (exists) {
        return withoutWholeRegion.filter(
          t => !(String(t.region_id) === String(regionId) && String(t.district_id) === String(districtId))
        );
      }
      return [...withoutWholeRegion, { region_id: regionId, district_id: districtId }];
    });
  };

  const clearAll = () => setTargets([]);

  const handleSave = async () => {
    setError("");
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100" style={{ background: "#1a3a8f" }}>
          <h3 className="font-bold text-white text-sm md:text-base flex items-center gap-2">
            <FiMapPin size={16} className="text-[#F5C518]" /> Customize Availability
          </h3>
          <button onClick={onClose} className="text-blue-200 hover:text-white">
            <FiX size={18} />
          </button>
        </div>

        <div className="px-5 pt-3">
          <p className="text-xs md:text-sm text-gray-400 truncate">{product.name}</p>
        </div>

        {/* Body */}
        <div className="px-5 py-3 flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-10 flex justify-center">
              <svg className="animate-spin w-6 h-6" style={{ color: "#1a3a8f" }} viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          ) : (
            <>
              {targets.length === 0 && (
                <div className="flex items-center gap-2 rounded-sm px-3 py-2.5 mb-3" style={{ background: "#e8edf7" }}>
                  <FiGlobe size={15} className="flex-shrink-0" style={{ color: "#1a3a8f" }} />
                  <p className="text-xs md:text-sm" style={{ color: "#1a3a8f" }}>
                    Visible <strong>everywhere</strong>. Select regions below to restrict.
                  </p>
                </div>
              )}

              <div className="border border-gray-100 rounded-sm divide-y divide-gray-100 overflow-hidden">
                {regions.map(region => {
                  const expanded = expandedRegion === region.id;
                  const wholeSelected = isRegionSelected(region.id);
                  const anySelected = hasAnySelectionInRegion(region.id);
                  const hasDistricts = region.districts?.length > 0;

                  return (
                    <div key={region.id}>
                      {/* Region row */}
                      <div
                        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition ${anySelected ? "bg-[#e8edf7]" : "hover:bg-gray-50"}`}
                        onClick={() => hasDistricts && setExpandedRegion(expanded ? null : region.id)}
                      >
                        {hasDistricts ? (
                          expanded
                            ? <FiChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                            : <FiChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                        ) : (
                          <span className="w-[14px] flex-shrink-0" />
                        )}

                        <button
                          onClick={(e) => { e.stopPropagation(); toggleWholeRegion(region.id); }}
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition ${
                            wholeSelected ? "border-[#1a3a8f]" : "border-gray-300"
                          }`}
                          style={{ background: wholeSelected ? "#1a3a8f" : "transparent" }}
                        >
                          {wholeSelected && <FiCheck size={11} className="text-[#F5C518]" />}
                        </button>

                        <span className="text-sm md:text-base font-medium text-gray-700 flex-1">{region.name}</span>

                        {hasDistricts && (
                          <span className="text-[10px] md:text-xs text-gray-400">{region.districts.length} districts</span>
                        )}
                      </div>

                      {/* Nested districts */}
                      {expanded && hasDistricts && (
                        <div className="bg-gray-50 py-1">
                          {region.districts.map(district => {
                            const selected = isDistrictSelected(region.id, district.id);
                            return (
                              <div
                                key={district.id}
                                onClick={() => toggleDistrict(region.id, district.id)}
                                className="flex items-center gap-2 pl-9 pr-3 py-2 cursor-pointer hover:bg-gray-100 transition"
                              >
                                <button
                                  className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 transition ${
                                    selected ? "border-[#1a3a8f]" : "border-gray-300"
                                  }`}
                                  style={{ background: selected ? "#1a3a8f" : "transparent" }}
                                >
                                  {selected && <FiCheck size={9} className="text-[#F5C518]" />}
                                </button>
                                <span className="text-xs md:text-sm text-gray-600">{district.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {targets.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 text-xs md:text-sm font-semibold mt-3 hover:opacity-70"
                  style={{ color: "#dc2626" }}
                >
                  <FiTrash2 size={12} /> Clear all — make visible everywhere
                </button>
              )}

              {error && <p className="text-xs md:text-sm text-red-500 mt-2">{error}</p>}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 py-2.5 rounded-sm text-sm md:text-base font-semibold text-[#F5C518] disabled:opacity-60 transition"
            style={{ background: "#1a3a8f" }}
          >
            {saving ? "Saving..." : "Save Availability"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-sm text-sm md:text-base font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}