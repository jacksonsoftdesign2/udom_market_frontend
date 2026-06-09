import { useState, useEffect } from "react";
import { API } from "../../api";
import AdminLayout from "./AdminLayout";
import { FiSave, FiCheck, FiX, FiAlertCircle } from "react-icons/fi";

export default function AdminPaymentSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API}/admin/payment-settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Failed to load payment settings" });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Handle field changes
  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Toggle boolean fields
  const handleToggle = (field) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Save settings
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/payment-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        setMessage({
          type: "success",
          text: "✓ Payment settings updated successfully",
        });
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to update settings",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Error saving settings" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">Payment Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage registration and monthly fees</p>
        </div>
        <div className="bg-white rounded-[4px] p-8 text-center">
          <div className="inline-block w-8 h-8 border-4 border-[#c7d6f5] border-t-[#1a3a8f] rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-3">Loading settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Payment Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure registration and monthly fees for traders</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-5 p-4 rounded-[4px] flex items-start gap-3 border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <FiCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── GLOBAL TOGGLE ── */}
        <div className="md:col-span-2 bg-white rounded-[4px] p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Enable All Payments</h3>

            </div>
            <button
              onClick={() => handleToggle("payments_active")}
              className={`flex-shrink-0 w-14 h-8 rounded-full border-2 transition-all flex items-center p-0.5 ${
                settings?.payments_active
                  ? "bg-green-100 border-green-300"
                  : "bg-gray-100 border-gray-300"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full bg-white transition-transform ${
                  settings?.payments_active ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── REGISTRATION FEE ── */}
        <div className="bg-white rounded-[4px] p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Registration Fee</h3>

          {/* Amount */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount (TZS)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings?.registration_fee || 0}
                onChange={(e) =>
                  handleChange("registration_fee", parseInt(e.target.value) || 0)
                }
                className="flex-1 px-4 py-2.5 border border-[#c7d6f5] rounded-[4px] text-sm focus:outline-none focus:border-[#1a3a8f] bg-white"
                min="0"
                step="1000"
              />
              <span className="text-gray-500 font-medium text-sm">TZS</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {settings?.registration_fee === 0
                ? "Free — traders skip registration payment"
                : `Traders pay TZS ${settings?.registration_fee?.toLocaleString()} to register`}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-between p-3 bg-[#f0f4ff] border border-[#c7d6f5] rounded-[4px]">
            <div>
              <p className="text-sm font-semibold text-[#1a3a8f]">Active</p>
              <p className="text-xs text-gray-500">Show payment option</p>
            </div>
            <button
              onClick={() => handleToggle("registration_active")}
              disabled={!settings?.payments_active}
              className={`flex-shrink-0 w-12 h-7 rounded-full border-2 transition-all flex items-center p-0.5 disabled:opacity-50 ${
                settings?.registration_active
                  ? "bg-green-100 border-green-300"
                  : "bg-gray-100 border-gray-300"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  settings?.registration_active ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── MONTHLY FEE ── */}
        <div className="bg-white rounded-[4px] p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Fee</h3>

          {/* Amount */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount (TZS)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings?.monthly_fee || 0}
                onChange={(e) =>
                  handleChange("monthly_fee", parseInt(e.target.value) || 0)
                }
                className="flex-1 px-4 py-2.5 border border-[#c7d6f5] rounded-[4px] text-sm focus:outline-none focus:border-[#1a3a8f] bg-white"
                min="0"
                step="1000"
              />
              <span className="text-gray-500 font-medium text-sm">TZS</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {settings?.monthly_fee === 0
                ? "Free — traders skip monthly payment"
                : `Traders pay TZS ${settings?.monthly_fee?.toLocaleString()} monthly to keep account active`}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-between p-3 bg-[#f0f4ff] border border-[#c7d6f5] rounded-[4px]">
            <div>
              <p className="text-sm font-semibold text-[#1a3a8f]">Active</p>
              <p className="text-xs text-gray-500">Show payment option</p>
            </div>
            <button
              onClick={() => handleToggle("monthly_active")}
              disabled={!settings?.payments_active}
              className={`flex-shrink-0 w-12 h-7 rounded-full border-2 transition-all flex items-center p-0.5 disabled:opacity-50 ${
                settings?.monthly_active
                  ? "bg-green-100 border-green-300"
                  : "bg-gray-100 border-gray-300"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  settings?.monthly_active ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── SAVE BUTTON ── */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1a3a8f] text-[#F5C518] rounded-[4px] font-semibold text-sm hover:bg-[#0f2460] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-[#F5C518] border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <FiSave size={16} />
              Save Settings
            </>
          )}
        </button>
      </div>

    </AdminLayout>
  );
}