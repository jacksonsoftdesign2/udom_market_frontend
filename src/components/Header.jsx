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


const [visitors24h, setVisitors24h] = useState(0);
const [onlineUsers, setOnlineUsers] = useState(0);
const [displayVisitors, setDisplayVisitors] = useState(0);
const [displayOnline, setDisplayOnline] = useState(0);
const [showTooltip, setShowTooltip] = useState(false);
const [weekly, setWeekly] = useState([]);



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

  
// WebSocket connection
useEffect(() => {
  let vid = localStorage.getItem('_vid');
  if (!vid) {
  vid = Math.random().toString(36).slice(2) + Date.now().toString(36);
  localStorage.setItem('_vid', vid);
}

 const ws = new WebSocket(`wss://udom-market-backend.onrender.com?vid=${vid}`);

  ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === 'update') {
      setVisitors24h(data.visitors24h);
      setOnlineUsers(data.onlineNow);
      setWeekly(data.weekly || []);
    }
  };

  return () => ws.close();
}, []);

// Counting animation
useEffect(() => {
  const duration = 1200;
  const steps = 30;
  const intervalTime = duration / steps;
  let vCurrent = displayVisitors;
  let oCurrent = displayOnline;

  const interval = setInterval(() => {
    vCurrent += (visitors24h - vCurrent) * 0.15;
    oCurrent += (onlineUsers - oCurrent) * 0.15;
    if (Math.abs(vCurrent - visitors24h) < 1 && Math.abs(oCurrent - onlineUsers) < 1) {
      setDisplayVisitors(visitors24h);
      setDisplayOnline(onlineUsers);
      clearInterval(interval);
    } else {
      setDisplayVisitors(Math.floor(vCurrent));
      setDisplayOnline(Math.floor(oCurrent));
    }
  }, intervalTime);

  return () => clearInterval(interval);
}, [visitors24h, onlineUsers]);

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
<div
  className="relative flex items-center cursor-pointer select-none"
  onMouseEnter={() => setShowTooltip(true)}
  onMouseLeave={() => setShowTooltip(false)}
  onClick={() => setShowTooltip(prev => !prev)}
>
  {/* MOBILE */}
  <div className="flex md:hidden items-center gap-1.5 bg-slate-900 rounded-full px-3 py-1.5">
    <span className="relative flex h-2 w-2 flex-shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
    </span>
    <span className="text-green-400 text-xs font-bold">{displayOnline}</span>
    <span className="w-px h-3 bg-slate-600"></span>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    <span className="text-blue-400 text-xs font-bold">{displayVisitors.toLocaleString()}</span>
  </div>

  {/* DESKTOP */}
  <div className="hidden md:flex items-center gap-2 bg-slate-900 rounded-full px-4 py-2">
    <span className="relative flex h-2 w-2 flex-shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
    </span>
    <span className="text-green-400 text-sm font-semibold">Online</span>
    <span className="text-green-400 text-sm font-bold">{displayOnline}</span>
    <span className="w-px h-3.5 bg-slate-600"></span>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    <span className="text-blue-400 text-sm font-bold">{displayVisitors.toLocaleString()}</span>
  </div>

  {/* DROPDOWN */}
  {showTooltip && (
    <div className="fixed right-2 top-16 z-[9999] w-60 rounded-2xl p-4 border border-slate-800"
         style={{ background: '#0f172a' }}>

      <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
          <span className="text-slate-400 text-xs">Online now</span>
        </div>
        <span className="text-green-400 font-bold text-sm">{displayOnline}</span>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span className="text-slate-400 text-xs">Visitors (24 hrs)</span>
        </div>
        <span className="text-blue-400 font-bold text-sm">{displayVisitors.toLocaleString()}</span>
      </div>

      {weekly.length > 0 && (
        <>
          <div className="flex items-end gap-1 h-12 mb-1">
            {(() => {
              const max = Math.max(...weekly.map(d => d.visitors), 1);
              return weekly.map((d, i) => (
                <div key={i} className="flex flex-col justify-end flex-1 h-full">
                  <div
                    title={`${d.visitors} visitors`}
                    style={{
                      height: `${Math.max(Math.round((d.visitors / max) * 100), 4)}%`,
                      background: d.visitors === max ? '#22c55e' : '#3b82f6',
                      borderRadius: '3px 3px 0 0',
                      width: '100%'
                    }}
                  />
                </div>
              ));
            })()}
          </div>
          <div className="flex gap-1 mb-3">
            {weekly.map((d, i) => (
              <div key={i} className="flex-1 text-center text-slate-500" style={{ fontSize: '9px' }}>
                {d.label}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="border-t border-slate-800 pt-3 text-center">
        <div className="text-blue-400 text-xs font-semibold">
          {(() => {
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 1);
            const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
            return `${now.getFullYear()} | Week of ${week}`;
          })()}
        </div>
        <div className="text-slate-500 mt-0.5" style={{ fontSize: '10px' }}>
          {(() => {
            const now = new Date();
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - 6);
            const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return `${fmt(weekStart)} – ${fmt(now)}`;
          })()}
        </div>
      </div>
    </div>
  )}
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