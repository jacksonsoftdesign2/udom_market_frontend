import { useState, useEffect, useRef } from "react";
import { REGIONS, getDistricts } from "../data/tanzaniaData";

// ── Leaflet lazy load ──
let leafletLoaded = false;
let MapContainer, TileLayer, Marker, useMap, L;

async function loadLeaflet() {
  if (leafletLoaded) return;
  const leaflet = await import("leaflet");
  const reactLeaflet = await import("react-leaflet");
  await import("leaflet/dist/leaflet.css");
  L = leaflet.default;
  MapContainer = reactLeaflet.MapContainer;
  TileLayer = reactLeaflet.TileLayer;
  Marker = reactLeaflet.Marker;
  useMap = reactLeaflet.useMap;
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
  leafletLoaded = true;
}

const REGION_COORDS = {
  "Arusha": [-3.3869, 36.6830], "Dar es Salaam": [-6.7924, 39.2083],
  "Dodoma": [-6.1730, 35.7395], "Geita": [-2.8726, 32.2321],
  "Iringa": [-7.7700, 35.6938], "Kagera": [-1.2921, 31.8135],
  "Katavi": [-6.8363, 31.1069], "Kigoma": [-4.8770, 29.6267],
  "Kilimanjaro": [-3.0674, 37.3556], "Lindi": [-9.9975, 39.7137],
  "Manyara": [-3.9973, 36.0765], "Mara": [-1.7557, 34.0081],
  "Mbeya": [-8.9094, 33.4607], "Morogoro": [-6.8242, 37.6606],
  "Mtwara": [-10.2740, 40.1877], "Mwanza": [-2.5164, 32.9175],
  "Njombe": [-9.3376, 34.7699], "Pwani": [-7.0000, 38.8000],
  "Rukwa": [-7.9044, 31.4398], "Ruvuma": [-10.5500, 35.4000],
  "Shinyanga": [-3.6609, 33.4271], "Simiyu": [-2.8500, 34.1800],
  "Singida": [-4.8185, 34.7500], "Songwe": [-8.9500, 32.9000],
  "Tabora": [-5.0167, 32.8000], "Tanga": [-5.0690, 38.9990],
  "Zanzibar North": [-5.7334, 39.2833], "Zanzibar South": [-6.1500, 39.3000],
  "Zanzibar West": [-6.1659, 39.2026], "Pemba North": [-5.0276, 39.7749],
  "Pemba South": [-5.2400, 39.7700],
};

const TZ_CENTER = [-6.369028, 34.888822];
const TZ_ZOOM = 6;
const STREET_ZOOM = 14;
const REGION_ZOOM = 9;
const DISTRICT_ZOOM = 11;

// ── Smart region matcher — tries all Nominatim fields ──
function matchRegion(a, displayName) {
  const candidates = [a.state, a.state_district, a.county, a.region, a.province].filter(Boolean);
  for (const candidate of candidates) {
    const clean = candidate.replace(/\s*region\s*/i, "").trim();
    const exact = REGIONS.find(r => r.toLowerCase() === clean.toLowerCase());
    if (exact) return exact;
    const partial = REGIONS.find(r =>
      r.toLowerCase().includes(clean.toLowerCase()) ||
      clean.toLowerCase().includes(r.toLowerCase())
    );
    if (partial) return partial;
  }
  // Last resort: scan display_name
  if (displayName) {
    const found = REGIONS.find(r => displayName.toLowerCase().includes(r.toLowerCase()));
    if (found) return found;
  }
  return "";
}

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

function DraggableMarker({ position, onDrag }) {
  const markerRef = useRef(null);
  return (
    <Marker draggable
      eventHandlers={{ dragend() { const m = markerRef.current; if (m) { const { lat, lng } = m.getLatLng(); onDrag(lat, lng); } } }}
      position={position} ref={markerRef}
    />
  );
}

function LazyMap({ center, zoom, markerPos, onDrag }) {
  const [ready, setReady] = useState(leafletLoaded);
  useEffect(() => { if (!leafletLoaded) loadLeaflet().then(() => setReady(true)); }, []);
  if (!ready) return (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-2xl">
      <div className="flex flex-col items-center gap-2">
        <svg className="animate-spin w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        <p className="text-xs text-gray-500">Loading map…</p>
      </div>
    </div>
  );
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} zoomControl>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapController center={center} zoom={zoom} />
      <DraggableMarker position={markerPos} onDrag={onDrag} />
    </MapContainer>
  );
}

