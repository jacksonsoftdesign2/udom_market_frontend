import { Routes, Route } from "react-router-dom";
import ProductDetail from "./pages/ProductDetail";
import Home from "./pages/Home";
import RegisterTrader from "./pages/RegisterTrader";
import Login from "./pages/Login";
import TraderDashboard from "./pages/Trader/TraderDashboard";
import About from "./pages/About";
import Delivery from "./pages/Delivery";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import TraderOrders from "./pages/Trader/TraderOrders";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminTraders from "./pages/Admin/AdminTraders";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminNameRequests from "./pages/Admin/AdminNameRequests";
import AdminClaims from "./pages/Admin/AdminClaims";
import AdminManagement from "./pages/Admin/AdminManagement";
import AdminPaymentSettings from "./pages/Admin/AdminPaymentSettings";
import Payments from "./pages/Trader/Payments";
import ManagerProtectedRoute from "./components/ManagerProtectedRoute";
import ManagerAds from "./pages/Manager/ManagerAds";
import StaffManagement from "./pages/Admin/StaffManagement";

function App() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/"                  element={<Home />} />
      <Route path="/login"             element={<Login />} />
      <Route path="/register-trader"   element={<RegisterTrader />} />
      <Route path="/product/:id"       element={<ProductDetail />} />
      <Route path="/about"             element={<About />} />
      <Route path="/delivery"          element={<Delivery />} />

      {/* ── Trader ── */}
      <Route path="/trader/dashboard"  element={<ProtectedRoute><TraderDashboard /></ProtectedRoute>} />
      <Route path="/trader/orders"     element={<ProtectedRoute><TraderOrders /></ProtectedRoute>} />
      <Route path="/trader/dashboard"  element={<ProtectedRoute><TraderDashboard /></ProtectedRoute>} />
      <Route path="/trader/orders"     element={<ProtectedRoute><TraderOrders /></ProtectedRoute>} />
      <Route path="/trader/payments"   element={<ProtectedRoute><Payments /></ProtectedRoute>} />

      {/* ── Admin ── */}
      <Route path="/admin/dashboard"   element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
      <Route path="/admin/traders"     element={<AdminProtectedRoute><AdminTraders /></AdminProtectedRoute>} />
      <Route path="/admin/products"    element={<AdminProtectedRoute><AdminProducts /></AdminProtectedRoute>} />
      <Route path="/admin/name-requests" element={<AdminProtectedRoute><AdminNameRequests /></AdminProtectedRoute>} />
      <Route path="/admin/claims" element={<AdminProtectedRoute><AdminClaims /></AdminProtectedRoute>} />
      <Route path="/admin/admins" element={<AdminProtectedRoute><AdminManagement /></AdminProtectedRoute>} />
      <Route path="/admin/payment-settings" element={<AdminProtectedRoute><AdminPaymentSettings /></AdminProtectedRoute>} />

      <Route path="/admin/staff" element={<AdminProtectedRoute><StaffManagement /></AdminProtectedRoute>} />
      <Route path="/manager/ads" element={<ManagerProtectedRoute><ManagerAds /></ManagerProtectedRoute>} />

    </Routes>
  );
}

export default App;
