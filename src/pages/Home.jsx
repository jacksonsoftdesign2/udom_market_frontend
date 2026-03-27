import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import translations from "../translations";
import logo from "../assets/upmarket_logo.png";
import banner from "../assets/banner.jpg";
import Header from "../components/Header";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";
import { FaUser, FaInfoCircle, FaTruckMoving, FaHome } from "react-icons/fa";

import brand1 from "../assets/brands/brand1.png";
import brand2 from "../assets/brands/brand2.jpg";
import brand3 from "../assets/brands/brand3.jpg";
import brand4 from "../assets/brands/brand4.jpg";
import brand5 from "../assets/brands/brand5.jpg";
import brand6 from "../assets/brands/brand6.jpeg";
import brand7 from "../assets/brands/brand7.png";

function Home() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("sw");
  const [menuOpen, setMenuOpen] = useState(false);
  
  const menuRef = useRef(null);

  const toggleLanguage = () => {
    setLang((prev) => (prev === "sw" ? "en" : "sw"));
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const t = translations[lang] || translations["sw"];

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

  // SAMPLE PRODUCTS
  const traderitems = [
    { name: "Laptop", price: "800,000", imageUrl: brand1, category: "Electronics" },
    { name: "Headphones", price: "50,000", imageUrl: brand2, category: "Electronics" },
    { name: "T-Shirt", price: "20,000", imageUrl: brand3, category: "Clothes" },
    { name: "Shoes", price: "60,000", imageUrl: brand4, category: "Clothes" },
    { name: "Watch", price: "120,000", imageUrl: brand5, category: "Accessories" },
    { name: "Bag", price: "40,000", imageUrl: brand6, category: "Accessories" },
    { name: "Phone", price: "500,000", imageUrl: brand7, category: "Electronics" },
  ];

  return (
    <div className="relative min-h-screen  text-yellow overflow-hidden">

     {/* ❄️ BASE ICE GRADIENT */}
  <div className="fixed inset-0 -z-10 
                  bg-gradient-to-br 
                  from-white via-blue-50 to-white" />

  {/* 💧 SOFT LIGHT REFLECTIONS */}
  <div className="fixed inset-0 -z-10">
    <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] 
                    bg-white/60 rounded-full blur-[120px]" />
    <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] 
                    bg-blue-200/40 rounded-full blur-[120px]" />
  </div>

  {/* 🧊 GLASS OVERLAY */}
  <div className="fixed inset-0 -z-10 backdrop-blur-[6px]" />

  {/* 🖼 WATERMARK LOGO */}
  <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
    <img
      src={logo}
      alt="background"
      className="w-[60vw] max-w-[600px] opacity-40 object-contain"
    />
  </div>


      {/* 🔝 HEADER */}
      <Header
        lang={lang}
        toggleLanguage={toggleLanguage}
        toggleMenu={toggleMenu}
        menuRef={menuRef}
        t={t} //pass translations to header for search placeholder
      />

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
              onClick={() => {
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

      {/* 📄 CONTENT */}
      <div className="pt-28 p-4 relative z-10">

        {/* 🟡 AD BANNER */}
       <div className="mt-0 px-1 flex justify-center">

  <div className="w-[100%] h-[200px] md:h-[300px] lg:h-[350px] md:w-[100%] lg:w-[100%] rounded-xl 
                  relative overflow-hidden shadow-lg">

    {/* 🖼 BACKGROUND IMAGE */}
    <img
      src={banner}
      alt="banner"
      className="absolute inset-0 w-full h-full object-cover object-center"
    />

    {/* 🌑 OVERLAY */}
    <div className="absolute inset-0 bg-black/40"></div>

    {/* ✨ TEXT */}
    <div className="relative z-10 h-full flex flex-col 
                    justify-center px-6 text-white">

      <h2 className="text-2xl md:text-3xl font-bold">
        {t.title}
      </h2>

      <p className="text-white/80">
        {t.subtitle}
      </p>

    </div>

  </div>

</div>

        {/* 🧭 CATEGORIES */}
        <div className="flex gap-3 overflow-x-auto mb-6">
          {["All", "Electronics", "Clothes", "Accessories"].map((cat, i) => (
            <button
              key={i}
              className="px-4 py-2 rounded-full bg-white/30 backdrop-blur-md 
                         text-white whitespace-nowrap hover:bg-white/50"
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 🛍 PRODUCTS */}
        <ProductGrid items={traderitems} t={t} />

      </div>

      {/* 🧾 FOOTER */}
      <Footer />

    </div>
  );
}

export default Home;