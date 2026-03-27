import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import translations from "../translations";

function RegisterTrader() {
  const navigate = useNavigate();

  const [lang, setLang] = useState("sw");
  const t = translations[lang] || translations["sw"];

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
    confirm_password: ""
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

  // FETCH CATEGORIES
  useEffect(() => {
    axios.get("http://localhost:5000/api/users/categories")
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
      confirm_password: ""
    });

    setReferees([{ name: "", phone: "", relation: "" }]);
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm_password) {
      alert("Passwords do not match");
      return;
    }

    const data = {
      ...form,
      password: form.password,
      addresses: [address],
      referees
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/register-trader",
        data
      );

      alert("Success! ID: " + res.data.user_code);
      navigate("/");

    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-blue-600 text-white">

      {/*<Header />*/}

      <div className="pt-28 flex justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-[95%] max-w-xl p-6 rounded-xl 
                     bg-white/20 backdrop-blur-md border border-white/20 shadow-lg space-y-3">

          <h2 className="text-2xl font-bold text-center">
            {t.register}
          </h2>

          {/* NAMES */}
          <input name="first_name" placeholder={t.first_name} onChange={handleChange} className="input"/>
          <input name="middle_name" placeholder={t.middle_name} onChange={handleChange} className="input"/>
          <input name="last_name" placeholder={t.last_name} onChange={handleChange} className="input"/>

          {/* GENDER */}
          <select name="gender" onChange={handleChange} className="input text-black">
            <option value="">{t.gender}</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          {/* CONTACT */}
          <input name="email" placeholder="Email" onChange={handleChange} className="input"/>
          <input name="phone" placeholder="Phone" onChange={handleChange} className="input"/>

          {/* BUSINESS */}
          <input name="business_name" placeholder={t.business} onChange={handleChange} className="input"/>

          {/* CATEGORY */}
          <select name="category_id" onChange={handleChange} className="input text-black">
            <option value="">{t.category}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* ADDRESS */}
          <h3>{t.address}</h3>
          <input name="region" placeholder="Region" onChange={handleAddressChange} className="input"/>
          <input name="district" placeholder="District" onChange={handleAddressChange} className="input"/>
          <input name="street" placeholder="Street" onChange={handleAddressChange} className="input"/>

          {/* REFEREES */}
          <h3>{t.referee}</h3>

          {referees.map((ref, index) => (
            <div key={index} className="space-y-2 border p-2 rounded">
              <input name="name" placeholder="Name" onChange={(e)=>handleRefereeChange(index,e)} className="input"/>
              <input name="phone" placeholder="Phone" onChange={(e)=>handleRefereeChange(index,e)} className="input"/>
              <input name="relation" placeholder="Relation" onChange={(e)=>handleRefereeChange(index,e)} className="input"/>
            </div>
          ))}

          {referees.length < 3 && (
            <button type="button" onClick={addReferee} className="text-sm text-yellow-300">
              + Add Referee
            </button>
          )}

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="input pr-10"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 cursor-pointer">
              👁️
            </span>
          </div>

          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm Password"
            onChange={handleChange}
            className="input"
          />

          {/* BUTTONS */}
          <div className="flex gap-2">
            <button className="flex-1 bg-yellow-400 text-black py-2 rounded">
              {t.register}
            </button>

            <button type="button" onClick={handleClear}
              className="flex-1 bg-gray-400 py-2 rounded">
              {t.clear}
            </button>

            <button type="button" onClick={() => navigate("/")}
              className="flex-1 bg-red-500 py-2 rounded">
              {t.exit}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default RegisterTrader;