import { Link, useLocation, useParams } from "react-router-dom";

const routeMap = {
  "login":      "Login",
  "register-trader": "Register",
  "about":      "About",
  "delivery":   "Delivery",
  "product":    "Product",
  "trader":     "Trader",
  "dashboard":  "Dashboard",
  "orders":     "Orders",
};

export default function Breadcrumb({ productName }) {
  const location = useLocation();

  // Don't show on home
  if (location.pathname === "/") return null;

  const segments = location.pathname.split("/").filter(Boolean);

  const crumbs = [{ label: "Home", path: "/" }];

  segments.forEach((seg, i) => {
    // Skip the product ID (pure number)
    if (/^\d+$/.test(seg)) return;

    const path = "/" + segments.slice(0, i + 1).join("/");
    const label = routeMap[seg] || seg;
    crumbs.push({ label, path });
  });

  // Replace "Product" with actual product name if provided
  if (productName) {
    const productCrumb = crumbs.find(c => c.label === "Product");
    if (productCrumb) productCrumb.label = productName;
  }

  return (
    <nav className="flex items-center gap-1 text-xs text-gray-400 flex-wrap">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-300">›</span>}
            {isLast ? (
              <span className="text-gray-600 font-semibold truncate max-w-[120px]">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="hover:text-blue-500 transition truncate max-w-[80px]"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}