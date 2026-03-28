import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import translations from "../translations";
import logo from "../assets/upmarket_logo.png";
import { FaUser, FaInfoCircle, FaTruckMoving, FaHome } from "react-icons/fa";
function RegisterTrader() {
  const navigate = useNavigate();
 action: () => navigate("/register-trader")
  const [lang, setLang] = useState("sw");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const t = translations[lang] || translations["sw"];

  const toggleLanguage = () => {
    setLang((prev) => (prev === "sw" ? "en" : "sw"));
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  // 🔥 Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // MENU ITEMS
  const menuItems = [
    { label: t.home, icon: <FaHome />, action: () => navigate("/") },
    { label: t.login, icon: <FaUser />, action: () => navigate("/login") },
    { label: t.register, icon: <FaInfoCircle />, action: () => navigate("/register-trader") },
    { label: t.delivery, icon: <FaTruckMoving />, action: () => navigate("/delivery") },
    { label: t.about, icon: <FaInfoCircle />, action: () => navigate("/about") },
  ];

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    gender: "",
    email: "",
    phone: "",
    business_name: "",
    category_id: "",
    password: "",
    confirm_password: "",
    profile_image: null
  });

  const [address, setAddress] = useState({
    type: "shop",
    region: "",
    district: "",
    street: "",
    is_primary: true,
  });

  const [referees, setReferees] = useState([
    { name: "", phone: "", relation: "" }
  ]);

  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [registrationData, setRegistrationData] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // FETCH CATEGORIES

  useEffect(() => {
    axios.get("http://localhost:3000/api/users/categories")
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  // HANDLE CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, profile_image: e.target.files[0] });
  };

  // REFEREES
  const handleRefereeChange = (index, e) => {
    const updated = [...referees];
    updated[index][e.target.name] = e.target.value;
    setReferees(updated);
  };

  const addReferee = () => {
    if (referees.length < 3) {
      setReferees([...referees, { name: "", phone: "", relation: "" }]);
    }
  };

  // CLEAR
  const handleClear = () => {
    setForm({
      first_name: "",
      middle_name: "",
      last_name: "",
      gender: "",
      email: "",
      phone: "",
      business_name: "",
      category_id: "",
      password: "",
      confirm_password: "",
      profile_image: null
    });

    setReferees([{ name: "", phone: "", relation: "" }]);
  };

  // HANDLE PAYMENT
  const handlePayment = async () => {
    setPaymentProcessing(true);
    try {
      // Simulate payment processing with Stripe/PayPal
      // In real implementation, integrate with payment gateway
      const paymentData = {
        user_code: registrationData.user_code,
        email: registrationData.email,
        amount: 10000, // Registration fee in cents
        currency: 'TZS'
      };

      const res = await axios.post(
        "http://localhost:3000/api/payment/register-payment",
        paymentData
      );

      if (res.data.success) {
        setShowSuccessModal(false);
        navigate("/");
      }
    } catch (err) {
      setErrorMessage("Payment failed: " + (err.response?.data?.error || "Please try again"));
      setShowErrorModal(true);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const getProfilePictureUrl = () => {
    if (registrationData?.profile_image instanceof File) {
      return URL.createObjectURL(registrationData.profile_image);
    }
    return registrationData?.profile_image || logo;
  };

  // VALIDATE STEP
  const validateStep = (step) => {
    switch (step) {
      case 1: // Personal Information
        if (!form.first_name.trim()) {
          setErrorMessage("First name is required");
          setShowErrorModal(true);
          return false;
        }
        if (!form.last_name.trim()) {
          setErrorMessage("Last name is required");
          setShowErrorModal(true);
          return false;
        }
        if (!form.gender) {
          setErrorMessage("Gender is required");
          setShowErrorModal(true);
          return false;
        }
        if (!form.profile_image) {
          setErrorMessage("Profile picture (passport) is required");
          setShowErrorModal(true);
          return false;
        }
        return true;
      case 2: // Contact Information
        if (!form.email.trim()) {
          setErrorMessage("Email is required");
          setShowErrorModal(true);
          return false;
        }
        if (!/^\S+@\S+\.\S+$/.test(form.email)) {
          setErrorMessage("Please enter a valid email");
          setShowErrorModal(true);
          return false;
        }
        if (!form.phone.trim()) {
          setErrorMessage("Phone number is required");
          setShowErrorModal(true);
          return false;
        }
        return true;
      case 3: // Business Information
        if (!form.business_name.trim()) {
          setErrorMessage("Business name is required");
          setShowErrorModal(true);
          return false;
        }
        if (!form.category_id) {
          setErrorMessage("Business category is required");
          setShowErrorModal(true);
          return false;
        }
        return true;
      case 4: // Address
        if (!address.region.trim()) {
          setErrorMessage("Region is required");
          setShowErrorModal(true);
          return false;
        }
        if (!address.district.trim()) {
          setErrorMessage("District is required");
          setShowErrorModal(true);
          return false;
        }
        if (!address.street.trim()) {
          setErrorMessage("Street is required");
          setShowErrorModal(true);
          return false;
        }
        return true;
      case 5: // Referees
        if (referees.some(ref => !ref.name.trim() || !ref.phone.trim() || !ref.relation.trim())) {
          setErrorMessage("All referee fields are required");
          setShowErrorModal(true);
          return false;
        }
        return true;
      case 6: // Security
        if (!form.password) {
          setErrorMessage("Password is required");
          setShowErrorModal(true);
          return false;
        }
        if (!form.confirm_password) {
          setErrorMessage("Please confirm your password");
          setShowErrorModal(true);
          return false;
        }
        if (form.password !== form.confirm_password) {
          setErrorMessage(t.passwords_not_match);
          setShowErrorModal(true);
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  // HANDLE NEXT STEP
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  // HANDLE PREVIOUS STEP
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation
    if (!validateStep(6)) {
      return;
    }

    const formData = new FormData();
    
    // Add all form fields
    Object.keys(form).forEach(key => {
      if (key === 'profile_image' && form[key]) {
        formData.append('profile_image', form[key]);
      } else if (key !== 'confirm_password') {
        formData.append(key, form[key]);
      }
    });

    // Add addresses and referees
    formData.append('addresses', JSON.stringify([address]));
    formData.append('referees', JSON.stringify(referees));

    try {
      const res = await axios.post(
        "http://localhost:3000/api/users/register-trader",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setRegistrationData({
        user_code: res.data.user_code,
        name: form.first_name + " " + form.last_name,
        email: form.email,
        profile_image: form.profile_image
      });
      setShowSuccessModal(true);

    } catch (err) {
      const errorMsg = err.response?.data?.error || "Registration failed. Please try again.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    }
  };

  return (
    <>
      <Header lang={lang} toggleLanguage={toggleLanguage} toggleMenu={toggleMenu} menuRef={menuRef} t={t} variant="registration" />

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Green Header */}
            <div className="bg-gradient-to-r from-green-400 to-green-600 p-6 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">🎉 Congratulations!</h2>
              <p className="text-green-50">Registration Successful</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Profile Picture */}
              <div className="text-center mb-4">
                <img
                  src={getProfilePictureUrl()}
                  alt={registrationData?.name}
                  className="w-24 h-24 rounded-full mx-auto border-4 border-green-400 object-cover shadow-lg"
                />
              </div>

              {/* User Info */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{registrationData?.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{registrationData?.email}</p>
                <p className="text-lg font-semibold text-green-600">ID: {registrationData?.user_code}</p>
              </div>

              {/* Payment Info */}
              <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-200">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Registration Fee:</strong>
                </p>
                <p className="text-3xl font-bold text-blue-600">TZS 10,000</p>
                <p className="text-xs text-gray-500 mt-1">
                  Complete payment to activate your trader account
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handlePayment}
                  disabled={paymentProcessing}
                  className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-500 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentProcessing ? "Processing..." : "Proceed to Payment"}
                </button>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all"
                >
                  Close for Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Red Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-700 p-6 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">❌ {t.error}</h2>
              <p className="text-red-50">{t.something_went_wrong}</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-700 text-center mb-6 text-lg">
                {errorMessage}
              </p>

              {/* Action Button */}
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setErrorMessage("");
                }}
                className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-800 transition-all"
              >
                {t.try_again}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔽 DROPDOWN MENU */}
      <div
        ref={menuRef}
        className={`fixed top-20 right-2 z-50
                    w-56 rounded-2xl
                    bg-gradient-to-b from-white/95 to-blue-50/95 backdrop-blur-xl
                    border border-white/40 shadow-2xl
                    text-black overflow-hidden
                    transition-all duration-300 ease-in-out
                    ${
                      menuOpen
                        ? "opacity-100 translate-x-0 scale-100"
                        : "opacity-0 translate-x-10 scale-95 pointer-events-none"
                    }`}
      >
        {/* MENU HEADER */}
        <div className="px-5 py-4 border-b border-blue-200/50 bg-gradient-to-r from-blue-500/10 to-blue-600/10">
          <h2 className="font-bold text-lg text-blue-800 flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            UDOM Market
          </h2>
          <p className="text-sm text-blue-600 font-medium">{t.menu}</p>
        </div>

        {/* MENU ITEMS */}
        {menuItems.map((item, index) => (
          <div key={index}>
            <button
            onClick={() =>{
              item.action && item.action();
              setMenuOpen(false);
            }}
              className="flex items-center gap-4 w-full px-5 py-3
                         hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-blue-600/20
                         hover:pl-7 transition-all duration-300 ease-out
                         group relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600
                            transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              <span className="text-blue-700 text-lg group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </span>
              <span className="font-medium text-gray-800 group-hover:text-blue-800 transition-colors duration-200">
                {item.label}
              </span>
            </button>

            {index !== menuItems.length - 1 && (
              <div className="border-t border-blue-100/50 mx-2"></div>
            )}
          </div>
        ))}
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-center p-4 pt-20">
        {/* Small Screen Welcome Section */}
        <div className="md:hidden text-center mb-6">
          <img 
            src={logo}
            alt="UDOM Market Logo"
            className="w-16 h-16 mx-auto mb-2 object-contain"
          />
          <h2 className="text-xl font-bold text-gray-800">{t.register}</h2>
          <p className="text-sm text-gray-600 mt-1">{t.subtitle}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">
        {/* Welcome Card - Hidden on Small Screens */}
        <div className="hidden md:flex w-full md:w-1/2 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-6">
              <img 
                src={logo}
                alt="UDOM Market Logo"
                className="w-32 h-32 mx-auto mb-4 object-contain"
              />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{t.title}</h1>
              <p className="text-gray-600">{t.subtitle}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-2">{t.register}</h2>
              <p className="text-sm opacity-90">{t.promo}</p>
            </div>
          </div>
        </div>

        {/* Registration Form Card */}
        <div className="w-full md:w-1/2 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      {step}
                    </div>
                    {step < 7 && (
                      <div className={`flex-1 h-1 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    )}
                  </div>
                ))}
              </div>
            <p className="text-sm text-gray-600 text-center">{t.step} {currentStep} {t.of} {totalSteps}</p>
            </div>

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{t.personal_info}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input name="first_name" placeholder={t.first_name} value={form.first_name} onChange={handleChange} className="input" required />
                  <input name="middle_name" placeholder={t.middle_name} value={form.middle_name} onChange={handleChange} className="input" />
                  <input name="last_name" placeholder={t.last_name} value={form.last_name} onChange={handleChange} className="input" required />
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.gender} *</label>
                  <div className="flex gap-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={form.gender === 'male'}
                        onChange={handleChange}
                        className="mr-2"
                        required
                      />
                      {t.male}
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={form.gender === 'female'}
                        onChange={handleChange}
                        className="mr-2"
                        required
                      />
                      {t.female}
                    </label>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.profile_image} *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                  {form.profile_image && (
                    <p className="text-sm text-green-600 mt-1">
                      {t.selected}: {form.profile_image.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{t.contact_info}</h3>
                <input name="email" placeholder={t.email} type="email" value={form.email} onChange={handleChange} className="input" required />
                <input name="phone" placeholder={t.phone} value={form.phone} onChange={handleChange} className="input mt-3" required />
              </div>
            )}

            {/* Step 3: Business Information */}
            {currentStep === 3 && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{t.business_info}</h3>
                <input name="business_name" placeholder={t.business} value={form.business_name} onChange={handleChange} className="input" required />
                <select name="category_id" value={form.category_id} onChange={handleChange} className="input text-black mt-3" required>
                  <option value="">{t.category}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Step 4: Address */}
            {currentStep === 4 && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{t.address}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input name="region" placeholder={t.region} value={address.region} onChange={handleAddressChange} className="input" required />
                  <input name="district" placeholder={t.district} value={address.district} onChange={handleAddressChange} className="input" required />
                  <input name="street" placeholder={t.street} value={address.street} onChange={handleAddressChange} className="input" required />
                </div>
              </div>
            )}

            {/* Step 5: Referees */}
            {currentStep === 5 && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{t.referee}</h3>
                {referees.map((ref, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg mb-3 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input name="name" placeholder="Name" value={ref.name} onChange={(e)=>handleRefereeChange(index,e)} className="input" required />
                      <input name="phone" placeholder="Phone" value={ref.phone} onChange={(e)=>handleRefereeChange(index,e)} className="input" required />
                      <input name="relation" placeholder="Relation" value={ref.relation} onChange={(e)=>handleRefereeChange(index,e)} className="input" required />
                    </div>
                  </div>
                ))}
                {referees.length < 3 && (
                  <button type="button" onClick={addReferee} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    + {t.add_referee}
                  </button>
                )}
              </div>
            )}

            {/* Step 6: Security/Password */}
            {currentStep === 6 && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{t.security}</h3>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={t.password}
                    value={form.password}
                    onChange={handleChange}
                    className="input pr-10"
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 cursor-pointer text-gray-500"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </span>
                </div>
                <input
                  type="password"
                  name="confirm_password"
                  placeholder={t.confirm_password}
                  value={form.confirm_password}
                  onChange={handleChange}
                  className="input mt-3"
                  required
                />
              </div>
            )}

            {/* Step 7: Review/Summary */}
            {currentStep === 7 && (
              <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.review_info}</h3>
                
                {/* Personal Information Review */}
                <div className="bg-white p-3 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-semibold text-gray-800 mb-2">📋 {t.personal_info}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-600">{t.first_name}:</span> <span className="font-medium">{form.first_name}</span></div>
                    <div><span className="text-gray-600">{t.last_name}:</span> <span className="font-medium">{form.last_name}</span></div>
                    {form.middle_name && <div><span className="text-gray-600">{t.middle_name}:</span> <span className="font-medium">{form.middle_name}</span></div>}
                    <div><span className="text-gray-600">{t.gender}:</span> <span className="font-medium capitalize">{form.gender === 'male' ? t.male : form.gender === 'female' ? t.female : form.gender}</span></div>
                    <div className="col-span-2"><span className="text-gray-600">{t.profile_image}:</span> <span className="text-green-600 font-medium">✓ {t.uploaded}</span></div>
                  </div>
                </div>

                {/* Contact Information Review */}
                <div className="bg-white p-3 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-gray-800 mb-2">📧 {t.contact_info}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="col-span-2"><span className="text-gray-600">{t.email}:</span> <span className="font-medium">{form.email}</span></div>
                    <div className="col-span-2"><span className="text-gray-600">{t.phone}:</span> <span className="font-medium">{form.phone}</span></div>
                  </div>
                </div>

                {/* Business Information Review */}
                <div className="bg-white p-3 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-semibold text-gray-800 mb-2">🏪 {t.business_info}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="col-span-2"><span className="text-gray-600">{t.business}:</span> <span className="font-medium">{form.business_name}</span></div>
                    <div className="col-span-2"><span className="text-gray-600">{t.category}:</span> <span className="font-medium">{categories.find(c => c.id == form.category_id)?.name || 'Selected'}</span></div>
                  </div>
                </div>

                {/* Address Review */}
                <div className="bg-white p-3 rounded-lg border-l-4 border-orange-500">
                  <h4 className="font-semibold text-gray-800 mb-2">📍 {t.address}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-600">{t.region}:</span> <span className="font-medium">{address.region}</span></div>
                    <div><span className="text-gray-600">{t.district}:</span> <span className="font-medium">{address.district}</span></div>
                    <div className="col-span-2"><span className="text-gray-600">{t.street}:</span> <span className="font-medium">{address.street}</span></div>
                  </div>
                </div>

                {/* Referees Review */}
                <div className="bg-white p-3 rounded-lg border-l-4 border-red-500">
                  <h4 className="font-semibold text-gray-800 mb-2">👥 {t.referee_info}</h4>
                  <div className="space-y-2 text-sm">
                    {referees.map((ref, idx) => (
                      <div key={idx} className="bg-gray-50 p-2 rounded">
                        <div><span className="text-gray-600">{t.first_name}:</span> <span className="font-medium">{ref.name}</span></div>
                        <div><span className="text-gray-600">{t.phone}:</span> <span className="font-medium">{ref.phone}</span></div>
                        <div><span className="text-gray-600">{t.referee}:</span> <span className="font-medium">{ref.relation}</span></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Review */}
                <div className="bg-white p-3 rounded-lg border-l-4 border-yellow-500">
                  <h4 className="font-semibold text-gray-800 mb-2">🔐 {t.security}</h4>
                  <div className="text-sm">
                    <span className="text-gray-600">Password:</span> <span className="text-green-600 font-medium">✓ {t.set}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm text-blue-800">
                  ✓ {t.allinfo} <strong>{t.register}</strong> {t.toproceed}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep < 7 ? (
                <>
                  <button type="button" onClick={handleNextStep} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all">
                    {t.next}
                  </button>
                </>
              ) : (
                <button type="submit" className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-all">
                  {t.register}
                </button>
              )}
              {currentStep > 1 && (
                <button type="button" onClick={handlePreviousStep} className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all">
                  {t.back}
                </button>
              )}
              <button type="button" onClick={handleClear} className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-all">
                {t.clear}
              </button>
              <button type="button" onClick={() => navigate("/")} className="flex-1 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-all">
                {t.exit}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
    </>
  );
}

export default RegisterTrader;