import { useState, useRef } from "react";

function EditProfile({ user, setUser }) {
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
    business_name: user?.business_name || user?.shop_name || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profile_image || null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.phone) {
      setError("First name, last name and phone are required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("first_name", form.first_name);
      formData.append("last_name", form.last_name);
      formData.append("phone", form.phone);
      formData.append("business_name", form.business_name);
      if (imageFile) formData.append("profile_image", imageFile);

      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/update-profile`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Update failed");
        return;
      }

      // ✅ Sync localStorage and parent state
      const updatedUser = { ...user, ...data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSuccess(true);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc =
    imagePreview ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${user?.first_name} ${user?.last_name}`
    )}&background=60a5fa&color=fff`;

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-800">✏️ Edit Profile</h2>

        {/* Avatar picker */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={avatarSrc}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-400 shadow"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  `${user?.first_name} ${user?.last_name}`
                )}&background=60a5fa&color=fff`;
              }}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow hover:bg-blue-600 transition text-sm"
            >
              📷
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />
          <p className="text-xs text-gray-400">
            Tap the camera icon to change photo
          </p>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="First name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Last name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="+255 XXX XXX XXX"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Shop / Business Name
            </label>
            <input
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Your shop name"
            />
          </div>
        </div>

        {/* Read-only fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400 font-medium">Email (read-only)</p>
            <p className="text-sm text-gray-700 font-medium mt-0.5">
              {user?.email || "—"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400 font-medium">
              Registration No. (read-only)
            </p>
            <p className="text-sm text-gray-700 font-medium mt-0.5">
              {user?.user_code || "—"}
            </p>
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-2 rounded-lg">
            ✅ Profile updated successfully!
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "💾 Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default EditProfile;
