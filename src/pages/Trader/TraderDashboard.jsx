import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/upmarket_logo.png";

function TraderDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("products");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(stored));
  }, []);

  const navItems = [
    { key: "products", label: "My Products", icon: "🛍️" },
    { key: "orders", label: "Orders", icon: "📦" },
    { key: "payments", label: "Payments", icon: "💳" },
    { key: "analytics", label: "Analytics", icon: "📊" },
    { key: "category", label: "Request Category", icon: "📋" },
    { key: "profile", label: "Profile", icon: "👤" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* SIDEBAR — desktop only */}
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg min-h-screen">
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b">
          <img src={logo} alt="logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-gray-800 text-base">UDOM Market</span>
        </div>

        {/* User info */}
        <div className="p-3 border-b bg-yellow-50">
          <p className="text-xs text-gray-500">Welcome,</p>
          <p className="font-bold text-gray-800 text-sm">{user?.first_name} {user?.last_name}</p>
          <span className="text-xs bg-yellow-200 text-yellow-700 px-2 py-0.5 rounded-full font-semibold uppercase">
            {user?.role}
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveSection(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left font-medium transition-all text-sm ${
                activeSection === item.key
                  ? "bg-yellow-400 text-white shadow"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 font-medium transition-all text-sm"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col pb-16 md:pb-0">
        {/* Top bar */}
        <div className="bg-white shadow-sm px-4 md:px-6 py-2 md:py-4 flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-bold text-gray-800 capitalize">{activeSection.replace("_", " ")}</h1>
          <p className="text-xs md:text-sm text-gray-500 hidden md:block">{user?.user_code}</p>
        </div>

        {/* Content area */}
        <div className="flex-1 p-3 md:p-6">
          <div className="bg-white rounded-2xl shadow p-4 md:p-6 text-center text-gray-400">
            <p className="text-3xl md:text-4xl mb-2">{navItems.find(n => n.key === activeSection)?.icon}</p>
            <p className="text-base md:text-lg font-semibold">{navItems.find(n => n.key === activeSection)?.label}</p>
            <p className="text-xs md:text-sm mt-1">This section is coming soon.</p>
          </div>
        </div>
      </main>

 {/* BOTTOM NAVBAR — mobile only */}
<nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg flex justify-around items-end py-0.5 z-50">
  {navItems.map(item => (
    <button
      key={item.key}
      onClick={() => setActiveSection(item.key)}
      className="flex flex-col items-center relative"
    >
      {/* Bubble + lifted icon */}
      <div className={`flex flex-col items-center transition-all duration-300 ${
        activeSection === item.key
          ? "-translate-y-2"
          : "translate-y-0"
      }`}>
        <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all duration-300 ${
          activeSection === item.key
            ? "bg-yellow-400 shadow-lg shadow-yellow-300"
            : ""
        }`}>
          {item.icon}
        </div>
        <span className={`text-xs mt-0 font-medium transition-all duration-300 ${
          activeSection === item.key
            ? "text-yellow-500"
            : "text-gray-400"
        }`}>
          {item.label.split(" ")[0]}
        </span>
      </div>

      {/* Dot indicator at bottom */}
      {activeSection === item.key && (
        <span className="absolute -bottom-1 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
      )}
    </button>
  ))}
</nav>

    </div>
  );
}

export default TraderDashboard;