function AutocompleteInput({ label, value, onChange, suggestions, onSelect, placeholder, disabled = false, required = false, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const filtered = suggestions.filter(s => s.toLowerCase().includes((value || "").toLowerCase()));
  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type="text" value={value || ""}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder} disabled={disabled} autoComplete="off"
        className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-400 transition
          ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}
          ${disabled ? "bg-gray-100 cursor-not-allowed text-gray-400" : ""}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {open && filtered.length > 0 && (value || "").length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(s => (
            <button key={s} type="button" onMouseDown={() => { onSelect(s); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors first:rounded-t-xl last:rounded-b-xl">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════
export default function AddressMapPicker({ address, onChange, errors = {} }) {
  const { latitude, longitude } = address;

  const [mapCenter, setMapCenter] = useState(TZ_CENTER);
  const [mapZoom, setMapZoom] = useState(TZ_ZOOM);
  const [markerPos, setMarkerPos] = useState(TZ_CENTER);
  const [showMap, setShowMap] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // ── KEY: local address state so GPS fills instantly without waiting for parent re-render ──
  const [localAddress, setLocalAddress] = useState({
    region: address.region || "",
    district: address.district || "",
    street: address.street || "",
    latitude: address.latitude || null,
    longitude: address.longitude || null,
  });

  // Keep local in sync when parent changes (e.g. user clears form)
  useEffect(() => {
    setLocalAddress({
      region: address.region || "",
      district: address.district || "",
      street: address.street || "",
      latitude: address.latitude || null,
      longitude: address.longitude || null,
    });
  }, [address.region, address.district, address.street, address.latitude, address.longitude]);

  const updateAddress = (newAddr) => {
    setLocalAddress(newAddr);
    onChange(newAddr);
  };

  const [streetSuggestions, setStreetSuggestions] = useState([]);
  const [streetLoading, setStreetLoading] = useState(false);
  const streetDebounce = useRef(null);

  // ── Region change → zoom ──
  useEffect(() => {
    if (localAddress.region && REGION_COORDS[localAddress.region]) {
      const coords = REGION_COORDS[localAddress.region];
      setMapCenter(coords);
      setMapZoom(REGION_ZOOM);
      setMarkerPos(coords);
    }
  }, [localAddress.region]);

  // ── Street autocomplete ──
  const handleStreetChange = (val) => {
    updateAddress({ ...localAddress, street: val });
    if (streetDebounce.current) clearTimeout(streetDebounce.current);
    if (val.length < 2) { setStreetSuggestions([]); return; }
    streetDebounce.current = setTimeout(() => {
      setStreetLoading(true);
      const q = localAddress.region
        ? `${val}, ${localAddress.district || ""}, ${localAddress.region}, Tanzania`
        : `${val}, Tanzania`;
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`)
        .then(r => r.json())
        .then(data => setStreetSuggestions(data.map(d => d.display_name.split(",")[0])))
        .catch(() => setStreetSuggestions([]))
        .finally(() => setStreetLoading(false));
    }, 600);
  };

  const handleStreetSelect = (val) => {
    const q = `${val}, ${localAddress.district || ""}, ${localAddress.region || ""}, Tanzania`;
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`)
      .then(r => r.json())
      .then(data => {
        if (data[0]) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setMapCenter([lat, lng]); setMapZoom(STREET_ZOOM); setMarkerPos([lat, lng]);
          updateAddress({ ...localAddress, street: val, latitude: lat, longitude: lng });
        } else {
          updateAddress({ ...localAddress, street: val });
        }
      }).catch(() => updateAddress({ ...localAddress, street: val }));
    setStreetSuggestions([]);
  };

  // ══════════════════════════════════════════════════
  // GPS — click once → fills region, district, street
  // ══════════════════════════════════════════════════
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Move map immediately
        setMarkerPos([lat, lng]);
        setMapCenter([lat, lng]);
        setMapZoom(STREET_ZOOM);
        setShowMap(true);

        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`)
          .then(r => r.json())
          .then(data => {
            const a = data.address || {};

            const detectedRegion   = matchRegion(a, data.display_name);
            const detectedDistrict = a.county || a.city_district || a.city || a.town || a.municipality || a.suburb || "";
            const detectedStreet   = a.road || a.pedestrian || a.footway || a.neighbourhood || a.quarter || a.suburb || a.village || "";

            // Set everything at once in local state → fields show immediately
            const filled = {
              region:    detectedRegion,
              district:  detectedDistrict,
              street:    detectedStreet,
              latitude:  lat,
              longitude: lng,
            };

            setLocalAddress(filled);  // instant UI update
            onChange(filled);          // push to parent
            setGpsLoading(false);
          })
          .catch(() => {
            const fallback = { ...localAddress, latitude: lat, longitude: lng };
            setLocalAddress(fallback);
            onChange(fallback);
            setGpsLoading(false);
          });
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) alert("Location permission denied. Please allow location access.");
        else if (err.code === 2) alert("Location unavailable. Check your GPS signal.");
        else alert("Could not get your location. Please try again.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // ── Marker drag → reverse geocode ──
  const handleMarkerDrag = (lat, lng) => {
    setMarkerPos([lat, lng]);
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`)
      .then(r => r.json())
      .then(data => {
        const a = data.address || {};
        const dragged = {
          region:    matchRegion(a, data.display_name) || localAddress.region,
          district:  a.county || a.city_district || a.city || a.town || localAddress.district,
          street:    a.road || a.neighbourhood || a.suburb || a.village || localAddress.street,
          latitude:  lat,
          longitude: lng,
        };
        setLocalAddress(dragged);
        onChange(dragged);
      })
      .catch(() => {
        const updated = { ...localAddress, latitude: lat, longitude: lng };
        setLocalAddress(updated);
        onChange(updated);
      });
  };

  const districts = getDistricts(localAddress.region);

  return (
    <div className="space-y-3">

      {/* Region */}
      <AutocompleteInput
        label="Region" value={localAddress.region} required error={errors.region}
        placeholder="e.g. Dodoma"
        suggestions={REGIONS}
        onChange={val => updateAddress({ ...localAddress, region: val, district: "", street: "", latitude: null, longitude: null })}
        onSelect={val => updateAddress({ ...localAddress, region: val, district: "", street: "", latitude: null, longitude: null })}
      />

      {/* District */}
      <AutocompleteInput
        label="District" value={localAddress.district} required error={errors.district}
        placeholder={localAddress.region ? `Districts of ${localAddress.region}` : "Select region first"}
        suggestions={districts}
        disabled={!localAddress.region}
        onChange={val => updateAddress({ ...localAddress, district: val, street: "" })}
        onSelect={val => updateAddress({ ...localAddress, district: val, street: "" })}
      />

      {/* Street — NEVER disabled, so GPS fill always shows */}
      <div className="relative">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Street / Village <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={localAddress.street}
            onChange={e => handleStreetChange(e.target.value)}
            placeholder="Type street or village name…"
            autoComplete="off"
            className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-400 transition pr-8
              ${errors.street ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}
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
        {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
        {streetSuggestions.length > 0 && localAddress.street.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
            {streetSuggestions.map((s, i) => (
              <button key={i} type="button" onMouseDown={() => handleStreetSelect(s)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors first:rounded-t-xl last:rounded-b-xl">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* GPS Button */}
      <button type="button" onClick={handleUseMyLocation} disabled={gpsLoading}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-blue-400 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-all disabled:opacity-60">
        {gpsLoading ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Reading your location…
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
            Use My Current Location
          </>
        )}
      </button>

      {/* Map toggle */}
      <button type="button" onClick={() => setShowMap(v => !v)}
        className="w-full flex items-center justify-center gap-2 py-2 text-xs text-gray-500 hover:text-blue-600 transition-colors">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
        </svg>
        {showMap ? "Hide Map" : "Show Map (drag pin to fine-tune)"}
      </button>

      {/* Map */}
      {showMap && (
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: "260px" }}>
          <LazyMap center={mapCenter} zoom={mapZoom} markerPos={markerPos} onDrag={handleMarkerDrag} />
        </div>
      )}

      {/* Coordinates saved indicator */}
      {localAddress.latitude && localAddress.longitude && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <p className="text-xs text-green-700 font-medium">
            Location saved: {Number(localAddress.latitude).toFixed(5)}, {Number(localAddress.longitude).toFixed(5)}
          </p>
          {showMap && <p className="text-xs text-green-500 ml-auto">Drag pin to adjust</p>}
        </div>
      )}
    </div>
  );
}