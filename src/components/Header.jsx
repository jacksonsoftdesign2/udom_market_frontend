import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import tzFlag from "../assets/tz.png";
import gbFlag from "../assets/gb.png";
import logo from "../assets/upmarket_logo.png";
import translations from "../translations";
import { FaUser, FaInfoCircle, FaTruckMoving, FaHome } from "react-icons/fa";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState("sw");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const t = translations[lang] || translations["sw"];

  // Get variant based on current page
  const getVariant = () => {
    const path = location.pathname;
    if (path === "/login") return "login";
    if (path === "/register-trader") return "register";
    return "default";
  };

  const variant = getVariant();

  // MENU ITEMS
  const menuItems = [
    { label: t.home, icon: <FaHome />, action: () => navigate("/") },
    { label: t.login, icon: <FaUser />, action: () => navigate("/login") },
    { label: t.register, icon: <FaInfoCircle />, action: () => navigate("/register-trader") },
    { label: t.delivery, icon: <FaTruckMoving />, action: () => navigate("/delivery") },
    { label: t.about, icon: <FaInfoCircle />, action: () => navigate("/about") },
  ];

  const toggleLanguage = () => setLang((prev) => (prev === "sw" ? "en" : "sw"));
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* 🔝 FLOATING HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center md:top-4">
        <div className="w-full md:w-[99%] 
                        md:max-w-screen-2xl md:mx-auto 
                        px-3 md:px-4 py-2 md:py-2
                        flex items-center justify-between gap-2 md:gap-4
                        md:rounded-xl 
                        bg-white/20 backdrop-blur-md 
                        border-b md:border border-white/20 
                        text-yellow-700
                        shadow-lg">

          {/* LEFT: LOGO + TITLE */}
          <div className="flex items-center gap-1 md:gap-2 whitespace-nowrap flex-1 min-w-0">
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-full overflow-hidden 
                            bg-white flex items-center justify-center shadow flex-shrink-0">
              <img src={logo} alt="logo" className="w-6 md:w-7 h-6 md:h-7 object-contain" />
            </div>
            <h1 className="font-bold text-lg md:text-3xl tracking-wide font-[Poppins] 
                           bg-gradient-to-r from-blue-800 via-blue-400 to-blue-600 
                           bg-clip-text text-transparent 
                           transition-all duration-300 
                           hover:scale-105 md:hover:scale-110 hover:brightness-125">
              UDOM
            </h1>
          </div>

          {/* CENTER: SEARCH or TITLE - HIDDEN ON MOBILE */}
          {variant === "default" && (
            <div className="hidden md:flex flex-1 max-w-md relative">
              <input
                type="text"
                placeholder={t.search}
                className="w-full py-2 pl-4 pr-10 rounded-full 
                         bg-white/20 backdrop-blur-md 
                         border border-white/30 
                         text-yellow-700 placeholder:text-yellow-700 
                         outline-none 
                         focus:ring-2 focus:ring-white/50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                🔍
              </span>
            </div>
          )}

          {/* RIGHT: MENU + LANGUAGE */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0" ref={menuRef}>
            {/* MENU */}
            <button
              onClick={toggleMenu}
              className="text-lg md:text-xl px-2 md:px-3 py-1.5 md:py-2 rounded-full bg-yellow-500 text-white 
                         hover:scale-105 md:hover:scale-110 transition active:scale-95
                         touch-manipulation"
            >
              ☰
            </button>

            {/* LANGUAGE */}
            <button
              onClick={toggleLanguage}
              className="p-1 md:p-1.5 rounded-full bg-white/20 
                         hover:scale-105 md:hover:scale-110 transition active:scale-95
                         touch-manipulation"
            >
              <img
                src={lang === "sw" ? tzFlag : gbFlag}
                alt="language"
                className="w-6 md:w-7 h-6 md:h-7 rounded-full object-cover border border-white"
              />
            </button>
          </div>
        </div>
      </div>

      {/* 🔽 DROPDOWN MENU - MOBILE OPTIMIZED */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      
      <div
        ref={dropdownRef}
        className={`fixed z-50
                    md:top-20 md:right-2
                    transition-all duration-300 ease-in-out
                    ${menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
                    
                    md:w-56 md:rounded-2xl md:shadow-2xl
                    md:bg-gradient-to-b md:from-white/95 md:to-blue-50/95 md:backdrop-blur-xl
                    md:border md:border-white/40
                    
                    w-full h-screen top-0 left-0 right-0 bottom-0
                    md:w-56 md:h-auto md:rounded-2xl
                    bg-gradient-to-b from-white/98 to-blue-50/98 backdrop-blur-xl
                    border-0 md:border md:border-white/40
                    text-black overflow-y-auto md:overflow-hidden
                    md:translate-x-0
                    ${menuOpen ? "translate-x-0" : "translate-x-full md:translate-x-10"}
                    md:scale-100
                    ${menuOpen ? "md:scale-100" : "md:scale-95"}
        `}
      >
        {/* CLOSE BUTTON - MOBILE ONLY */}
        <button
          onClick={() => setMenuOpen(false)}
          className="md:hidden absolute top-4 right-4 text-2xl text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>

        {/* MENU HEADER */}
        <div className="px-5 py-4 md:py-4 border-b border-blue-200/50 bg-gradient-to-r from-blue-500/10 to-blue-600/10 mt-12 md:mt-0">
          <h2 className="font-bold text-lg md:text-lg text-blue-800 flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            UDOM Market
          </h2>
          <p className="text-xs md:text-sm text-blue-600 font-medium">{t.menu}</p>
        </div>

        {/* MENU ITEMS */}
        {menuItems.map((item, index) => (
          <div key={index}>
            <button
              onClick={() => {
                item.action && item.action();
                setMenuOpen(false);
              }}
              className="flex items-center gap-4 w-full px-5 py-4 md:py-3
                         hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-blue-600/20
                         hover:md:pl-7 transition-all duration-300 ease-out
                         group relative overflow-hidden
                         active:bg-blue-500/30 md:active:bg-transparent
                         touch-manipulation"
            >
              <div className="hidden md:block absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-blue-600
                            transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              <span className="text-blue-700 text-xl md:text-lg group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                {item.icon}
              </span>
              <span className="font-medium text-gray-800 group-hover:text-blue-800 transition-colors duration-200 text-sm md:text-base">
                {item.label}
              </span>
            </button>

            {index !== menuItems.length - 1 && (
              <div className="border-t border-blue-100/50 mx-2"></div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}