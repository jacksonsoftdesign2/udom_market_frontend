import { useState, useEffect } from "react";
import { API } from "../../api";
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronRight, FiMapPin, FiX } from "react-icons/fi";

const token = () => localStorage.getItem("token");

export default function AdminRegions() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(new Set());
  const [message, setMessage] = useState(null);

  const [newRegionName, setNewRegionName] = useState("");
  const [addingRegion, setAddingRegion] = useState(false);

  const [newDistrictName, setNewDistrictName] = useState({});
  const [addingDistrictFor, setAddingDistrictFor] = useState(null);

  const [editingRegion, setEditingRegion] = useState(null);
  const [editingDistrict, setEditingDistrict] = useState(null);
  const [editValue, setEditValue] = useState("");

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/regions`);
      const data = await res.json();
      setRegions(Array.isArray(data) ? data : []);
    } catch {
      setRegions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegions(); }, []);

  const toggleExpand = (regionId) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(regionId) ? next.delete(regionId) : next.add(regionId);
      return next;
    });
  };

  const handleAddRegion = async () => {
    if (!newRegionName.trim()) return;
    try {
      const res = await fetch(`${API}/regions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ name: newRegionName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      showMsg("success", "Region added");
      setNewRegionName("");
      setAddingRegion(false);
      fetchRegions();
    } catch {
      showMsg("error", "Network error");
    }
  };

  const handleAddDistrict = async (regionId) => {
    const name = newDistrictName[regionId];
    if (!name?.trim()) return;
    try {
      const res = await fetch(`${API}/regions/${regionId}/districts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      showMsg("success", "District added");
      setNewDistrictName(prev => ({ ...prev, [regionId]: "" }));
      setAddingDistrictFor(null);
      fetchRegions();
    } catch {
      showMsg("error", "Network error");
    }
  };

  const handleUpdateRegion = async (regionId) => {
    if (!editValue.trim()) return;
    try {
      const res = await fetch(`${API}/regions/${regionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ name: editValue.trim() }),
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      showMsg("success", "Region updated");
      setEditingRegion(null);
      fetchRegions();
    } catch {
      showMsg("error", "Network error");
    }
  };

  const handleUpdateDistrict = async (districtId) => {
    if (!editValue.trim()) return;
    try {
      const res = await fetch(`${API}/regions/districts/${districtId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ name: editValue.trim() }),
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      showMsg("success", "District updated");
      setEditingDistrict(null);
      fetchRegions();
    } catch {
      showMsg("error", "Network error");
    }
  };

  const handleDeleteRegion = async (regionId) => {
    if (!window.confirm("Delete this region and ALL its districts? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API}/regions/${regionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) { const d = await res.json(); return showMsg("error", d.message); }
      showMsg("success", "Region deleted");
      fetchRegions();
    } catch {
      showMsg("error", "Network error");
    }
  };

  const handleDeleteDistrict = async (districtId) => {
    if (!window.confirm("Delete this district?")) return;
    try {
      const res = await fetch(`${API}/regions/districts/${districtId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) { const d = await res.json(); return showMsg("error", d.message); }
      showMsg("success", "District deleted");
      fetchRegions();
    } catch {
      showMsg("error", "Network error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FiMapPin className="text-blue-600" /> Regions & Districts
          <span className="text-sm font-normal text-gray-400">({regions.length} regions)</span>
        </h1>
        <button
          onClick={() => setAddingRegion(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "#1a3a8f" }}
        >
          <FiPlus size={15} /> New Region
        </button>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium border ${
          message.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {message.text}
        </div>
      )}

      {addingRegion && (
        <div className="bg-white border border-blue-100 rounded-xl p-4 flex gap-2">
          <input
            autoFocus
            type="text"
            placeholder="New region name"
            value={newRegionName}
            onChange={e => setNewRegionName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddRegion()}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button onClick={handleAddRegion} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">Add</button>
          <button onClick={() => { setAddingRegion(false); setNewRegionName(""); }} className="px-3 py-2 text-gray-400"><FiX size={16} /></button>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-400 py-10">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl shadow border border-gray-100 divide-y divide-gray-50">
          {regions.map(region => (
            <div key={region.id}>
              <div className="flex items-center gap-2 px-4 py-3">
                <button onClick={() => toggleExpand(region.id)} className="text-gray-400">
                  {expanded.has(region.id) ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                </button>

                {editingRegion === region.id ? (
                  <>
                    <input
                      autoFocus
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleUpdateRegion(region.id)}
                      className="flex-1 border border-blue-300 rounded-lg px-2 py-1 text-sm outline-none"
                    />
                    <button onClick={() => handleUpdateRegion(region.id)} className="text-xs font-semibold text-green-600 px-2">Save</button>
                    <button onClick={() => setEditingRegion(null)} className="text-xs text-gray-400 px-2">Cancel</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-semibold text-gray-800 text-sm">{region.name}</span>
                    <span className="text-xs text-gray-400">{region.districts.length} districts</span>
                    <button onClick={() => { setEditingRegion(region.id); setEditValue(region.name); }} className="text-gray-400 hover:text-blue-600 p-1">
                      <FiEdit2 size={13} />
                    </button>
                    <button onClick={() => handleDeleteRegion(region.id)} className="text-gray-400 hover:text-red-600 p-1">
                      <FiTrash2 size={13} />
                    </button>
                  </>
                )}
              </div>

              {expanded.has(region.id) && (
                <div className="bg-gray-50 px-4 py-2 pl-10">
                  <div className="space-y-1">
                    {region.districts.map(d => (
                      <div key={d.id} className="flex items-center gap-2 py-1.5">
                        {editingDistrict === d.id ? (
                          <>
                            <input
                              autoFocus
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onKeyDown={e => e.key === "Enter" && handleUpdateDistrict(d.id)}
                              className="flex-1 border border-blue-300 rounded-lg px-2 py-1 text-xs outline-none"
                            />
                            <button onClick={() => handleUpdateDistrict(d.id)} className="text-xs font-semibold text-green-600 px-2">Save</button>
                            <button onClick={() => setEditingDistrict(null)} className="text-xs text-gray-400 px-2">Cancel</button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-sm text-gray-600">{d.name}</span>
                            <button onClick={() => { setEditingDistrict(d.id); setEditValue(d.name); }} className="text-gray-300 hover:text-blue-600 p-1">
                              <FiEdit2 size={12} />
                            </button>
                            <button onClick={() => handleDeleteDistrict(d.id)} className="text-gray-300 hover:text-red-600 p-1">
                              <FiTrash2 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {addingDistrictFor === region.id ? (
                    <div className="flex gap-2 mt-2">
                      <input
                        autoFocus
                        type="text"
                        placeholder="New district name"
                        value={newDistrictName[region.id] || ""}
                        onChange={e => setNewDistrictName(prev => ({ ...prev, [region.id]: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && handleAddDistrict(region.id)}
                        className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      <button onClick={() => handleAddDistrict(region.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold">Add</button>
                      <button onClick={() => setAddingDistrictFor(null)} className="px-2 text-gray-400"><FiX size={14} /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingDistrictFor(region.id)}
                      className="text-xs font-semibold text-blue-600 mt-2 flex items-center gap-1"
                    >
                      <FiPlus size={11} /> Add district
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {regions.length === 0 && <p className="text-center text-gray-400 py-10 text-sm">No regions yet.</p>}
        </div>
      )}
    </div>
  );
}