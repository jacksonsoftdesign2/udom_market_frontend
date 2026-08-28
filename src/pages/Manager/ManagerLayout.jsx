import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/upmarket_logo.png";
import { FiTag, FiLogOut, FiMenu, FiX, FiChevronRight } from "react-icons/fi";

const NAV = [
  { to: "/manager/ads", icon: FiTag, label: "Advertisements" },
];

export default function ManagerLayout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#f4f6fb", fontFamily: "'Segoe UI', sans-serif" }}>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:z-auto
      `} style={{ width: 240, background: "#1a3a8f", minHeight: "100vh" }}>

        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-[4px] flex items-center justify-center flex-shrink-0"
            style={{ background: "#F5C518" }}>
            <img src={logo} alt="logo" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">UDOM Market</p>
            <p className="text-blue-300 text-xs">Business Manager</p>
          </div>
          <button className="ml-auto md:hidden text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}>
            <FiX size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-sm font-medium transition-all group
                 ${isActive ? "bg-[#F5C518] text-[#1a3a8f]" : "text-blue-200 hover:bg-white/10 hover:text-white"}`
              }>
              {({ isActive }) => (
                <>
                  <Icon size={17} />
                  <span className="flex-1">{label}</span>
                  {isActive && <FiChevronRight size={14} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#F5C518] flex items-center justify-center text-[#1a3a8f] font-bold text-xs flex-shrink-0">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user.first_name} {user.last_name}</p>
              <p className="text-blue-300 text-xs truncate">{user.user_code}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-sm font-medium text-blue-200 hover:bg-red-500/20 hover:text-red-300 transition-all">
            <FiLogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 md:px-6 py-3 bg-white border-b border-gray-100 sticky top-0 z-20">
          <button className="md:hidden text-gray-500 hover:text-[#1a3a8f]"
            onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22} />
          </button>
          <div className="flex-1" />
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}