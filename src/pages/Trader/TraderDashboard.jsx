import ChangePassword from "./ChangePassword";
import TraderOrders from "./TraderOrders";
import { API } from "../../api";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/upmarket_logo.png";
import Products from "./Products";
import EditProfile from "./EditProfile";
import { FiEdit, FiLock, FiLogOut, FiShoppingBag, FiPackage, FiCreditCard, FiBarChart2, FiList } from "react-icons/fi";
import React from "react";
import { listenForForegroundNotifications, removeFcmToken } from "../../utils/notifications";

function TraderDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("products");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const [toast, setToast] = useState(null);

useEffect(() => {
  const stored = localStorage.getItem("user");
  if (!stored) { navigate("/login"); return; }
  const parsedUser = JSON.parse(stored);
  if (!parsedUser.profile_image) {
    fetch(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(r => r.json())
    .then(data => {
      const updated = { ...parsedUser, profile_image: data.profile_image };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
    })
    .catch(() => setUser(parsedUser));
  } else {
    setUser(parsedUser);
  }
}, []);


useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const updated = { ...JSON.parse(localStorage.getItem("user") || "{}"), ...data };
        localStorage.setItem("user", JSON.stringify(updated));
        setUser(updated);
      }
    } catch (e) {
      // fail silently
    }
  }, 5000); // every 5 seconds
  return () => clearInterval(interval);
}, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // ── Foreground notification listener ──
useEffect(() => {
  const unsubscribe = listenForForegroundNotifications((notification) => {
    setToast(notification);
    // Auto-dismiss after 5s
    setTimeout(() => setToast(null), 8000);
    // Update pending badge
    setPendingCount(prev => prev + 1);
  });
  return () => unsubscribe?.();
}, []);

const [scrolled, setScrolled] = useState(false);

const [pendingCount, setPendingCount] = useState(0);
  
const navItems = [
  { key: "products",  label: "Products",         icon: <FiShoppingBag size={16} /> },
   { key: "orders",    label: "Orders",           icon: <FiPackage size={16} />, badge: pendingCount },
  { key: "payments",  label: "Payments",          icon: <FiCreditCard size={16} /> },
  { key: "analytics", label: "Analytics",         icon: <FiBarChart2 size={16} /> },
  { key: "category",  label: "Request Category",  icon: <FiList size={16} /> },
];

const sidebarOnlyItems = [
  { key: "editprofile",    label: "Edit Profile",    icon: <FiEdit size={16} /> },
  { key: "changepassword", label: "Change Password", icon: <FiLock size={16} /> },
];
  const handleLogout = () => {
    await removeFcmToken();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };


useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 10);
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

