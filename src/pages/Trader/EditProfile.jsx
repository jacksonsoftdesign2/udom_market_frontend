import { useState, useRef, useEffect } from "react";

// ── tiny modal wrapper ──────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── read-only field ─────────────────────────────────────────────────
function ReadOnlyField({ label, value, icon }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
      <p className="text-xs text-gray-400 font-medium mb-0.5">{icon} {label}</p>
      <p className="text-sm font-semibold text-gray-700">{value || "—"}</p>
    </div>
  );
}

// ── editable field with Change button ──────────────────────────────
function EditableField({ label, value, icon, onChangClick }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">{icon} {label}</p>
        <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
      </div>
      <button
        onClick={onChangClick}
        className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-100 transition flex-shrink-0 ml-3"
      >
        Change
      </button>
    </div>
  );
}

// ── main component ──────────────────────────────────────────────────
function EditProfile({ user, setUser }) {
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    phone: user?.phone || "",
    business_name: user?.business_name || user?.shop_name || "",
    gender: user?.gender || "",
    profile_image: user?.profile_image || null,
    addresses: [],
    referees: [],
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profile_image || null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [deletingAddrIndex, setDeletingAddrIndex] = useState(null);
  const [deletingRefIndex, setDeletingRefIndex] = useState(null);

  // single-field modal
  const [modal, setModal] = useState(null);
  const [modalValue, setModalValue] = useState("");

  // address modal
  const [addrModal, setAddrModal] = useState(null);
  const emptyAddr = { type: "shop", region: "", district: "", street: "" };

  // referee modal
  const [refModal, setRefModal] = useState(null);
  const emptyRef = { name: "", phone: "", relation: "" };


const deleteAddress = async (index) => {
  const updatedAddresses = profile.addresses.filter((_, i) => i !== index);
  setDeletingAddrIndex(index);
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/update-addresses`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ addresses: updatedAddresses }),
    });
    const data = await res.json();
    if (!res.ok) { showToast("error", data.message || "Failed to delete"); return; }
    setProfile(prev => ({ ...prev, addresses: updatedAddresses }));
    showToast("success", "Address deleted!");
  } catch { showToast("error", "Network error"); }
  finally { setDeletingAddrIndex(null); }
};


const deleteReferee = async (index) => {
  const updatedReferees = profile.referees.filter((_, i) => i !== index);
  setDeletingRefIndex(index);
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/update-referees`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ referees: updatedReferees }),
    });
    const data = await res.json();
    if (!res.ok) { showToast("error", data.message || "Failed to delete"); return; }
    setProfile(prev => ({ ...prev, referees: updatedReferees }));
    showToast("success", "Referee deleted!");
  } catch { showToast("error", "Network error"); }
  finally { setDeletingRefIndex(null); }
};

  // ── fetch full profile ──
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(prev => ({
            ...prev,
            phone: data.phone || prev.phone,
            business_name: data.business_name || prev.business_name,
            gender: data.gender || prev.gender,
            profile_image: data.profile_image || prev.profile_image,
            addresses: data.addresses || [],
            referees: data.referees || [],
          }));
          setImagePreview(data.profile_image || null);
        }
      } catch (e) {
        // use localStorage data silently
      } finally {
        setFetchLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ADD after the existing fetchProfile useEffect
useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(prev => ({
          ...prev,
          phone: data.phone || prev.phone,
          business_name: data.business_name || prev.business_name,
          gender: data.gender || prev.gender,
          profile_image: data.profile_image || prev.profile_image,
          addresses: data.addresses || prev.addresses,
          referees: data.referees || prev.referees,
        }));
        setImagePreview(data.profile_image || null);
        const stored = localStorage.getItem("user");
        const current = stored ? JSON.parse(stored) : {};
        localStorage.setItem("user", JSON.stringify({ ...current, ...data }));
        setUser(prev => ({ ...prev, ...data }));
      }
    } catch (e) {
      // fail silently
    }
  }, 5000);
  return () => clearInterval(interval);
}, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── image handlers ──
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showToast("error", "Image must be less than 10MB"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageSave = async () => {
    if (!imageFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("profile_image", imageFile);
      formData.append("first_name", user?.first_name || "");
      formData.append("last_name", user?.last_name || "");
      formData.append("phone", profile.phone);
      formData.append("business_name", profile.business_name);
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) { showToast("error", data.message || "Failed to update image"); return; }
      const updatedUser = { ...user, ...data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setProfile(prev => ({ ...prev, profile_image: data.user.profile_image }));
      setImagePreview(data.user.profile_image);
      setImageFile(null);
      showToast("success", "Profile photo updated!");
    } catch { showToast("error", "Network error"); }
    finally { setLoading(false); }
  };

  // ── single field modal ──
  const openModal = (field, label, type = "text", options = null) => {
    setModalValue(profile[field] || "");
    setModal({ field, label, type, options });
  };

  const saveField = async () => {
    if (!modalValue.toString().trim()) { showToast("error", "Value cannot be empty"); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const body = {
        first_name: user?.first_name,
        last_name: user?.last_name,
        phone: profile.phone,
        business_name: profile.business_name,
        gender: profile.gender,
        [modal.field]: modalValue,
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { showToast("error", data.message || "Update failed"); return; }
      const updatedUser = { ...user, ...data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setProfile(prev => ({ ...prev, [modal.field]: modalValue }));
      setModal(null);
      showToast("success", `${modal.label} updated!`);
    } catch { showToast("error", "Network error"); }
    finally { setLoading(false); }
  };

  // ── address handlers ──
  const openAddrModal = (mode, index = null) => {
    setAddrModal({
      mode,
      index,
      data: mode === "edit" ? { ...profile.addresses[index] } : { ...emptyAddr },
    });
  };

  const saveAddress = async () => {
    const a = addrModal.data;
    if (!a.region || !a.district || !a.street) { showToast("error", "Fill all address fields"); return; }
     if (addrModal.mode === "add" && profile.addresses.length >= 3) {
      showToast("error", "Maximum 3 addresses allowed"); return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const updatedAddresses = addrModal.mode === "edit"
        ? profile.addresses.map((ad, i) => i === addrModal.index ? a : ad)
        : [...profile.addresses, a];
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/update-addresses`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedAddresses }),
      });
      const data = await res.json();
      if (!res.ok) { showToast("error", data.message || "Failed"); return; }
      setProfile(prev => ({ ...prev, addresses: updatedAddresses }));
      setAddrModal(null);
      showToast("success", "Address saved!");
    } catch { showToast("error", "Network error"); }
    finally { setLoading(false); }
  };

  // ── referee handlers ──
  const openRefModal = (mode, index = null) => {
    setRefModal({
      mode,
      index,
      data: mode === "edit" ? { ...profile.referees[index] } : { ...emptyRef },
    });
  };

  const saveReferee = async () => {
    const r = refModal.data;
    if (!r.name || !r.phone || !r.relation) { showToast("error", "Fill all referee fields"); return; }
    if (refModal.mode === "add" && profile.referees.length >= 3) {
    showToast("error", "Maximum 3 referees allowed"); return;
  }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const updatedReferees = refModal.mode === "edit"
        ? profile.referees.map((rf, i) => i === refModal.index ? r : rf)
        : [...profile.referees, r];
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/update-referees`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ referees: updatedReferees }),
      });
      const data = await res.json();
      if (!res.ok) { showToast("error", data.message || "Failed"); return; }
      setProfile(prev => ({ ...prev, referees: updatedReferees }));
      setRefModal(null);
      showToast("success", "Referee saved!");
    } catch { showToast("error", "Network error"); }
    finally { setLoading(false); }
  };

  const avatarSrc = imagePreview ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user?.first_name} ${user?.last_name}`)}&background=60a5fa&color=fff`;

  if (fetchLoading) return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mr-3" />
      Loading profile...
    </div>
  );

  return (
    <div className="max-w-xl mx-auto space-y-5 pb-10">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* ── PHOTO ── */}
      
       
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex-shrink-0">
            <img src={avatarSrc} alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-450 shadow"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user?.first_name} ${user?.last_name}`)}&background=60a5fa&color=fff`; }}
            />
            <button onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-blue-400 text-white rounded-full flex items-center justify-center shadow hover:bg-blue-600 transition text-xs">
              📷
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
          <div className="text-center">
  {imageFile ? (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">Selected: <span className="font-medium text-gray-700">{imageFile.name}</span></p>
      <div className="flex gap-2 justify-center">
        <button onClick={handleImageSave} disabled={loading}
          className="text-xs bg-blue-500 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-60">
          {loading ? "Saving..." : "Save Photo"}
        </button>
        <button onClick={() => { setImageFile(null); setImagePreview(profile.profile_image); }}
          className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-200 transition">
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <p className="text-xs text-gray-400">Tap the camera icon to change your photo</p>
  )}
