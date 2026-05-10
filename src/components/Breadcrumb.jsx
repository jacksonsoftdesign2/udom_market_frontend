import { useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaChevronRight } from "react-icons/fa";

const routeLabels = {
  "login":           "Login",
  "register-trader": "Register",
  "about":           "About",
  "delivery":        "Delivery",
  "product":         "Product",
  "trader":          "Trader",
  "dashboard":       "Dashboard",
  "orders":          "Orders",
};

export default function Breadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/") return null;

  const segments = location.pathname.split("/").filter(Boolean);

  return (
    <div className="fixed left-0 right-0 z-40 flex justify-center"
         style={{ top: '52px' }}>
      <div className="w-full md:w-[99%] md:max-w-screen-2xl
                      px-4 py-1.5
                      flex items-center gap-1.5
                      bg-white/60 backdrop-blur-md
                      border-b border-white/30
                      shadow-sm">

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 text-blue-500 hover:text-blue-700 transition text-xs font-semibold"
        >
          <FaHome size={10} />
          <span>Home</span>
        </button>

        {segments.map((seg, i) => {
          if (/^\d+$/.test(seg)) return null;

          const label = routeLabels[seg] || seg;
          const isLast = i === segments.length - 1 ||
            (i === segments.length - 2 && /^\d+$/.test(segments[i + 1]));

          return (
            <span key={i} className="flex items-center gap-1.5">
              <FaChevronRight size={8} className="text-gray-300" />
              <span className={`text-xs font-semibold truncate max-w-[120px] ${
                isLast
                  ? "text-gray-600"
                  : "text-blue-400 hover:text-blue-600 cursor-pointer"
              }`}>
                {label}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}