// Fetch pending orders count for badge
useEffect(() => {
  const fetchPendingCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const pending = data.filter(o => o.status === "pending").length;
        setPendingCount(pending);
      }
    } catch (e) {}
  };

  fetchPendingCount();
  // Poll every 20s to keep badge fresh
  const interval = setInterval(fetchPendingCount, 20000);
  return () => clearInterval(interval);
}, []);

  //notch path generator for mobile nav icons floating effect
 
  const buildNotchPath = (activeKey) => {
  const W = 360, H = 58;
  const idx = navItems.findIndex(n => n.key === activeKey);
  const step = W / navItems.length;
  const cx = step * idx + step / 2;
  const depth = 18, bevel = 10, r = 22;
  const lx1 = cx - r * 1.5, lx2 = cx - r * 0.4;
  const rx1 = cx + r * 0.4, rx2 = cx + r * 1.5;
  return `M 0 0 L ${lx1-bevel} 0 C ${lx1} 0,${lx2} ${depth},${cx} ${depth} C ${rx1} ${depth},${rx2} 0,${rx2+bevel} 0 L ${W} ${0} L ${W} ${H} L 0 ${H} Z`;
};

  return (
    <div className="min-h-screen h-screen bg-gray-100 flex overflow-hidden">

      {/* SIDEBAR — desktop only */}
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg h-screen sticky top-0 overflow-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b">
          <img src={logo} alt="logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-gray-800 text-base">UDOM Market</span>
        </div>

        {/* User info */}
        <div className="p-3 border-b bg-yellow-50">
          <p className="text-xs text-gray-500">Welcome,</p>
          <p className="font-bold text-gray-800 text-sm">{user?.first_name} {user?.last_name}</p>
          <span className="text-xs bg-blue-400 text-white px-2 py-0.5 rounded font-bold uppercase">
            {user?.role}
          </span>
        </div>

        {/* Nav items, sidebaronly items */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
{[navItems, sidebarOnlyItems].flat().map(item => (
  <button
    key={item.key}
    onClick={() => setActiveSection(item.key)}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left font-medium transition-all text-sm ${
      activeSection === item.key
        ? "bg-blue-400 text-white shadow"
        : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    <span className="relative">
      {item.icon}
      {item.badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] bg-green-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-0.5">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </span>
    <span className="flex-1">{item.label}</span>
    {/* Text badge too for clarity */}
    {item.badge > 0 && (
      <span className="bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
        {item.badge}
      </span>
    )}
  </button>
))}
          {/* Logout */}
  <button
    onClick={handleLogout}
    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left font-medium transition-all text-sm text-red-600 hover:bg-red-50"
  >
    <FiLogOut size={16} />
    <span>Logout</span>
  </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col pb-20 md:pb-0 min-h-0 overflow-hidden">
        {/* Top bar */}
        <div className={`bg-white shadow-sm px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 overflow-visible transition-all duration-300 ${scrolled ? "py-1 md:py-2 shadow-md" : "py-2 md:py-4"}`}>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-800 capitalize">
            {activeSection.replace("_", " ")}
          </h1>
        </div>
          <div className="flex items-center gap-3 relative" ref={profileMenuRef}>
            <p className="text-xs md:text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300">{user?.user_code || "N/A"}</p>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full border-2 border-gray-300 object-cover hover:border-blue-500 transition overflow-hidden flex-shrink-0"
            >
              <img
              key={user?.profile_image || 'avatar'}
  src={
    user?.profile_image
    ? user.profile_image //use actual profile image if available
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${user?.first_name} ${user?.last_name}`

  )}&background=60a5fa&color=fff` // fallback to generated avatar based on name initials
}
  alt="Profile"
  className="w-full h-full object-cover"
 
/>
            </button>
            
            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[100]">
                <button
                  onClick={() => {
                    setActiveSection("editprofile");
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-gray-700 font-medium"
                >
               <FiEdit size={15} /> Edit Profile
                </button>
                <button
                 onClick={() => {
                setActiveSection("changepassword");
                setShowProfileMenu(false);
              }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-gray-700 font-medium"
                >
                 <FiLock size={15} /> Change Password
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 text-red-600 font-medium"
                >
                  <FiLogOut size={15} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

       {/* Content area */}
<div className="flex-1 px-3 pt-3 pb-6 md:p-6 overflow-y-auto">
  {activeSection === "products" && <Products />}
  {activeSection === "orders" && (
  <TraderOrders onPendingCountChange={setPendingCount} />
)}
 
  
 {!["products", "orders", "editprofile", "changepassword"].includes(activeSection) && (
    <div className="bg-white rounded-2xl shadow p-4 md:p-6 text-center text-gray-400">
      <div className="flex justify-center mb-2 text-gray-300">
  {(() => {
    const found = navItems.find(n => n.key === activeSection);
    if (!found) return null;
    return React.cloneElement(found.icon, { size: 48 });
  })()}
</div>
      <p className="text-base md:text-lg font-semibold">{navItems.find(n => n.key === activeSection)?.label}</p>
      <p className="text-xs md:text-sm mt-1">This section is coming soon.</p>
    </div>
  )}
{activeSection === "editprofile" && (
  <EditProfile user={user} setUser={setUser} />
)}
{activeSection === "changepassword" && (
  <ChangePassword />
)}

</div>
      </main>

{/* BOTTOM NAVBAR — mobile only */}
<nav className="md:hidden fixed bottom-0 left-0 right-0 z-50" style={{ height: '58px' }}>
  {/* SVG notch background */}
  <svg
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    viewBox="0 0 360 58"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d={buildNotchPath(activeSection)} fill="white" stroke="#3b82f6" strokeWidth="1" />
  </svg>

  {/* Nav buttons */}
  <div className="absolute inset-0 flex items-center justify-around px-1 pb-1">
    {navItems.map((item) => {
      const isActive = activeSection === item.key;
      return (
        <button
          key={item.key}
          onClick={() => setActiveSection(item.key)}
          className="flex flex-col items-center gap-0.5 relative"
          style={{ opacity: isActive ? 0 : 1, transition: 'opacity 0.2s' }}
        >
          <span className="relative flex items-center justify-center">
            {React.cloneElement(item.icon, { size: 16 })}
            {/* WhatsApp-style badge */}
            {item.badge > 0 && !isActive && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-green-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
          </span>
          <span className="text-blue-900" style={{ fontSize: 9 }}>
            {item.label.split(' ')[0]}
          </span>
        </button>
      );
    })}
  </div>

  {/* Active floating icon */}
  {(() => {
    const idx = navItems.findIndex(n => n.key === activeSection);
    if (idx === -1) return null;
    const step = 100 / navItems.length;
    const leftPct = step * idx + step / 2;
    const item = navItems[idx];
    return (
      <div
        className="absolute flex flex-col items-center gap-0.5 pointer-events-none"
        style={{
          left: `calc(${leftPct}% - 17px)`,
          top: '2px',
          transition: 'left 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div className="relative w-9 h-9 rounded-full bg-blue-500 shadow-lg flex items-center justify-center">
          <span className="flex items-center justify-center text-white">
            {React.cloneElement(item.icon, { size: 18 })}
          </span>
          {/* Badge on active floating icon too */}
          {item.badge > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-green-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-md">
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
        </div>
        <span className="font-semibold text-blue-600" style={{ fontSize: 9 }}>
          {item.label.split(' ')[0]}
        </span>
      </div>
    );
  })()}
</nav>


{/* ── Foreground notification toast ── */}
{toast && (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[92%] max-w-sm animate-slide-in">
    <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="text-white text-xs font-bold">New Notification</span>
        </div>
        <button onClick={() => setToast(null)} className="text-white/70 hover:text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div className="px-4 py-3">
        <p className="font-bold text-gray-800 text-sm">{toast.title}</p>
        <p className="text-gray-500 text-xs mt-0.5">{toast.body}</p>
        <button
          onClick={() => { setActiveSection("orders"); setToast(null); }}
          className="mt-2 text-xs text-blue-600 font-semibold hover:underline"
        >
          View Orders →
        </button>
      </div>
      {/* Auto-dismiss progress bar */}
      <div className="h-1 bg-gray-100">
        <div className="h-full bg-blue-500 rounded-full"
          style={{ animation: 'shrink 8s linear forwards' }}/>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default TraderDashboard;