</div>
        </div>

      {/* ── READ-ONLY INFO ── */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h3 className="font-bold text-gray-700 text-sm mb-4">🔒 Account Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ReadOnlyField label="First Name" value={user?.first_name} icon="👤" />
          <ReadOnlyField label="Middle Name" value={user?.middle_name} icon="👤" />
          <ReadOnlyField label="Last Name" value={user?.last_name} icon="👤" />
          <ReadOnlyField label="Email" value={user?.email} icon="📧" />
          <ReadOnlyField label="Registration No." value={user?.user_code} icon="🪪" />
          <ReadOnlyField label="Category" value={user?.category_name || user?.category} icon="📋" />
          
        </div>
      </div>

      {/* ── EDITABLE FIELDS ── */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h3 className="font-bold text-gray-700 text-sm mb-4">✏️ Editable Details</h3>
        <div className="space-y-3">
          <EditableField label="Phone Number" value={profile.phone} icon="📞"
            onChangClick={() => openModal("phone", "Phone Number", "tel")} />
          <EditableField label="Business / Shop Name" value={profile.business_name} icon="🏪"
            onChangClick={() => openModal("business_name", "Business Name", "text")} />

          
      
        </div>
      </div>

     {/* ── ADDRESSES ── */}
<div className="bg-white rounded-2xl shadow p-5">
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-bold text-gray-700 text-sm">📍 Addresses</h3>
    {profile.addresses.length < 3 ? (
      <button onClick={() => openAddrModal("add")}
        className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-100 transition">
        + Add
      </button>
    ) : (
      <span className="text-xs text-gray-400">Max 3 reached</span>
    )}
  </div>
  {profile.addresses.length === 0 ? (
    <p className="text-xs text-gray-400 text-center py-4">No addresses added yet</p>
  ) : (
    <div className="space-y-2">
      {profile.addresses.map((addr, i) => (
        <div key={i} className="flex items-start justify-between bg-gray-50 rounded-xl px-4 py-3">
          <div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full mr-2 ${
              addr.type === "shop" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
            }`}>{addr.type}</span>
            <p className="text-sm font-medium text-gray-800 mt-1">{addr.street}, {addr.district}</p>
            <p className="text-xs text-gray-500">{addr.region}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0 ml-3">
            <button onClick={() => openAddrModal("edit", i)}
              className="text-xs bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-50 transition">
              Edit
            </button>
          {profile.addresses.length > 1 && (
  <button
    onClick={() => deleteAddress(i)}
    disabled={deletingAddrIndex === i}
    className="text-xs bg-white text-red-500 border border-red-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-50 transition disabled:opacity-60 flex items-center gap-1"
  >
    {deletingAddrIndex === i ? (
      <>
        <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
        Deleting...
      </>
    ) : "Delete"}
  </button>
)}
          </div>
        </div>
      ))}
    </div>
  )}
</div>


{/* ── REFEREES ── */}
<div className="bg-white rounded-2xl shadow p-5">
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-bold text-gray-700 text-sm">👥 Referees</h3>
    {profile.referees.length < 3 ? (
      <button onClick={() => openRefModal("add")}
        className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-100 transition">
        + Add
      </button>
    ) : (
      <span className="text-xs text-gray-400">Max 3 reached</span>
    )}
  </div>
  {profile.referees.length === 0 ? (
    <p className="text-xs text-gray-400 text-center py-4">No referees added yet</p>
  ) : (
    <div className="space-y-2">
      {profile.referees.map((ref, i) => (
        <div key={i} className="flex items-start justify-between bg-gray-50 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-bold text-gray-800">{ref.name}</p>
            <p className="text-xs text-gray-500">{ref.phone} · {ref.relation}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0 ml-3">
            <button onClick={() => openRefModal("edit", i)}
              className="text-xs bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-50 transition">
              Edit
            </button>
            {profile.referees.length > 1 && (
              <button
                onClick={() => deleteReferee(i)}
                disabled={deletingRefIndex === i}
                className="text-xs bg-white text-red-500 border border-red-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-red-50 transition disabled:opacity-60 flex items-center gap-1"
              >
                {deletingRefIndex === i ? (
                  <>
                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Deleting...
                  </>
                ) : "Delete"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</div>



      {/* ── SINGLE FIELD MODAL ── */}
      {modal && (
        <Modal title={`Change ${modal.label}`} onClose={() => setModal(null)}>
          {modal.type === "select" ? (
            <select value={modalValue} onChange={e => setModalValue(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="">Select...</option>
              {modal.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input type={modal.type} value={modalValue} onChange={e => setModalValue(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={`Enter new ${modal.label.toLowerCase()}`} autoFocus />
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={saveField} disabled={loading}
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-600 transition disabled:opacity-60">
              {loading ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setModal(null)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 transition">
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* ── ADDRESS MODAL ── */}
      {addrModal && (
        <Modal title={addrModal.mode === "add" ? "Add Address" : "Edit Address"} onClose={() => setAddrModal(null)}>
          <div className="space-y-3">
            <select value={addrModal.data.type}
              onChange={e => setAddrModal(p => ({ ...p, data: { ...p.data, type: e.target.value } }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="shop">Shop</option>
              <option value="home">Home</option>
              <option value="other">Other</option>
            </select>
            {["region", "district", "street"].map(f => (
              <input key={f} type="text" placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                value={addrModal.data[f]}
                onChange={e => setAddrModal(p => ({ ...p, data: { ...p.data, [f]: e.target.value } }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={saveAddress} disabled={loading}
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-600 transition disabled:opacity-60">
              {loading ? "Saving..." : "Save Address"}
            </button>
            <button onClick={() => setAddrModal(null)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 transition">
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* ── REFEREE MODAL ── */}
      {refModal && (
        <Modal title={refModal.mode === "add" ? "Add Referee" : "Edit Referee"} onClose={() => setRefModal(null)}>
          <div className="space-y-3">
            {[
              { key: "name", placeholder: "Full Name" },
              { key: "phone", placeholder: "Phone Number" },
              { key: "relation", placeholder: "Relation (e.g. Friend, Colleague)" },
            ].map(({ key, placeholder }) => (
              <input key={key} type="text" placeholder={placeholder}
                value={refModal.data[key]}
                onChange={e => setRefModal(p => ({ ...p, data: { ...p.data, [key]: e.target.value } }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={saveReferee} disabled={loading}
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-600 transition disabled:opacity-60">
              {loading ? "Saving..." : "Save Referee"}
            </button>
            <button onClick={() => setRefModal(null)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold text-sm hover:bg-gray-200 transition">
              Cancel
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
}

export default EditProfile;
