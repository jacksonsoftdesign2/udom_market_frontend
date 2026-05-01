import{ API } from "../api";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import AddressMapPicker from "../components/AddressMapPicker";
import translations from "../translations";
import logo from "../assets/upmarket_logo.png";
import PaymentMockup from "../components/PaymentMockup";

// normalizer function for phone number
function normalizePhone(raw) {
  let p = raw.replace(/[\s\-]/g, "");
  if (/^0[67]\d{8}$/.test(p)) p = "+255" + p.slice(1);
  if (/^255[67]\d{8}$/.test(p)) p = "+" + p;
  if (/^\+255[67]\d{8}$/.test(p)) {
  return p; // compact: +255748399067
}
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

function RegisterTrader() {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const [lang, setLang] = useState("sw");
  const t = translations[lang] || translations["sw"];

  const [categories, setCategories] = useState([]);

  // hii ni kwaajili ya payment mockup tu kwa sasa
const [showPaymentModal, setShowPaymentModal] = useState(false);

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
  latitude: null,
  longitude: null,
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FETCH CATEGORIES

  useEffect(() => {
    axios.get(`${API}/users/categories`)
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

// Auto-dismiss error modal after 10 seconds
useEffect(() => {
  if (!showErrorModal) return;
  const id = setTimeout(() => {
    setShowErrorModal(false);
    setErrorMessage("");
  }, 10000);
  return () => clearTimeout(id);
}, [showErrorModal]);
  
  // HANDLE CHANGE
 const handleChange = (e) => {
  const { name, value } = e.target;
  const noCapFields = ["email", "password", "confirm_password", "phone", "gender", "category_id"];
  setForm({
    ...form,
    [name]: noCapFields.includes(name)
      ? value
      : value.toUpperCase(),
  });
};

// kwa sasa haitumiki kwenye address
 const handleAddressChange = (e) => {
  const { name, value } = e.target;
 setAddress({ ...address, [name]: value.toUpperCase() });
};

  const handleFileChange = (e) => {
    setForm({ ...form, profile_image: e.target.files[0] });
  };

  // REFEREES
 const handleRefereeChange = (index, e) => {
  const { name, value } = e.target;
  const updated = [...referees];
 updated[index][name] = name === "phone" ? value : value.toUpperCase();
  setReferees(updated);
};

  const addReferee = () => {
    if (referees.length < 3) {
      setReferees([...referees, { name: "", phone: "", relation: "" }]);
    }
  };
  //to clear extra referee fields if user added more than 1 referee and then wants to clear the form
  const removeReferee = (index) => {
  setReferees(referees.filter((_, i) => i !== index));
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
        `${API}/payment/register-payment`,
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

const getProfilePictureUrl = () => registrationData?.profile_image || logo;

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
      case 2: {// Contact Information
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
        const normalized = normalizePhone(form.phone);
        if (!/^\+255[67]\d{8}$/.test(normalized)) {
          setErrorMessage("Enter a valid Tanzanian number e.g. 0748 399 067 or +255 748 399 067. Must start with 07 or 06.");
          setShowErrorModal(true);
          return false;
        }
                // Store compact for backend, show spaced for user
       setForm(prev => ({ ...prev, phone: normalized }));
    // Show spaced format to user in the input field
    setTimeout(() => {
      setForm(prev => ({ ...prev, phone: displayPhone(prev.phone) }));
    }, 0);
    return true;
      }
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
  if (address.latitude == null || address.longitude == null) {
    setErrorMessage("Please pin your location on the map or use 'Use My Current Location'");
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
      case 6: {// Security
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

            const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!strongPassword.test(form.password)) {
      setErrorMessage("Password must be 8+ characters with uppercase, lowercase, number and special character (@$!%*?&)");
      setShowErrorModal(true);
      return false;
    }


        if (form.password !== form.confirm_password) {
          setErrorMessage(t.passwords_not_match);
          setShowErrorModal(true);
          return false;
        }
        return true;
      }
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
    setIsSubmitting(true);
    const formData = new FormData();
    
    // Add all form fields
    Object.keys(form).forEach(key => {
  if (key === 'profile_image' && form[key]) {
    formData.append('profile_image', form[key]);
  } else if (key === 'phone') {
    formData.append('phone', form[key].replace(/\s/g, "")); // compact for backend
  } else if (key !== 'confirm_password') {
    formData.append(key, form[key]);
  }
});

    // Add addresses and referees
    formData.append('addresses', JSON.stringify([address]));
    formData.append('referees', JSON.stringify(referees));

    try {
      const res = await axios.post(
        `${API}/users/register-trader`,
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
  profile_image: form.profile_image instanceof File
    ? URL.createObjectURL(form.profile_image)
    : form.profile_image
});
           setCopied(false);
           setShowSuccessModal(true);
      


    } catch (err) {
      const errorMsg = err.response?.data?.error || "Registration failed. Please try again.";
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      {/* SUCCESS MODAL */}

      {isSubmitting && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-4">
      {/* Logo with spinning ring around it */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div
  className="absolute inset-0 rounded-full animate-spin"
  style={{
    background: "conic-gradient(from 0deg, transparent 0%, #2563eb 100%)",
    WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 4px))",
    mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), white calc(100% - 4px))"
  }}
></div>
        <img src={logo} alt="logo" className="w-16 h-16 object-contain" />
      </div>
      <p className="text-gray-700 font-semibold text-lg">Registering...</p>
      <p className="text-gray-400 text-sm">Please wait</p>
    </div>
  </div>
)}



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
         
       <div className="flex items-center justify-center gap-3 mt-2">
  <p className="text-lg font-semibold text-green-600">
    ID: {registrationData?.user_code}
  </p>

 <button
  type="button"
  onClick={async () => {
    try {
      await navigator.clipboard.writeText(registrationData?.user_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  }}
  className="flex items-center gap-1 bg-gray-100 hover:bg-green-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
>
  {copied ? (
    <>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Copied
    </>
  ) : (
    <>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      Copy
    </>
  )}
</button>
</div>
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

                //hii ndo original nitairudisha
                 // onClick={handlePayment}


                //hii ni kwaajili ya payment mockup for now
                 onClick={() => setShowPaymentModal(true)}
                  disabled={paymentProcessing}
                  className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-500 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentProcessing ? "Processing..." : "Proceed to Payment"}
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);

                    localStorage.setItem("user_code", registrationData?.user_code);
                    navigate("/login", {
                      state: { user_code: registrationData?.user_code }
                    });
                              }}
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
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden border border-red-100">

      {/* Soft header */}
      <div className="bg-red-50 px-5 py-4 flex items-center gap-3 border-b border-red-100">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div>
          <p className="font-semibold text-red-700 text-sm">{t.error}</p>
          <p className="text-xs text-red-400">{t.something_went_wrong}</p>
        </div>
        {/* Auto-dismiss progress bar */}
        <div className="ml-auto w-1 self-stretch rounded-full bg-red-100 overflow-hidden">
          <div className="w-full bg-green-500 rounded-full animate-[shrink_10s_linear_forwards]" style={{height: "100%"}}/>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        <p className="text-gray-600 text-sm mb-4">{errorMessage}</p>
        <div className="space-y-2">
          {(errorMessage.includes("already registered") || errorMessage.includes("already in use")) && (
            <button
              onClick={() => { setShowErrorModal(false); navigate("/login"); }}
              className="w-full bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-all"
            >
              Go to Login
            </button>
          )}
          <button
            onClick={() => { setShowErrorModal(false); setErrorMessage(""); }}
            className="w-full bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
          >
            {t.try_again}
          </button>
        </div>
      </div>
    </div>
  </div>
)}



