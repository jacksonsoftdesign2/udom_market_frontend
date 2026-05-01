// src/components/AddressMapPicker.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { REGIONS, getDistricts } from "../data/tanzaniaData";

// ── Fix Leaflet default marker icons (Vite/webpack asset issue) ──
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ── Map controller — zooms map when center/zoom changes ──
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// ── Draggable marker ──
function DraggableMarker({ position, onDrag }) {
  const markerRef = useRef(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const { lat, lng } = marker.getLatLng();
        onDrag(lat, lng);
      }
    },
  };

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

// ── Autocomplete dropdown ──
function AutocompleteInput({ label, value, onChange, suggestions, onSelect, placeholder, disabled = false, required = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = suggestions.filter(s =>
    s.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={`input ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-400" : ""}`}
        autoComplete="off"
        required={required}
      />
      {open && filtered.length > 0 && value.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(s => (
            <button
              key={s}
              type="button"
              onMouseDown={() => { onSelect(s); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Region center coordinates ──
const REGION_COORDS = {
  "Arusha": [-3.3869, 36.6830],
  "Dar es Salaam": [-6.7924, 39.2083],
  "Dodoma": [-6.1730, 35.7395],
  "Geita": [-2.8726, 32.2321],
  "Iringa": [-7.7700, 35.6938],
  "Kagera": [-1.2921, 31.8135],
  "Katavi": [-6.8363, 31.1069],
  "Kigoma": [-4.8770, 29.6267],
  "Kilimanjaro": [-3.0674, 37.3556],
  "Lindi": [-9.9975, 39.7137],
  "Manyara": [-3.9973, 36.0765],
  "Mara": [-1.7557, 34.0081],
  "Mbeya": [-8.9094, 33.4607],
  "Morogoro": [-6.8242, 37.6606],
  "Mtwara": [-10.2740, 40.1877],
  "Mwanza": [-2.5164, 32.9175],
  "Njombe": [-9.3376, 34.7699],
  "Pwani": [-7.0000, 38.8000],
  "Rukwa": [-7.9044, 31.4398],
  "Ruvuma": [-10.5500, 35.4000],
  "Shinyanga": [-3.6609, 33.4271],
  "Simiyu": [-2.8500, 34.1800],
  "Singida": [-4.8185, 34.7500],
  "Songwe": [-8.9500, 32.9000],
  "Tabora": [-5.0167, 32.8000],
  "Tanga": [-5.0690, 38.9990],
  "Zanzibar North": [-5.7334, 39.2833],
  "Zanzibar South": [-6.1500, 39.3000],
  "Zanzibar West": [-6.1659, 39.2026],
  "Pemba North": [-5.0276, 39.7749],
  "Pemba South": [-5.2400, 39.7700],
};

// Tanzania center (default)
const TZ_CENTER = [-6.369028, 34.888822];
const TZ_ZOOM = 6;
const REGION_ZOOM = 9;
const DISTRICT_ZOOM = 11;
const STREET_ZOOM = 14;

export default function AddressMapPicker({ address, onChange }) {
  const { region, district, street, latitude, longitude } = address;

  // Map state
  const [mapCenter, setMapCenter] = useState(TZ_CENTER);
  const [mapZoom, setMapZoom] = useState(TZ_ZOOM);
  const [markerPos, setMarkerPos] = useState(TZ_CENTER);

  // Street suggestions from Nominatim
  const [streetSuggestions, setStreetSuggestions] = useState([]);
  const [streetLoading, setStreetLoading] = useState(false);
  const streetDebounce = useRef(null);

  // GPS loading
  const [gpsLoading, setGpsLoading] = useState(false);

  // ── When region changes → zoom to region ──
  useEffect(() => {
    if (region && REGION_COORDS[region]) {
      const coords = REGION_COORDS[region];
      setMapCenter(coords);
      setMapZoom(REGION_ZOOM);
      setMarkerPos(coords);
      onChange({ ...address, latitude: coords[0], longitude: coords[1] });
    }
  }, [region]);

  // ── When district changes → geocode district for zoom ──
  useEffect(() => {
    if (!district || !region) return;
    const query = `${district}, ${region}, Tanzania`;
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`)
      .then(r => r.json())
      .then(data => {
        if (data[0]) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setMapCenter([lat, lng]);
          setMapZoom(DISTRICT_ZOOM);
          setMarkerPos([lat, lng]);
          onChange({ ...address, latitude: lat, longitude: lng });
        }
      })
      .catch(() => {});
  }, [district]);

  // ── Street autocomplete via Nominatim ──
  const handleStreetChange = (val) => {
    onChange({ ...address, street: val });
    if (streetDebounce.current) clearTimeout(streetDebounce.current);
    if (val.length < 2) { setStreetSuggestions([]); return; }

    streetDebounce.current = setTimeout(() => {
      setStreetLoading(true);
      const q = region ? `${val}, ${district || ""}, ${region}, Tanzania` : `${val}, Tanzania`;
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`)
        .then(r => r.json())
        .then(data => {
          setStreetSuggestions(data.map(d => d.display_name.split(",")[0]));
        })
        .catch(() => setStreetSuggestions([]))
        .finally(() => setStreetLoading(false));
    }, 600);
  };

  const handleStreetSelect = (val) => {
    onChange({ ...address, street: val });
    // Geocode selected street for map zoom
    const q = `${val}, ${district || ""}, ${region || ""}, Tanzania`;
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`)
      .then(r => r.json())
      .then(data => {
        if (data[0]) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setMapCenter([lat, lng]);
          setMapZoom(STREET_ZOOM);
          setMarkerPos([lat, lng]);
          onChange({ ...address, street: val, latitude: lat, longitude: lng });
        }
      })
      .catch(() => {});
  };

  // ── GPS button ──
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
(pos) => {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  setMarkerPos([lat, lng]);
  setMapCenter([lat, lng]);
  setMapZoom(STREET_ZOOM);
  setGpsLoading(false);

  fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
    .then(r => r.json())
    .then(data => {
      const a = data.address || {};
      const stateName = (a.state || "").replace(/\s*region\s*/i, "").trim();
      const detectedRegion = REGIONS.find(r =>
        r.toLowerCase() === stateName.toLowerCase() ||
        r.toLowerCase().includes(stateName.toLowerCase()) ||
        stateName.toLowerCase().includes(r.toLowerCase())
      ) || stateName;
      const detectedDistrict = a.county || a.city_district || a.town || a.city || "";
      const detectedStreet = a.road || a.neighbourhood || a.suburb || a.village || "";

      onChange({
        type: "shop",
        is_primary: true,
        region: detectedRegion,
        district: detectedDistrict,
        street: detectedStreet,
        latitude: lat,
        longitude: lng,
      });
    })
    .catch(() => {
        // // Even if reverse geocode fails, at least save coordinates
    onChange({ ...address, latitude: lat, longitude: lng });
    });
},
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Marker drag ──
  const handleMarkerDrag = (lat, lng) => {
    setMarkerPos([lat, lng]);
    onChange({ ...address, latitude: lat, longitude: lng });
  };

  const districts = getDistricts(region);

  return (
    <div className="space-y-4">
      {/* ── Region + District + Street ── */}
      <div className="grid grid-cols-1 gap-3">
        <AutocompleteInput
          label="Region"
          value={region}
          onChange={val => onChange({ ...address, region: val.toUpperCase(), district: "", street: "", latitude: null, longitude: null })}
          suggestions={REGIONS}
          onSelect={val => onChange({ ...address, region: val, district: "", street: "", latitude: null, longitude: null })}
          placeholder="e.g. Dodoma"
          required
        />

        <AutocompleteInput
          label="District"
          value={district}
          onChange={val => onChange({ ...address, district: val.toUpperCase(), street: "" })}
          suggestions={districts}
          onSelect={val => onChange({ ...address, district: val, street: "" })}
          placeholder={region ? `Districts of ${region}` : "Select region first"}
          disabled={!region}
          required
        />

        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Street / Village <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={street}
              onChange={e => handleStreetChange(e.target.value)}
              placeholder={district ? "Type street or village name..." : "Select district first"}
              disabled={!district}
              className={`input pr-8 ${!district ? "bg-gray-100 cursor-not-allowed text-gray-400" : ""}`}
              autoComplete="off"
              required
            />
            {streetLoading && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="animate-spin w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              </span>
            )}
          </div>
          {streetSuggestions.length > 0 && street.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
              {streetSuggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={() => handleStreetSelect(s)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── GPS Button ── */}
      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={gpsLoading}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-blue-400 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-all disabled:opacity-60"
      >
        {gpsLoading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Getting location...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
            Use My Current Location
          </>
        )}
      </button>

      {/* ── Map ── */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: "280px" }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={mapCenter} zoom={mapZoom} />
          <DraggableMarker position={markerPos} onDrag={handleMarkerDrag} />
        </MapContainer>
      </div>

      {/* ── Coordinates display ── */}
      {latitude && longitude && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <p className="text-xs text-green-700 font-medium">
            Location pinned: {Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}
          </p>
          <p className="text-xs text-green-500 ml-auto">Drag pin to adjust</p>
        </div>
      )}
    </div>
  );
}
