import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import tzFlag from "../assets/tz.png";
import gbFlag from "../assets/gb.png";
import logo from "../assets/upmarket_logo.png";
import translations from "../translations";
import { FaUser, FaInfoCircle, FaTruckMoving, FaHome } from "react-icons/fa";

export default function Header({ cartCount, stickySearch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState("sw");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const t = translations[lang] || translations["sw"];


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
                        flex flex-wrap items-center justify-between gap-2 md:gap-4
                        md:rounded-xl 
                        bg-white/20 backdrop-blur-md 
                        border-b md:border border-white/20 
                        text-yellow-700
                        shadow-lg">

          
         {/* LEFT: MENU BUTTON + LOGO + TITLE */}
<div className="flex items-center gap-1 md:gap-2 whitespace-nowrap flex-1 min-w-0">
  <button
    ref={menuRef}
    onClick={toggleMenu}
    className="text-lg md:text-xl px-2 md:px-3 py-1.5 md:py-2 rounded-full bg-yellow-500 text-white 
               hover:scale-105 md:hover:scale-110 transition active:scale-95
               touch-manipulation flex-shrink-0"
  >
    ☰
  </button>
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-full overflow-hidden 
                            bg-white flex items-center justify-center shadow flex-shrink-0">
              <img src={logo} alt="logo" className="w-6 md:w-7 h-6 md:h-7 object-contain" />
            </div>
            <h1 className="font-bold text-lg md:text-3xl tracking-wide font-[Poppins] 
                           bg-gradient-to-r from-blue-800 via-blue-400 to-blue-600 
                           bg-clip-text text-transparent 
                           transition-all duration-300 
                           hover:scale-105 md:hover:scale-110 hover:brightness-125">
              UDOM Market
            </h1>
          </div>
          
          {/* CENTER: STICKY SEARCH — desktop only, shows when scrolled */}
{stickySearch && (
  <div className="hidden md:flex flex-1 max-w-md">
    {stickySearch}
  </div>
)}
  
          {/* RIGHT: MENU + LANGUAGE */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
           
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
          className="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}
      
    <div
  ref={dropdownRef}
  className={`fixed z-50 transition-all duration-300 ease-in-out
top-0 left-0 w-64 h-screen rounded-none mx-0
bg-white
${menuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"}
`}
>
{/* HEADER - same for both */}
<div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-full overflow-hidden bg-white flex items-center justify-center shadow">
      <img src={logo} alt="logo" className="w-6 h-6 object-contain" />
    </div>
    <span className="font-bold text-gray-800 text-lg">UDOM Market</span>
  </div>
  <button
    onClick={() => setMenuOpen(false)}
    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 font-bold text-lg transition"
  >
    ✕
  </button>
</div>

  {/* MENU ITEMS */}
  <nav className="py-2">
    {menuItems.map((item, index) => (
      <button
        key={index}
        onClick={() => {
          item.action && item.action();
          setMenuOpen(false);
        }}
        className="flex items-center gap-3 w-full px-4 
                   py-4 md:py-3
                   hover:bg-blue-50 transition-all duration-200
                   group border-b border-gray-100 last:border-0
                   active:bg-blue-500/30 md:active:bg-transparent
                   touch-manipulation"
      >
        <span className="text-blue-600 text-xl md:text-base w-5 flex-shrink-0">
          {item.icon}
        </span>
        <span className="font-medium text-gray-700 group-hover:text-blue-700 text-sm">
          {item.label}
        </span>
      </button>
    ))}
  </nav>
</div>
    </>
  );
}