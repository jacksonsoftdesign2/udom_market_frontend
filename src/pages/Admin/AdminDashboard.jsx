import { useState, useEffect } from "react";
import { API } from "../../api";
import AdminLayout from "./AdminLayout";
import { FiUsers, FiPackage, FiCheckCircle, FiClock, FiTrendingUp } from "react-icons/fi";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, productsRes] = await Promise.all([
          fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/admin/products`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const usersData = await usersRes.json();
        const productsData = await productsRes.json();

        const traders = usersData.users?.filter(u => u.role === "trader") || [];
        const products = productsData.products || [];

        setStats({
          totalTraders:    traders.length,
          pendingApproval: traders.filter(t => !t.is_approved).length,
          paidTraders:     traders.filter(t => t.payment_status === "paid").length,
          totalProducts:   products.length,
          pendingProducts: products.filter(p => p.verification_status === "pending").length,
          approvedProducts: products.filter(p => p.verification_status === "approved").length,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = stats ? [
    { label: "Total Traders",      value: stats.totalTraders,    icon: FiUsers,       color: "#1a3a8f", bg: "#e8edf7" },
    { label: "Pending Approval",   value: stats.pendingApproval, icon: FiClock,       color: "#d97706", bg: "#fef3c7" },
    { label: "Paid Traders",       value: stats.paidTraders,     icon: FiCheckCircle, color: "#16a34a", bg: "#dcfce7" },
    { label: "Total Products",     value: stats.totalProducts,   icon: FiPackage,     color: "#7c3aed", bg: "#ede9fe" },
    { label: "Pending Products",   value: stats.pendingProducts, icon: FiClock,       color: "#dc2626", bg: "#fee2e2" },
    { label: "Approved Products",  value: stats.approvedProducts,icon: FiTrendingUp,  color: "#0891b2", bg: "#cffafe" },
  ] : [];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, overview of your marketplace</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-[4px] p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-[4px] p-5 border border-gray-100 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">{label}</p>
                  <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                </div>
                <div className="w-10 h-10 rounded-[4px] flex items-center justify-center flex-shrink-0"
                  style={{ background: bg }}>
                  <Icon size={18} style={{ color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
