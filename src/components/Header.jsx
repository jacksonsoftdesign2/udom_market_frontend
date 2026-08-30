import { useState, useRef, useEffect } from "react";
import { API } from "../api";
import { useNavigate, useLocation } from "react-router-dom";
import tzFlag from "../assets/tz.png";
import gbFlag from "../assets/gb.png";
import logo from "../assets/upmarket_logo.png";
import translations from "../translations";
import { FaUser, FaInfoCircle, FaTruckMoving, FaHome, FaChevronRight, FaSearch } from "react-icons/fa";
import ClaimForm from "./ClaimForm";
import { FiUser } from "react-icons/fi";

export default function Header({
  cartCount, stickySearch, scrolledInProduct, onBackClick, onHomeClick,
  lang: langProp, onLangChange,
  minimized = false, onSearchIconClick, searchActive = false, onHeightChange,
}) {
  const [lang, setLang] = useState(langProp || "sw");
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const headerRef = useRef(null);
  
  const t = translations[lang] || translations["sw"];


const [visitors24h, setVisitors24h] = useState(0);
const [onlineUsers, setOnlineUsers] = useState(0);
const [displayVisitors, setDisplayVisitors] = useState(0);
const [displayOnline, setDisplayOnline] = useState(0);
const [showTooltip, setShowTooltip] = useState(false);
const [weekly, setWeekly] = useState([]);
const [today, setToday] = useState(new Date());


const [showClaim, setShowClaim] = useState(false);
  const menuItems = [
    { label: t.home, icon: <FaHome />, action: () => navigate("/") },
    { label: t.login, icon: <FaUser />, action: () => navigate("/login") },
    { label: t.register, icon: <FaInfoCircle />, action: () => navigate("/register-trader") },
    { label: t.delivery, icon: <FaTruckMoving />, action: () => navigate("/delivery") },
    { label: t.about, icon: <FaInfoCircle />, action: () => navigate("/about") },
    { label: "Wasiliana / Claim", icon: <span>🔆</span>, action: () => setShowClaim(true) },
  ];

  const toggleLanguage = () => {
  const next = lang === "sw" ? "en" : "sw"; setLang(next); onLangChange?.(next);};
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // auto update time in midnight hours
  
 useEffect(() => {
  let timeout;

  function scheduleMidnightUpdate() {
    const now = new Date(); // ✅ ALWAYS fresh time

    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);

    const msUntilMidnight = nextMidnight - now;

    timeout = setTimeout(() => {
      setToday(new Date()); // update state
      scheduleMidnightUpdate(); // loop
    }, msUntilMidnight);
  }

  scheduleMidnightUpdate();

  return () => clearTimeout(timeout);
}, []);


