import { API } from "../api";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import AddressMapPicker from "../components/AddressMapPicker";
import translations from "../translations";
import logo from "../assets/upmarket_logo.png";
import PaymentMockup from "../components/PaymentMockup";

function normalizePhone(raw) {
  let p = raw.replace(/[\s\-]/g, "");
  if (/^0[67]\d{8}$/.test(p)) p = "+255" + p.slice(1);
  if (/^255[67]\d{8}$/.test(p)) p = "+" + p;
  if (/^\+255[67]\d{8}$/.test(p)) return p;
  return raw;
}

function displayPhone(compact) {
  if (!compact) return "";
  const p = compact.replace(/\s/g, "");
  if (/^\+255[67]\d{8}$/.test(p)) {
    return `+255 ${p.slice(4, 7)} ${p.slice(7, 10)} ${p.slice(10)}`;
  }
  return compact;
}

const PANEL_SLIDES = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a3a8f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    title: "Your identity matters",
    text: "Fill in your personal details accurately. This helps us verify you as a trusted trader on UDOM Market.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a3a8f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: "Set up your shop",
    text: "Tell us about your business and pin your exact location so customers nearby can find you easily.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a3a8f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "Almost there!",
    text: "Set a strong password to secure your account. You're one step away from joining UDOM Market.",
  },
];

