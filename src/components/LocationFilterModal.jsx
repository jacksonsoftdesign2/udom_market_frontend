import { useState, useEffect } from "react";
import { FiMapPin, FiX, FiChevronDown, FiChevronRight, FiGlobe, FiCheck } from "react-icons/fi";

const API = import.meta.env.VITE_API_URL;

export default function LocationFilterModal({ current, onApply, onClose }) {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRegion, setExpandedRegion] = useState(current?.region_id || null);
  const [selectedRegion, setSelectedRegion] = useState(current?.region_id || null);
  const [selectedDistrict, setSelectedDistrict] = useState(current?.district_id || null);

  useEffect(() => {
    fetch(`${API}/regions`)
      .then(r => r.json())
      .then(data => setRegions(Array.isArray(data) ? data : []))
      .catch(() => setRegions([]))
      .finally(() => setLoading(false));
  }, []);

  const pickWholeRegion = (region) => {
    setSelectedRegion(region.id);
    setSelectedDistrict(null);
    setExpandedRegion(expandedRegion === region.id ? null : region.id);
  };

  const pickDistrict = (region, district) => {
    setSelectedRegion(region.id);
    setSelectedDistrict(district.id);
  };

  const handleApply = () => {
    const region = regions.find(r => r.id === selectedRegion);
    const district = region?.districts?.find(d => d.id === selectedDistrict);
    onApply({
      region_id: selectedRegion,
      district_id: selectedDistrict,
      region_name: region?.name || null,
      district_name: district?.name || null,
    });
    onClose();
  };

  const handleClear = () => {
    onApply({ region_id: null, district_id: null, region_name: null, district_name: null });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center">
      <div className="bg-white rounded-t-sm md:rounded-sm shadow-2xl w-full md:max-w-sm max-h-[80vh] overflow-hidden flex flex-col">

        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1 md:hidden flex-shrink-0" />

        <div className="flex items-center justify-between px-5 py-3 md:py-4 border-b border-gray-100 flex-shrink-0" style={{ background: "#1a3a8f" }}>
          <h3 className="font-bold text-white text-sm md:text-base flex items-center gap-2">
            <FiMapPin size={16} className="text-[#F5C518]" /> Filter by Location
          </h3>
          <button onClick={onClose} className="text-blue-200 hover:text-white">
            <FiX size={18} />
          </button>
        </div>

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
              <button
                onClick={handleClear}
                className={`w-full flex items-center gap-2 rounded-sm px-3 py-2.5 mb-2 text-left transition ${
                  !selectedRegion ? "" : "hover:bg-gray-50"
                }`}
                style={!selectedRegion ? { background: "#e8edf7" } : {}}
              >
                <FiGlobe size={15} className="flex-shrink-0" style={{ color: "#1a3a8f" }} />
                <span className="text-sm md:text-base font-medium" style={{ color: "#1a3a8f" }}>All Tanzania</span>
                {!selectedRegion && <FiCheck size={14} className="ml-auto" style={{ color: "#1a3a8f" }} />}
              </button>

              <div className="border border-gray-100 rounded-sm divide-y divide-gray-100 overflow-hidden">
                {regions.map(region => {
                  const expanded = expandedRegion === region.id;
                  const wholeSelected = selectedRegion === region.id && !selectedDistrict;
                  const hasDistricts = region.districts?.length > 0;

                  return (
                    <div key={region.id}>
                      <div
                        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition ${
                          selectedRegion === region.id ? "bg-[#e8edf7]" : "hover:bg-gray-50"
                        }`}
                        onClick={() => hasDistricts ? setExpandedRegion(expanded ? null : region.id) : pickWholeRegion(region)}
                      >
                        {hasDistricts ? (
                          expanded
                            ? <FiChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                            : <FiChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                        ) : (
                          <span className="w-[14px] flex-shrink-0" />
                        )}

                        <span
                          onClick={(e) => { if (hasDistricts) { e.stopPropagation(); pickWholeRegion(region); } }}
                          className="text-sm md:text-base font-medium text-gray-700 flex-1"
                        >
                          {region.name}
                        </span>

                        {wholeSelected && <FiCheck size={14} className="flex-shrink-0" style={{ color: "#1a3a8f" }} />}
                        {hasDistricts && !wholeSelected && (
                          <span className="text-[10px] md:text-xs text-gray-400">{region.districts.length} districts</span>
                        )}
                      </div>

                      {expanded && hasDistricts && (
                        <div className="bg-gray-50 py-1">
                          {region.districts.map(district => {
                            const selected = selectedRegion === region.id && selectedDistrict === district.id;
                            return (
                              <div
                                key={district.id}
                                onClick={() => pickDistrict(region, district)}
                                className="flex items-center gap-2 pl-9 pr-3 py-2 cursor-pointer hover:bg-gray-100 transition"
                              >
                                <span className="text-xs md:text-sm text-gray-600 flex-1">{district.name}</span>
                                {selected && <FiCheck size={12} style={{ color: "#1a3a8f" }} />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleApply}
            disabled={loading}
            className="w-full py-2.5 rounded-sm text-sm md:text-base font-semibold text-[#F5C518] transition"
            style={{ background: "#1a3a8f" }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}