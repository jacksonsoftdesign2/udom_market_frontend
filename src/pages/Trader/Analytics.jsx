import { useState, useEffect, useCallback } from "react";
import { API } from "../../api";
import {
  FiTrendingUp, FiShoppingBag, FiEye, FiDollarSign,
  FiChevronLeft, FiChevronRight, FiArrowLeft,
  FiPackage, FiBarChart2, FiAlertCircle, FiRefreshCw
} from "react-icons/fi";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ── Constants ────────────────────────────────────────────────────────────────
const PERIODS = ["weekly", "monthly", "yearly"];
const PERIOD_LABELS = { weekly: "Weekly", monthly: "Monthly", yearly: "Yearly" };

const MAX_OFFSETS = { weekly: 11, monthly: 23, yearly: 1 }; // 2-year limit

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTZS(val) {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return String(Math.round(val));
}

function getPeriodLabel(period, offset) {
  const now = new Date();
  if (period === "weekly") {
    const end = new Date(now);
    end.setDate(end.getDate() - offset * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    if (offset === 0) return "This Week";
    if (offset === 1) return "Last Week";
    return `${start.toLocaleDateString("en", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en", { month: "short", day: "numeric" })}`;
  }
  if (period === "monthly") {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    if (offset === 0) return "This Month";
    if (offset === 1) return "Last Month";
    return d.toLocaleDateString("en", { month: "long", year: "numeric" });
  }
  if (period === "yearly") {
    const year = now.getFullYear() - offset;
    return offset === 0 ? `This Year (${year})` : String(year);
  }
}

function mergeChartData(views, orders) {
  const map = {};
  views.forEach(v => { map[v.label] = { label: v.label, views: parseInt(v.views) || 0, orders: 0, revenue: 0 }; });
  orders.forEach(o => {
    if (!map[o.label]) map[o.label] = { label: o.label, views: 0, orders: 0, revenue: 0 };
    map[o.label].orders = parseInt(o.orders) || 0;
    map[o.label].revenue = parseFloat(o.revenue) || 0;
  });
  return Object.values(map);
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500 capitalize">{p.dataKey}:</span>
          <span className="font-bold text-gray-700">
            {p.dataKey === "revenue" ? `TZS ${formatTZS(p.value)}` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-xl font-black text-gray-800 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Product Row ───────────────────────────────────────────────────────────────
function ProductRow({ product, rank, onClick }) {
  const thumb = product.images?.[0]?.thumb_webp || product.images?.[0]?.image_url || null;
  const winRate = product.views > 0 ? ((product.sold / product.views) * 100).toFixed(1) : "0.0";

  return (
    <button
      onClick={() => onClick(product)}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition rounded-xl text-left group"
    >
      {/* Rank */}
      <span className={`text-xs font-black w-5 flex-shrink-0 ${rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : rank === 3 ? "text-orange-400" : "text-gray-300"}`}>
        #{rank}
      </span>

      {/* Thumb */}
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
        {thumb
          ? <img src={thumb} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center"><FiPackage className="text-gray-300" size={16} /></div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-600 transition">{product.name}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-gray-400"><FiEye size={10} className="inline mr-0.5" />{product.views} views</span>
          <span className="text-xs text-gray-400"><FiShoppingBag size={10} className="inline mr-0.5" />{product.sold} sold</span>
        </div>
      </div>

      {/* Revenue + win rate */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-black text-blue-700">TZS {formatTZS(product.revenue)}</p>
        <p className="text-xs text-gray-400">{winRate}% conv.</p>
      </div>

      <FiChevronRight size={14} className="text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
    </button>
  );
}

// ── Single Product Deep Dive ──────────────────────────────────────────────────
function ProductAnalytics({ product, onBack }) {
  const [period, setPeriod] = useState("weekly");
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API}/products/analytics?period=${period}&offset=${offset}&product_id=${product.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [period, offset, product.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const chartData = data ? mergeChartData(data.chart.views, data.chart.orders) : [];
  const useBar = period === "yearly";
  const ChartComp = useBar ? BarChart : LineChart;

  const thumb = product.images?.[0]?.thumb_webp || product.images?.[0]?.image_url;

  return (
    <div className="space-y-4">
      {/* Back header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-800 transition"
        >
          <FiArrowLeft size={16} /> Back to Overview
        </button>
      </div>

      {/* Product header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
          {thumb
            ? <img src={thumb} alt={product.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><FiPackage className="text-gray-300" size={20} /></div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-800 text-base truncate">{product.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">TZS {Number(product.price).toLocaleString()} · Stock: {product.stock}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-black text-blue-700">TZS {formatTZS(product.revenue)}</p>
          <p className="text-xs text-gray-400">total revenue</p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={<FiEye size={18} className="text-blue-600" />} label="Total Views" value={product.views} color="bg-blue-50" />
        <MetricCard icon={<FiShoppingBag size={18} className="text-green-600" />} label="Total Sold" value={product.sold} color="bg-green-50" />
        <MetricCard icon={<FiDollarSign size={18} className="text-amber-600" />} label="Revenue" value={`TZS ${formatTZS(product.revenue)}`} color="bg-amber-50" />
        <MetricCard
          icon={<FiTrendingUp size={18} className="text-purple-600" />}
          label="Conversion"
          value={product.views > 0 ? `${((product.sold / product.views) * 100).toFixed(1)}%` : "0%"}
          sub="orders ÷ views"
          color="bg-purple-50"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        {/* Period toggle */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => { setPeriod(p); setOffset(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${period === p ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOffset(o => Math.min(o + 1, MAX_OFFSETS[period]))}
              disabled={offset >= MAX_OFFSETS[period]}
              className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 disabled:opacity-30 transition"
            >
              <FiChevronLeft size={14} />
            </button>
            <span className="text-xs font-bold text-gray-600 min-w-[90px] text-center">{getPeriodLabel(period, offset)}</span>
            <button
              onClick={() => setOffset(o => Math.max(o - 1, 0))}
              disabled={offset === 0}
              className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 disabled:opacity-30 transition"
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <svg className="animate-spin w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-gray-300 gap-2">
            <FiBarChart2 size={32} />
            <p className="text-sm">No data for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <ChartComp data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={35} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              {useBar ? (
                <>
                  <Bar dataKey="views" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Views" />
                  <Bar dataKey="orders" fill="#34d399" radius={[4, 4, 0, 0]} name="Orders" />
                </>
              ) : (
                <>
                  <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Views" />
                  <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2.5} dot={false} name="Orders" />
                  <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 2" name="Revenue" />
                </>
              )}
            </ChartComp>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ── MAIN Analytics Page ───────────────────────────────────────────────────────
export default function Analytics() {
  const [period, setPeriod] = useState("weekly");
  const [offset, setOffset] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [activeLines, setActiveLines] = useState({ views: true, orders: true, revenue: true });

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API}/products/analytics?period=${period}&offset=${offset}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to load analytics");
      const json = await res.json();
      setAnalytics(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [period, offset]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // If a product is selected → show deep dive
  if (selectedProduct) {
    return <ProductAnalytics product={selectedProduct} onBack={() => setSelectedProduct(null)} />;
  }

  const summary = analytics?.summary || {};
  const chartData = analytics ? mergeChartData(analytics.chart.views, analytics.chart.orders) : [];
  const useBar = period === "yearly";
  const ChartComp = useBar ? BarChart : LineChart;

  const filteredProducts = (analytics?.products || []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const winRate = summary.total_views > 0
    ? ((summary.total_orders / summary.total_views) * 100).toFixed(1)
    : "0.0";

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <p className="text-gray-400 text-sm">Loading analytics…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <FiAlertCircle size={28} className="text-red-400" />
      </div>
      <p className="text-gray-500 font-semibold">{error}</p>
      <button
        onClick={fetchAnalytics}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold"
      >
        <FiRefreshCw size={14} /> Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={<FiEye size={18} className="text-blue-600" />}
          label="Total Views"
          value={Number(summary.total_views || 0).toLocaleString()}
          sub="all products"
          color="bg-blue-50"
        />
        <MetricCard
          icon={<FiShoppingBag size={18} className="text-green-600" />}
          label="Total Orders"
          value={Number(summary.total_orders || 0).toLocaleString()}
          sub={`${summary.cancelled_orders || 0} cancelled`}
          color="bg-green-50"
        />
        <MetricCard
          icon={<FiDollarSign size={18} className="text-amber-600" />}
          label="Revenue"
          value={`TZS ${formatTZS(summary.total_revenue || 0)}`}
          sub="excl. cancelled"
          color="bg-amber-50"
        />
        <MetricCard
          icon={<FiTrendingUp size={18} className="text-purple-600" />}
          label="Conversion"
          value={`${winRate}%`}
          sub="orders ÷ views"
          color="bg-purple-50"
        />
      </div>

      {/* ── Chart Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">

        {/* Chart controls */}
        <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <FiBarChart2 size={16} className="text-blue-500" /> Performance
          </h3>
          {/* Period toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => { setPeriod(p); setOffset(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${period === p ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOffset(o => Math.min(o + 1, MAX_OFFSETS[period]))}
              disabled={offset >= MAX_OFFSETS[period]}
              className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 disabled:opacity-30 transition"
            >
              <FiChevronLeft size={14} />
            </button>
            <span className="text-xs font-bold text-gray-600 min-w-[100px] text-center">{getPeriodLabel(period, offset)}</span>
            <button
              onClick={() => setOffset(o => Math.max(o - 1, 0))}
              disabled={offset === 0}
              className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 disabled:opacity-30 transition"
            >
              <FiChevronRight size={14} />
            </button>
          </div>

          {/* Line toggles */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "views", color: "#3b82f6", label: "Views" },
              { key: "orders", color: "#10b981", label: "Orders" },
              { key: "revenue", color: "#f59e0b", label: "Revenue" },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setActiveLines(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${activeLines[item.key] ? "border-transparent text-white" : "border-gray-200 text-gray-400 bg-white"}`}
                style={activeLines[item.key] ? { background: item.color } : {}}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeLines[item.key] ? "white" : item.color }} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        {chartData.length === 0 ? (
          <div className="h-52 flex flex-col items-center justify-center text-gray-300 gap-2">
            <FiBarChart2 size={36} />
            <p className="text-sm">No data for this period</p>
            <p className="text-xs text-gray-300">Data will appear as customers view and order your products</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={230}>
            <ChartComp data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={35} />
              <Tooltip content={<CustomTooltip />} />
              {useBar ? (
                <>
                  {activeLines.views && <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Views" />}
                  {activeLines.orders && <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} name="Orders" />}
                  {activeLines.revenue && <Bar dataKey="revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Revenue" />}
                </>
              ) : (
                <>
                  {activeLines.views && <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Views" />}
                  {activeLines.orders && <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2.5} dot={false} name="Orders" />}
                  {activeLines.revenue && <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 2" name="Revenue" />}
                </>
              )}
            </ChartComp>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Products Performance List ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <FiPackage size={16} className="text-blue-500" />
            Products Performance
            <span className="text-xs font-normal text-gray-400">({filteredProducts.length})</span>
          </h3>
          <p className="text-xs text-gray-400">Tap to deep dive →</p>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-gray-50">
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-sm bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 placeholder-gray-300"
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-gray-300 gap-2">
            <FiPackage size={32} />
            <p className="text-sm">
              {analytics?.products?.length === 0 ? "No products yet" : "No products match your search"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 py-1">
            {filteredProducts.map((product, idx) => (
              <ProductRow
                key={product.id}
                product={product}
                rank={idx + 1}
                onClick={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Orders Summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Delivered", value: analytics?.products?.reduce((a, p) => a + (parseInt(p.sold) || 0), 0) || 0, color: "bg-green-50 text-green-700", dot: "bg-green-400" },
          { label: "Revenue", value: `TZS ${formatTZS(summary.total_revenue || 0)}`, color: "bg-blue-50 text-blue-700", dot: "bg-blue-400" },
          { label: "Cancelled", value: summary.cancelled_orders || 0, color: "bg-red-50 text-red-600", dot: "bg-red-400" },
          { label: "Products", value: summary.total_products || 0, color: "bg-purple-50 text-purple-700", dot: "bg-purple-400" },
        ].map(item => (
          <div key={item.label} className={`rounded-2xl p-4 text-center ${item.color}`}>
            <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${item.dot}`} />
            <p className="text-lg font-black">{item.value}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

    </div>
  );
}