{showPaymentModal && (
  <PaymentMockup onClose={() => setShowPaymentModal(false)} />
)}



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
              <div className="flex items-center justify-between mb-3 gap-0.5 md:gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                  <div key={step} className="flex items-center flex-1 min-w-0">
                    <div className={`w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-white text-xs md:text-base flex-shrink-0 ${currentStep >= step ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      {step}
                    </div>
                    {step < 7 && (
                      <div className={`flex-1 h-1 mx-0.5 md:mx-2 min-w-0 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    )}
                  </div>
                ))}
              </div>
            <p className="text-xs md:text-sm text-gray-600 text-center">{t.step} {currentStep} {t.of} {totalSteps}</p>
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
                  <AddressMapPicker
                    address={address}
                    onChange={setAddress}
                  />
                </div>
              )}

           {/* Step 5: Referees */}
{currentStep === 5 && (
  <div className="bg-gray-50 p-4 rounded-xl">
    <h3 className="text-lg font-semibold text-gray-800 mb-3">{t.referee}</h3>
    {referees.map((ref, index) => (
      <div key={index} className="bg-white p-3 rounded-lg mb-3 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">Mdhamini {index + 1}</span>
          {index > 0 && (
            <button
              type="button"
              onClick={() => removeReferee(index)}
              className="text-red-500 hover:text-red-700 font-bold text-lg border border-blue-500 rounded-full w-6 h-6 flex items-center justify-center transition-all"
            >
              ✕
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input name="name" placeholder="Name" value={ref.name} onChange={(e) => handleRefereeChange(index, e)} className="input" />
          <input name="phone" placeholder="Phone" value={ref.phone} onChange={(e) => handleRefereeChange(index, e)} className="input" />
          <input name="relation" placeholder="Relation" value={ref.relation} onChange={(e) => handleRefereeChange(index, e)} className="input" />
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

    {/* Password field */}
    <div className="relative mb-3">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </span>
      <input
        type={showPassword ? "text" : "password"}
        name="password"
        placeholder={t.password}
        value={form.password}
        onChange={handleChange}
        className="input-icon-both"
        required
      />
      <span onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600">
        {showPassword ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </span>
    </div>



    {/* Strength bar */}
{form.password.length > 0 && (() => {
  const checks = {
    length:    form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number:    /\d/.test(form.password),
    special:   /[@$!%*?&]/.test(form.password),
  };
  const strength = Object.values(checks).filter(Boolean).length;
  const strengthLabel = ["", "Weak", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"][strength];

  return (
    <div className="mt-2 mb-3">
      {/* Bar */}
      <div className="flex gap-1 mb-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-gray-200"}`} />
        ))}
      </div>
      <p className="text-xs text-gray-400 mb-2">Strength: <span className="font-semibold text-gray-600">{strengthLabel}</span></p>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1">
        {[
          { key: "length",    label: "8+ characters" },
          { key: "uppercase", label: "Uppercase letter" },
          { key: "lowercase", label: "Lowercase letter" },
          { key: "number",    label: "Number" },
          { key: "special",   label: "Special char (@$!%*?&)" },
        ].map(r => (
          <div key={r.key} className={`flex items-center gap-1 text-xs ${checks[r.key] ? "text-green-600" : "text-gray-400"}`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke={checks[r.key] ? "#22c55e" : "#d1d5db"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {r.label}
          </div>
        ))}
      </div>
    </div>
  );
})()}

    {/* Confirm password field */}
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </span>
      <input
        type="password"
        name="confirm_password"
        placeholder={t.confirm_password}
        value={form.confirm_password}
        onChange={handleChange}
        className="input-icon-both"
        required
      />
      {/* Match indicator */}
      {form.confirm_password.length > 0 && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {form.password === form.confirm_password ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          )}
        </span>
      )}
  </div>
    {form.confirm_password && form.confirm_password !== form.password && (
      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
    )}
    {form.confirm_password && form.confirm_password === form.password && (
      <p className="text-xs text-green-500 mt-1">✓ Passwords match</p>
    )}
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
                    <div className="col-span-2"><span className="text-gray-600">{t.phone}:</span> <span className="font-medium">{displayPhone(form.phone)}</span></div>
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
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-all">
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