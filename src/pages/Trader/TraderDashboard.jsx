import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/upmarket_logo.png";
import Products from "./Products";
import EditProfile from "./EditProfile";

function TraderDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("products");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(stored));
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

  const navItems = [
  { key: "profile", label: "Home", icon: "🏠" },
  { key: "products", label: "Products", icon: "🛍️" },
  { key: "orders", label: "Orders", icon: "📦" },
  { key: "payments", label: "Payments", icon: "💳" },
  { key: "analytics", label: "Analytics", icon: "📊" },
  { key: "category", label: "Request Category", icon: "📋" },
  { key: "editprofile", label: "Edit Profile", icon: "✏️" },
  { key: "changepassword", label: "Change Password", icon: "🔐" },
];
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 10);
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
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
    <div className="min-h-screen bg-gray-100 flex">

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

        {/* Nav items */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left font-medium transition-all text-sm ${
                activeSection === item.key
                  ? "bg-blue-400 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          {/* Logout */}
  <button
    onClick={handleLogout}
    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left font-medium transition-all text-sm text-red-600 hover:bg-red-50"
  >
    <span>🚪</span>
    <span>Logout</span>
  </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col pb-16 md:pb-0">
        {/* Top bar */}
        <div className={`bg-white shadow-sm px-4 md:px-6 flex items-center justify-between sticky top-0 z-10 transition-all duration-300 ${scrolled ? "py-1 md:py-2 shadow-md" : "py-2 md:py-4"}`}>
          <h1 className="text-lg md:text-xl font-bold text-gray-800 capitalize">{activeSection.replace("_", " ")}</h1>
          <div className="flex items-center gap-3 relative" ref={profileMenuRef}>
            <p className="text-xs md:text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-300">{user?.user_code || "N/A"}</p>
            <button
              onClick={() => window.innerWidth >= 768 ? null : setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full border-2 border-gray-300 object-cover hover:border-blue-500 transition overflow-hidden flex-shrink-0"
            >
              <img
  src={
    user?.profile_image
    ? user.profile_image //use actual profile image if available
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${user?.first_name} ${user?.last_name}`

  )}&background=60a5fa&color=fff` // fallback to generated avatar based on name initials
}
  alt="Profile"
  className="w-full h-full object-cover"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user?.first_name} ${user?.last_name}`)}&background=60a5fa&color=fff`;
  }}
/>
            </button>
            
            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <button
                  onClick={() => {
                    setActiveSection("profile");
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-gray-700 font-medium"
                >
                  ✏️ Edit Profile
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    // Add change password logic here
                    alert("Change password feature coming soon");
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-gray-700 font-medium"
                >
                  🔐 Change Password
                </button>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 text-red-600 font-medium"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>

       {/* Content area */}
<div className="flex-1 p-3 md:p-6">
  {activeSection === "products" && <Products />}
  
  {activeSection === "profile" && (
    <div className="bg-white rounded-2xl shadow p-4 md:p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">👤 Profile Information</h2>
        {/* ✅ Profile photo */}
    <div className="flex justify-center mb-2">
      <img
        src={user?.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user?.first_name} ${user?.last_name}`)}&background=60a5fa&color=fff`}
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover border-4 border-blue-400 shadow"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user?.first_name} ${user?.last_name}`)}&background=60a5fa&color=fff`;
        }}
      />
    </div>
      {/* Profile Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 font-medium">First Name</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{user?.first_name || "Placeholder"}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 font-medium">Last Name</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{user?.last_name || "Placeholder"}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 font-medium">Email</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{user?.email || "your.email@example.com"}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 font-medium">Phone</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{user?.phone || "+255 XXX XXX XXX"}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 font-medium">Shop Name</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{user?.shop_name || "Your Shop Name"}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 font-medium">Registration Number</p>
          <p className="text-lg font-bold text-gray-800 mt-1">{user?.user_code || "REG-001"}</p>
        </div>
      </div>
      
      
    <button
      onClick={() => setActiveSection("editprofile")}
      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium mt-4"
    >
        ✏️ Edit Profile
      </button>
    </div>
  )}
  
{activeSection === "editprofile" && (
  <EditProfile user={user} setUser={setUser} />
)}

{activeSection !== "products" && activeSection !== "profile" && activeSection !== "editprofile" && (
    <div className="bg-white rounded-2xl shadow p-4 md:p-6 text-center text-gray-400">
      <p className="text-3xl md:text-4xl mb-2">{navItems.find(n => n.key === activeSection)?.icon}</p>
      <p className="text-base md:text-lg font-semibold">{navItems.find(n => n.key === activeSection)?.label}</p>
      <p className="text-xs md:text-sm mt-1">This section is coming soon.</p>
    </div>
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
    <path d={buildNotchPath(activeSection)} fill="white" stroke="blue" strokeWidth="2" />
  </svg>

  {/* Nav buttons */}
  <div className="absolute inset-0 flex items-center justify-around px-1 pb-1">
    {navItems.map((item, i) => {
      const isActive = activeSection === item.key;
      return (
        <button
          key={item.key}
          onClick={() => setActiveSection(item.key)}
          className="flex flex-col items-center gap-0.5"
          style={{ opacity: isActive ? 0 : 1, transition: 'opacity 0.2s' }}
        >
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          <span className="text-blue-900" style={{ fontSize: 9 }}>
            {item.label.split(' ')[0]}
          </span>
        </button>
      );
    })}
  </div>

  {/* Active floating icon — moves with notch */}
  {(() => {
    const idx = navItems.findIndex(n => n.key === activeSection);
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
        <div className="w-9 h-9 rounded-full bg-blue-400 shadow shadow-yellow-600 flex items-center justify-center">
          <span style={{ fontSize: 16 }}>{item.icon}</span>
        </div>
        <span className="font-semibold text-yellow-600" style={{ fontSize: 9 }}>
          {item.label.split(' ')[0]}
        </span>
      </div>
    );
  })()}
</nav>

    </div>
  );
}

export default TraderDashboard;