function RegisterTrader() {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const [lang, setLang] = useState("sw");
  const t = translations[lang] || translations["sw"];
  const [categories, setCategories] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [slideDir, setSlideDir] = useState("right");
  const [slideKey, setSlideKey] = useState(0);

  const [form, setForm] = useState({
    first_name: "", middle_name: "", last_name: "", gender: "",
    email: "", phone: "", business_name: "", category_id: "",
    password: "", confirm_password: "", profile_image: null,
  });

  const [address, setAddress] = useState({
    type: "shop", region: "", district: "", street: "",
    latitude: null, longitude: null, is_primary: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [registrationData, setRegistrationData] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`${API}/users/categories`)
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!showErrorModal) return;
    const id = setTimeout(() => { setShowErrorModal(false); setErrorMessage(""); }, 10000);
    return () => clearTimeout(id);
  }, [showErrorModal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const noCapFields = ["email", "password", "confirm_password", "phone", "gender", "category_id"];
    setForm({ ...form, [name]: noCapFields.includes(name) ? value : value.toUpperCase() });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value.toUpperCase() });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, profile_image: e.target.files[0] });
  };

  const handleClear = () => {
    setForm({ first_name: "", middle_name: "", last_name: "", gender: "", email: "", phone: "", business_name: "", category_id: "", password: "", confirm_password: "", profile_image: null });
    setAddress({ type: "shop", region: "", district: "", street: "", latitude: null, longitude: null, is_primary: true });
  };

  const handlePayment = async () => {
    setPaymentProcessing(true);
    try {
      const res = await axios.post(`${API}/payment/register-payment`, {
        user_code: registrationData.user_code, email: registrationData.email, amount: 10000, currency: "TZS",
      });
      if (res.data.success) { setShowSuccessModal(false); navigate("/"); }
    } catch (err) {
      setErrorMessage("Payment failed: " + (err.response?.data?.error || "Please try again"));
      setShowErrorModal(true);
    } finally { setPaymentProcessing(false); }
  };

  const getProfilePictureUrl = () => registrationData?.profile_image || logo;

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!form.first_name.trim()) { setErrorMessage("First name is required"); setShowErrorModal(true); return false; }
        if (!form.last_name.trim()) { setErrorMessage("Last name is required"); setShowErrorModal(true); return false; }
        if (!form.gender) { setErrorMessage("Gender is required"); setShowErrorModal(true); return false; }
        if (!form.profile_image) { setErrorMessage("Profile picture (passport) is required"); setShowErrorModal(true); return false; }
        return true;
      case 2: {
        if (!form.email.trim()) { setErrorMessage("Email is required"); setShowErrorModal(true); return false; }
        if (!/^\S+@\S+\.\S+$/.test(form.email)) { setErrorMessage("Please enter a valid email"); setShowErrorModal(true); return false; }
        if (!form.phone.trim()) { setErrorMessage("Phone number is required"); setShowErrorModal(true); return false; }
        const normalized = normalizePhone(form.phone);
        if (!/^\+255[67]\d{8}$/.test(normalized)) {
          setErrorMessage("Enter a valid Tanzanian number e.g. 0748 399 067 or +255 748 399 067. Must start with 07 or 06.");
          setShowErrorModal(true); return false;
        }
        setForm((prev) => ({ ...prev, phone: normalized }));
        setTimeout(() => { setForm((prev) => ({ ...prev, phone: displayPhone(prev.phone) })); }, 0);
        return true;
      }
      case 3:
        if (!form.business_name.trim()) { setErrorMessage("Business name is required"); setShowErrorModal(true); return false; }
        if (!form.category_id) { setErrorMessage("Business category is required"); setShowErrorModal(true); return false; }
        return true;
      case 4:
        if (!address.region.trim()) { setErrorMessage("Region is required"); setShowErrorModal(true); return false; }
        if (!address.district.trim()) { setErrorMessage("District is required"); setShowErrorModal(true); return false; }
        if (!address.street.trim()) { setErrorMessage("Street is required"); setShowErrorModal(true); return false; }
        if (address.latitude == null || address.longitude == null) {
          setErrorMessage("Please pin your location on the map or use 'Use My Current Location'");
          setShowErrorModal(true); return false;
        }
        return true;
      case 5: {
        if (!form.password) { setErrorMessage("Password is required"); setShowErrorModal(true); return false; }
        if (!form.confirm_password) { setErrorMessage("Please confirm your password"); setShowErrorModal(true); return false; }
        const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if (!strongPassword.test(form.password)) {
          setErrorMessage("Password must be 8+ characters with uppercase, lowercase, number and special character (@$!%*?&)");
          setShowErrorModal(true); return false;
        }
        if (form.password !== form.confirm_password) { setErrorMessage(t.passwords_not_match); setShowErrorModal(true); return false; }
        return true;
      }
      default: return true;
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep(1) && validateStep(2)) { setSlideDir("left"); setSlideKey((k) => k + 1); setCurrentStep(2); }
    } else if (currentStep === 2) {
      if (validateStep(3) && validateStep(4)) { setSlideDir("left"); setSlideKey((k) => k + 1); setCurrentStep(3); }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) { setSlideDir("right"); setSlideKey((k) => k + 1); setCurrentStep(currentStep - 1); }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateStep(4)) return;
    if (!validateStep(5)) return;
    setIsSubmitting(true);
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (key === "profile_image" && form[key]) formData.append("profile_image", form[key]);
      else if (key === "phone") formData.append("phone", form[key].replace(/\s/g, ""));
      else if (key !== "confirm_password") formData.append(key, form[key]);
    });
    formData.append("addresses", JSON.stringify([address]));
    try {
      const res = await axios.post(`${API}/users/register-trader`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setRegistrationData({
        user_code: res.data.user_code,
        name: form.first_name + " " + form.last_name,
        email: form.email,
        profile_image: form.profile_image instanceof File ? URL.createObjectURL(form.profile_image) : form.profile_image,
      });
      setCopied(false);
      setShowPreviewModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Registration failed. Please try again.");
      setShowErrorModal(true);
    } finally { setIsSubmitting(false); }
  };

  const passwordChecks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[@$!%*?&]/.test(form.password),
  };
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;
  const strengthLabel = ["", "Weak", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthColor = ["", "bg-red-400", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"][passwordStrength];

  return (
    <>
      <Header />

      <style>{`
        @keyframes slideInFromRight { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideInFromLeft  { from { transform: translateX(-40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {/* MAIN PAGE */}
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white flex flex-col items-center justify-center p-4 pt-24 pb-10">
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl">

          {/* LEFT PANEL */}
          <div className="hidden md:flex flex-col w-full md:w-5/12 bg-white border border-gray-200 rounded-[4px] overflow-hidden">
            <div className="bg-[#1a3a8f] p-6 text-center">
              <div className="w-12 h-12 bg-[#F5C518] rounded-[4px] flex items-center justify-center mx-auto mb-3">
                <span className="text-[#1a3a8f] font-bold text-xl">U</span>
              </div>
              <h1 className="text-[#F5C518] font-semibold text-base">UDOM Market</h1>
              <p className="text-blue-300 text-xs mt-1">Trader Registration</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden min-h-[220px]">
              <div
                key={slideKey}
                className="flex flex-col items-center text-center gap-4"
                style={{ animation: `${slideDir === "left" ? "slideInFromRight" : "slideInFromLeft"} 0.35s ease forwards` }}
              >
                <div className="w-16 h-16 bg-[#e8edf7] rounded-full flex items-center justify-center">
                  {PANEL_SLIDES[currentStep - 1].icon}
                </div>
                <h2 className="text-[#1a3a8f] font-semibold text-base">{PANEL_SLIDES[currentStep - 1].title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed">{PANEL_SLIDES[currentStep - 1].text}</p>
              </div>
            </div>
            <div className="flex justify-center gap-2 py-4 border-t border-gray-100">
              {[1, 2, 3].map((n) => (
                <div key={n} className={`h-1.5 rounded-full transition-all duration-300 ${currentStep === n ? "w-6 bg-[#1a3a8f]" : "w-1.5 bg-gray-200"}`} />
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-full md:w-7/12 bg-white border border-gray-200 rounded-[4px] overflow-hidden">
            <div className="bg-[#1a3a8f] px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[#F5C518] font-semibold text-sm">{t.register}</p>
                <p className="text-blue-300 text-xs mt-0.5">{t.step} {currentStep} {t.of} {totalSteps}</p>
              </div>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => setLang("sw")} className={`px-2.5 py-1 rounded-[3px] text-xs font-semibold border transition-all ${lang === "sw" ? "bg-[#F5C518] text-[#1a3a8f] border-[#F5C518]" : "border-[#2d4fa8] text-blue-300"}`}>SW</button>
                <button type="button" onClick={() => setLang("en")} className={`px-2.5 py-1 rounded-[3px] text-xs font-semibold border transition-all ${lang === "en" ? "bg-[#F5C518] text-[#1a3a8f] border-[#F5C518]" : "border-[#2d4fa8] text-blue-300"}`}>EN</button>
              </div>
            </div>

            <div className="px-5 py-3 border-b border-gray-100">
              <div className="flex items-center">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center flex-1 min-w-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 border-2 transition-all ${currentStep >= step ? "bg-[#1a3a8f] border-[#1a3a8f] text-[#F5C518]" : "bg-white border-gray-200 text-gray-400"}`}>
                      {currentStep > step ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : step}
                    </div>
                    {step < 3 && <div className={`flex-1 h-0.5 mx-1.5 min-w-0 transition-all ${currentStep > step ? "bg-[#1a3a8f]" : "bg-gray-200"}`} />}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                {["Personal & contact", "Business & address", "Password"].map((label, i) => (
                  <span key={i} className={`text-[10px] flex-1 text-center ${currentStep === i + 1 ? "text-[#1a3a8f] font-semibold" : currentStep > i + 1 ? "text-[#1a3a8f]" : "text-gray-400"}`}>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if (validateStep(5)) setShowPreviewModal(true); }} className="p-5 space-y-4">

              {currentStep === 1 && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-[#e8edf7]">
                      <div className="w-5 h-5 bg-[#e8edf7] rounded-[3px] flex items-center justify-center flex-shrink-0">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1a3a8f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                      <span className="text-[#1a3a8f] text-sm font-semibold">{t.personal_info}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-2.5">
                      <input name="first_name" placeholder={t.first_name} value={form.first_name} onChange={handleChange} className="input" required />
                      <input name="middle_name" placeholder={t.middle_name} value={form.middle_name} onChange={handleChange} className="input" />
                      <input name="last_name" placeholder={t.last_name} value={form.last_name} onChange={handleChange} className="input" required />
                    </div>
                    <div className="mb-2.5">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.gender} *</label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="gender" value="male" checked={form.gender === "male"} onChange={handleChange} className="accent-[#1a3a8f]" required />
                          <span className="text-sm text-gray-700">{t.male}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="gender" value="female" checked={form.gender === "female"} onChange={handleChange} className="accent-[#1a3a8f]" required />
                          <span className="text-sm text-gray-700">{t.female}</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.profile_image} *</label>
                      <input type="file" accept="image/*" onChange={handleFileChange}
                        className="w-full px-3 py-2 border border-dashed border-[#c7d6f5] rounded-[3px] bg-[#f5f8ff] text-sm focus:outline-none focus:border-[#1a3a8f] file:mr-3 file:py-1.5 file:px-3 file:rounded-[3px] file:border-0 file:text-xs file:font-semibold file:bg-[#1a3a8f] file:text-[#F5C518] hover:file:bg-[#0f2460] transition-all"
                        required />
                      {form.profile_image && <p className="text-xs text-green-600 mt-1">✓ {t.selected}: {form.profile_image.name}</p>}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-[#e8edf7]">
                      <div className="w-5 h-5 bg-[#e8edf7] rounded-[3px] flex items-center justify-center flex-shrink-0">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1a3a8f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 9.8 19.79 19.79 0 0 1 .07 1.18 2 2 0 0 1 2 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L6.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 14.92z"/></svg>
                      </div>
                      <span className="text-[#1a3a8f] text-sm font-semibold">{t.contact_info}</span>
                    </div>
                    <div className="space-y-2.5">
                      <input name="email" placeholder={t.email} type="email" value={form.email} onChange={handleChange} className="input" required />
                      <input name="phone" placeholder={t.phone} value={form.phone} onChange={handleChange} className="input" required />
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-[#e8edf7]">
                      <div className="w-5 h-5 bg-[#e8edf7] rounded-[3px] flex items-center justify-center flex-shrink-0">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1a3a8f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      </div>
                      <span className="text-[#1a3a8f] text-sm font-semibold">{t.business_info}</span>
                    </div>
                    <div className="space-y-2.5">
                      <input name="business_name" placeholder={t.business} value={form.business_name} onChange={handleChange} className="input" required />
                      <select name="category_id" value={form.category_id} onChange={handleChange} className="input text-black" required>
                        <option value="">{t.category}</option>
                        {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-[#e8edf7]">
                      <div className="w-5 h-5 bg-[#e8edf7] rounded-[3px] flex items-center justify-center flex-shrink-0">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1a3a8f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      </div>
                      <span className="text-[#1a3a8f] text-sm font-semibold">{t.address}</span>
                    </div>
                    <AddressMapPicker address={address} onChange={setAddress} />
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-[#e8edf7]">
                    <div className="w-5 h-5 bg-[#e8edf7] rounded-[3px] flex items-center justify-center flex-shrink-0">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1a3a8f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <span className="text-[#1a3a8f] text-sm font-semibold">{t.security}</span>
                  </div>
                  <div className="relative mb-3">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <input type={showPassword ? "text" : "password"} name="password" placeholder={t.password} value={form.password} onChange={handleChange} className="input-icon-both" required />
                    <span onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600">
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </span>
                  </div>
                  {form.password.length > 0 && (
                    <div className="mt-2 mb-3">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4,5].map((i) => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= passwordStrength ? strengthColor : "bg-gray-200"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">Strength: <span className="font-semibold text-gray-600">{strengthLabel}</span></p>
                      <div className="grid grid-cols-2 gap-1">
                        {[
                          { key: "length", label: "8+ characters" },
                          { key: "uppercase", label: "Uppercase letter" },
                          { key: "lowercase", label: "Lowercase letter" },
                          { key: "number", label: "Number" },
                          { key: "special", label: "Special char (@$!%*?&)" },
                        ].map((r) => (
                          <div key={r.key} className={`flex items-center gap-1 text-xs ${passwordChecks[r.key] ? "text-green-600" : "text-gray-400"}`}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={passwordChecks[r.key] ? "#22c55e" : "#d1d5db"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            {r.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </span>
                    <input type="password" name="confirm_password" placeholder={t.confirm_password} value={form.confirm_password} onChange={handleChange} className="input-icon-both" required />
                    {form.confirm_password.length > 0 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {form.password === form.confirm_password ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        )}
                      </span>
                    )}
                  </div>
                  {form.confirm_password && form.confirm_password !== form.password && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
                  {form.confirm_password && form.confirm_password === form.password && <p className="text-xs text-green-500 mt-1">✓ Passwords match</p>}
                  <div className="mt-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-[3px] px-3 py-2.5 text-xs text-[#1e40af]">
                    Click <strong>Preview & submit</strong> below to review all your details before registering.
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {currentStep < 3 ? (
                  <button type="button" onClick={handleNextStep} className="flex-1 bg-[#1a3a8f] text-[#F5C518] py-2.5 rounded-[3px] text-sm font-semibold hover:bg-[#0f2460] transition-all">{t.next}</button>
                ) : (
                  <button type="submit" className="flex-1 bg-[#1a3a8f] text-[#F5C518] py-2.5 rounded-[3px] text-sm font-semibold hover:bg-[#0f2460] transition-all">Preview & submit</button>
                )}
                {currentStep > 1 && (
                  <button type="button" onClick={handlePreviousStep} className="flex-1 bg-white text-gray-600 py-2.5 rounded-[3px] text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-all">{t.back}</button>
                )}
                <button type="button" onClick={handleClear} className="flex-1 bg-white text-gray-500 py-2.5 rounded-[3px] text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-all">{t.clear}</button>
                <button type="button" onClick={() => navigate("/")} className="flex-1 bg-white text-red-500 py-2.5 rounded-[3px] text-sm font-semibold border border-red-100 hover:bg-red-50 transition-all">{t.exit}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />

      {/* ── SUBMITTING OVERLAY ── */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-4">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full animate-spin"
                style={{
                  background: "conic-gradient(from 0deg, transparent 0%, #1a3a8f 100%)",
                  WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 4px))",
                  mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 4px))",
                }}
              />
              <img src={logo} alt="logo" className="w-16 h-16 object-contain" />
            </div>
            <p className="text-gray-700 font-semibold text-lg">Registering...</p>
            <p className="text-gray-400 text-sm">Please wait</p>
          </div>
        </div>
      )}

      {/* ── PREVIEW MODAL ── */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowPreviewModal(false)}>
          <div className="bg-white rounded-t-[4px] md:rounded-[4px] w-full md:max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#1a3a8f] px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[#F5C518] font-semibold text-sm">Review your details</p>
                <p className="text-blue-300 text-xs mt-0.5">Confirm everything before registering</p>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="text-blue-300 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <div className="p-5 max-h-[65vh] overflow-y-auto space-y-3">
              <div className="border border-gray-100 rounded-[4px] overflow-hidden">
                <div className="bg-[#f0f4ff] px-4 py-2"><span className="text-[#1a3a8f] text-xs font-semibold uppercase tracking-wide">{t.personal_info}</span></div>
                <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div><span className="text-gray-500">{t.first_name}:</span> <span className="font-medium text-gray-800">{form.first_name}</span></div>
                  <div><span className="text-gray-500">{t.last_name}:</span> <span className="font-medium text-gray-800">{form.last_name}</span></div>
                  {form.middle_name && <div><span className="text-gray-500">{t.middle_name}:</span> <span className="font-medium text-gray-800">{form.middle_name}</span></div>}
                  <div><span className="text-gray-500">{t.gender}:</span> <span className="font-medium text-gray-800 capitalize">{form.gender === "male" ? t.male : form.gender === "female" ? t.female : form.gender}</span></div>
                  <div className="col-span-2"><span className="text-gray-500">{t.profile_image}:</span> <span className="text-green-600 font-medium">✓ {t.uploaded}</span></div>
                </div>
              </div>
              <div className="border border-gray-100 rounded-[4px] overflow-hidden">
                <div className="bg-[#f0f4ff] px-4 py-2"><span className="text-[#1a3a8f] text-xs font-semibold uppercase tracking-wide">{t.contact_info}</span></div>
                <div className="px-4 py-3 grid grid-cols-1 gap-y-1 text-sm">
                  <div><span className="text-gray-500">{t.email}:</span> <span className="font-medium text-gray-800">{form.email}</span></div>
                  <div><span className="text-gray-500">{t.phone}:</span> <span className="font-medium text-gray-800">{displayPhone(form.phone)}</span></div>
                </div>
              </div>
              <div className="border border-gray-100 rounded-[4px] overflow-hidden">
                <div className="bg-[#f0f4ff] px-4 py-2"><span className="text-[#1a3a8f] text-xs font-semibold uppercase tracking-wide">{t.business_info}</span></div>
                <div className="px-4 py-3 grid grid-cols-1 gap-y-1 text-sm">
                  <div><span className="text-gray-500">{t.business}:</span> <span className="font-medium text-gray-800">{form.business_name}</span></div>
                  <div><span className="text-gray-500">{t.category}:</span> <span className="font-medium text-gray-800">{categories.find((c) => c.id == form.category_id)?.name || "Selected"}</span></div>
                </div>
              </div>
              <div className="border border-gray-100 rounded-[4px] overflow-hidden">
                <div className="bg-[#f0f4ff] px-4 py-2"><span className="text-[#1a3a8f] text-xs font-semibold uppercase tracking-wide">{t.address}</span></div>
                <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div><span className="text-gray-500">{t.region}:</span> <span className="font-medium text-gray-800">{address.region}</span></div>
                  <div><span className="text-gray-500">{t.district}:</span> <span className="font-medium text-gray-800">{address.district}</span></div>
                  <div className="col-span-2"><span className="text-gray-500">{t.street}:</span> <span className="font-medium text-gray-800">{address.street}</span></div>
                  <div className="col-span-2"><span className="text-gray-500">Location:</span> <span className="text-green-600 font-medium">✓ Pinned on map</span></div>
                </div>
              </div>
              <div className="border border-gray-100 rounded-[4px] overflow-hidden">
                <div className="bg-[#f0f4ff] px-4 py-2"><span className="text-[#1a3a8f] text-xs font-semibold uppercase tracking-wide">{t.security}</span></div>
                <div className="px-4 py-3 text-sm"><span className="text-gray-500">Password:</span> <span className="text-green-600 font-medium">✓ {t.set}</span></div>
              </div>
              <div className="bg-[#f0f4ff] border border-[#c7d6f5] rounded-[4px] px-4 py-3 text-sm text-[#1a3a8f]">
                ✓ {t.allinfo} <strong>{t.register}</strong> {t.toproceed}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
              <button type="button" onClick={() => setShowPreviewModal(false)} className="flex-1 py-2.5 rounded-[4px] border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">Edit details</button>
              <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-2.5 rounded-[4px] bg-[#1a3a8f] text-[#F5C518] text-sm font-semibold hover:bg-[#0f2460] transition-all disabled:opacity-50">
                {isSubmitting ? "Registering..." : t.register}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUCCESS MODAL ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-green-400 to-green-600 p-6 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">🎉 Congratulations!</h2>
              <p className="text-green-50">Registration Successful</p>
            </div>
            <div className="p-6">
              <div className="text-center mb-4">
                <img src={getProfilePictureUrl()} alt={registrationData?.name} className="w-24 h-24 rounded-full mx-auto border-4 border-green-400 object-cover shadow-lg" />
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{registrationData?.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{registrationData?.email}</p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <p className="text-lg font-semibold text-green-600">ID: {registrationData?.user_code}</p>
                  <button type="button"
                    onClick={async () => {
                      try { await navigator.clipboard.writeText(registrationData?.user_code); setCopied(true); setTimeout(() => setCopied(false), 2000); }
                      catch (err) { console.error("Copy failed", err); }
                    }}
                    className="flex items-center gap-1 bg-gray-100 hover:bg-green-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  >
                    {copied ? (
                      <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Copied</>
                    ) : (
                      <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>
                    )}
                  </button>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-200">
                <p className="text-sm text-gray-700 mb-2"><strong>Registration Fee:</strong></p>
                <p className="text-3xl font-bold text-blue-600">TZS 10,000</p>
                <p className="text-xs text-gray-500 mt-1">Complete payment to activate your trader account</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => setShowPaymentModal(true)} disabled={paymentProcessing}
                  className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-500 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {paymentProcessing ? "Processing..." : "Proceed to Payment"}
                </button>
                <button onClick={() => { setShowSuccessModal(false); localStorage.setItem("user_code", registrationData?.user_code); navigate("/login", { state: { user_code: registrationData?.user_code } }); }}
                  className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all">
                  Close for Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ERROR MODAL ── */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden border border-red-100">
            <div className="bg-red-50 px-5 py-4 flex items-center gap-3 border-b border-red-100">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-700 text-sm">{t.error}</p>
                <p className="text-xs text-red-400">{t.something_went_wrong}</p>
              </div>
              <div className="ml-auto w-1 self-stretch rounded-full bg-red-100 overflow-hidden">
                <div className="w-full bg-green-500 rounded-full animate-[shrink_10s_linear_forwards]" style={{ height: "100%" }} />
              </div>
            </div>
            <div className="px-5 py-4">
              <p className="text-gray-600 text-sm mb-4">{errorMessage}</p>
              <div className="space-y-2">
                {(errorMessage.includes("already registered") || errorMessage.includes("already in use")) && (
                  <button onClick={() => { setShowErrorModal(false); navigate("/login"); }} className="w-full bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-all">Go to Login</button>
                )}
                <button onClick={() => { setShowErrorModal(false); setErrorMessage(""); }} className="w-full bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all">{t.try_again}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PAYMENT MOCKUP ── */}
      {showPaymentModal && (
        <PaymentMockup user={registrationData} onClose={() => setShowPaymentModal(false)} />
      )}

    </>
  );
}

export default RegisterTrader;