// WebSocket connection
useEffect(() => {
  let ws;
  let retryTimeout;

  function connect() {
    let vid = localStorage.getItem('_vid');
    if (!vid) {
      vid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('_vid', vid);
    }


 const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const wsBase = API.replace(/^https?:\/\//, '').replace('/api', '');
ws = new WebSocket(`${wsProtocol}://${wsBase}?vid=${vid}`);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'update') {
        setOnlineUsers(data.onlineNow);       // small number — people online now
        setVisitors24h(data.visitors24h);     // bigger number — 24hr visitors
        setWeekly(data.weekly || []);
      }
    };

    ws.onclose = () => { retryTimeout = setTimeout(connect, 5000); };
    ws.onerror = () => ws.close();
  }

  // Load instantly on mount — no waiting for WS handshake
 fetch(`${API}/visitor-stats`)
    .then(r => r.json())
    .then(data => {
      setOnlineUsers(data.onlineNow);
      setVisitors24h(data.visitors24h);
      setWeekly(data.weekly || []);
    })
    .catch(() => {});

  connect();

  return () => {
    clearTimeout(retryTimeout);
    ws?.close();
  };
}, []);

  useEffect(() => {
    if (!headerRef.current || !onHeightChange) return;
    const el = headerRef.current;
    const report = () => onHeightChange(Math.ceil(el.getBoundingClientRect().height));
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [onHeightChange, minimized]);

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
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center">
      <div
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50
                            px-3 ${minimized ? "py-1" : "py-2"}
                            flex items-center justify-between gap-2
                            bg-white
                            border-b border-gray-200
                          text-yellow-700`}
      >
          
         {/* LEFT: MENU BUTTON + LOGO + TITLE */}
<div className="flex items-center gap-1 md:gap-2 whitespace-nowrap flex-1 min-w-0">
  <button
    ref={menuRef}
    onClick={toggleMenu}
    className="text-lg md:text-xl px-2 md:px-3 py-1.5 md:py-2 rounded-md bg-yellow-500 text-white 
               hover:scale-105 md:hover:scale-110 transition active:scale-95
               touch-manipulation flex-shrink-0"
  >
    ☰
  </button>
            <div
              onClick={() => { window.location.href = "/"; }}
              className="flex items-center gap-1 md:gap-2 cursor-pointer"
            >
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
            {/* Desktop: icon-only buttons after title */}
{scrolledInProduct && (
  <div className="hidden md:flex items-center gap-1.5 ml-2 transition-all duration-300">
    <button
      onClick={onBackClick}
      className="w-8 h-8 flex items-center justify-center rounded-sm border border-gray-200 bg-white/80 text-blue-600 hover:bg-white transition"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
    </button>
    <button
      onClick={onHomeClick}
      className="w-8 h-8 flex items-center justify-center rounded-sm border border-gray-200 bg-white/80 text-gray-500 hover:bg-white transition"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    </button>
  </div>
)}
           
          </div>
<div
  className="relative flex items-center cursor-pointer select-none"
  onMouseEnter={(e) => {
    if (e.target.closest('[data-mobile-search-toggle]')) return;
    setShowTooltip(true);
  }}
  onMouseLeave={() => setShowTooltip(false)}
  onClick={(e) => {
    if (e.target.closest('[data-mobile-search-toggle]')) return;
    setShowTooltip(prev => !prev);
  }}
>
  {/* MOBILE */}
<div className="relative flex md:hidden items-center">

  {minimized ? (
    <button
      data-mobile-search-toggle="true"
      onClick={(e) => { e.stopPropagation(); onSearchIconClick(); }}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition
        ${searchActive ? "bg-blue-600 text-white" : "bg-slate-900 text-blue-300"}`}
    >
      <FaSearch size={12} />
      <span className="text-xs font-semibold">Search</span>
    </button>
  ) : (
    <>
      {/* Stats pill — hides on scroll (existing scrolledInProduct behavior, unchanged) */}
      <div className={`flex items-center gap-1.5 bg-slate-900 rounded-full px-3 py-1.5 transition-all duration-300 ${scrolledInProduct ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-green-400 text-xs font-bold">{displayOnline}</span>
        <span className="w-px h-3 bg-slate-600"></span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span className="text-blue-400 text-xs font-bold">{displayVisitors.toLocaleString()}</span>
      </div>

      {/* Nav icons — shows on scroll (product page context, unchanged) */}
      <div className={`absolute right-0 flex items-center gap-1.5 transition-all duration-300 ${scrolledInProduct ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <button onClick={onBackClick} className="w-8 h-8 flex items-center justify-center rounded-sm border border-gray-200 bg-white/80 text-blue-600 hover:bg-white transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <button onClick={onHomeClick} className="w-8 h-8 flex items-center justify-center rounded-sm border border-gray-200 bg-white/80 text-gray-500 hover:bg-white transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </button>
      </div>
    </>
  )}
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
    <div className="fixed right-2 top-16 z-[9999] w-60 rounded-md p-4 border border-slate-800"
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
   {(() => {
  const now = new Date(today);
 now.setHours(0,0,0,0);

  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7));

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return weekly.map((d, i) => {
    const date = new Date(d.date + "T00:00:00Z"); // 🔥 TZ FIX

    const isCurrentWeek = date >= start && date <= end;

    return (
      <div
        key={i}
        className={`flex-1 text-center ${
          isCurrentWeek ? "text-green-400" : "text-slate-500"
        }`}
        style={{ fontSize: '9px' }}
      >
        {d.label}
      </div>
    );
  });
})()}
          </div>
        </>
      )}

      <div className="border-t border-slate-800 pt-3 text-center">
        <div className="text-blue-400 text-xs font-semibold">
          {(() => {
            const now = new Date(today);
            const start = new Date(now.getFullYear(), 0, 1);
            const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
            return `${now.getFullYear()} | Week of ${week}`;
          })()}
        </div>
        <div className="text-slate-500 mt-0.5" style={{ fontSize: '10px' }}>
          {(() => {
           const now = new Date(today);
            const day = now.getDay();
            const diffToMonday = (day === 0 ? -6 : 1 - day);
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() + diffToMonday);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            const fmt = (d) =>
            d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return `${fmt(weekStart)} – ${fmt(weekEnd)}`;
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
           
            {/* ACCOUNT */}
            <div className="flex flex-col items-center flex-shrink-0">
              <button
                onClick={() => navigate("/account")}
                className="flex items-center gap-1.5 px-2 py-1.5 md:px-3 md:py-2 rounded-full bg-[#4367c9]
                           hover:scale-105 md:hover:scale-110 transition active:scale-95
                           touch-manipulation"
                style={{ boxShadow: "0 0 0 2px #F5C518" }}

              >
                <FiUser size={16} className="md:hidden text-white" />
                <FiUser size={20} className="hidden md:block text-white" />
                <span className="hidden md:inline text-sm font-semibold text-white">Me</span>
              </button>

            </div>
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
{/* Claim Modal */}
      {showClaim && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowClaim(false)}>
          <div className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-sm overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <ClaimForm onClose={() => setShowClaim(false)} />
          </div>
        </div>
      )}
    </>
  );
}
