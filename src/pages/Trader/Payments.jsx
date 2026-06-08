import { useState, useEffect } from "react";
import { API } from "../../api";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PaymentMockup from "../../components/PaymentMockup";
import { FiCreditCard, FiCheck, FiX, FiClock, FiAlertCircle } from "react-icons/fi";

export default function Payments() {
  const [settings, setSettings] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Fetch payment settings and trader's payment history
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, paymentsRes] = await Promise.all([
          axios.get(`${API}/admin/payment-settings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/payments/my-payments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setSettings(settingsRes.data);
        setPayments(paymentsRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // Get latest payment
  const latestPayment = payments.length > 0 ? payments[0] : null;

  // Calculate next due date (30 days from latest approved payment)
  const getNextDueDate = () => {
    if (!latestPayment || latestPayment.status !== "approved") {
      return "Not yet active";
    }
    const lastPaymentDate = new Date(latestPayment.payment_date);
    const nextDue = new Date(lastPaymentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    return nextDue.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if payment is overdue
  const isPaymentDue = () => {
    if (!latestPayment || latestPayment.status !== "approved") return false;
    const lastPaymentDate = new Date(latestPayment.payment_date);
    const thirtyDaysLater = new Date(lastPaymentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    return new Date() > thirtyDaysLater;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        icon: FiClock,
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
        label: "Pending",
      },
      approved: {
        icon: FiCheck,
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        label: "Approved",
      },
      rejected: {
        icon: FiX,
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        label: "Rejected",
      },
    };
    return badges[status] || badges.pending;
  };

  const handlePayNow = () => {
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] bg-gradient-to-br from-white via-blue-50 to-white flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#c7d6f5] border-t-[#1a3a8f] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading payment information...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white pt-20 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Monthly Payments</h1>
            <p className="text-gray-600 mt-2">Manage your trader account subscription</p>
          </div>

          {/* ── CURRENT STATUS CARD ── */}
          <div className="bg-white rounded-[4px] border border-gray-100 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Status */}
              <div>
                <p className="text-gray-600 text-sm font-medium mb-3">Account Status</p>
                <div className="flex items-center gap-3">
                  {latestPayment?.status === "approved" ? (
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FiCheck className="w-6 h-6 text-green-600" />
                    </div>
                  ) : latestPayment?.status === "pending" ? (
                    <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <FiClock className="w-6 h-6 text-yellow-600" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <FiAlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-bold text-gray-800">
                      {latestPayment?.status === "approved"
                        ? "✓ Active"
                        : latestPayment?.status === "pending"
                        ? "⏳ Pending"
                        : "⚠️ Not Active"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {latestPayment
                        ? `Last payment: ${new Date(latestPayment.payment_date).toLocaleDateString()}`
                        : "No payments yet"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Next Due */}
              <div>
                <p className="text-gray-600 text-sm font-medium mb-3">Next Payment Due</p>
                <div>
                  <p className="text-2xl font-bold text-[#1a3a8f]">{getNextDueDate()}</p>
                  {isPaymentDue() && (
                    <p className="text-sm text-red-600 font-semibold mt-1">⚠️ Payment overdue</p>
                  )}
                  {latestPayment?.status === "approved" && !isPaymentDue() && (
                    <p className="text-sm text-green-600 mt-1">Your account is active</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── MONTHLY FEE CARD ── */}
          {settings?.monthly_active && settings?.payments_active ? (
            <div className="bg-gradient-to-br from-[#e8edf7] to-[#f0f4ff] rounded-[4px] border-2 border-[#c7d6f5] p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#4a6fa5] text-sm font-medium mb-1">Monthly Subscription</p>
                  <p className="text-4xl font-black text-[#1a3a8f]">
                    {settings?.monthly_fee?.toLocaleString()}
                  </p>
                  <p className="text-[#4a6fa5] font-semibold mt-1">TZS per month</p>
                </div>
                <button
                  onClick={handlePayNow}
                  className="px-6 py-3 bg-[#1a3a8f] text-[#F5C518] rounded-[4px] font-bold text-sm hover:bg-[#0f2460] transition flex items-center gap-2 flex-shrink-0"
                >
                  <FiCreditCard size={16} />
                  Pay Now
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-[4px] p-6 mb-6">
              <p className="text-blue-700 font-medium">
                💡 Monthly payments are currently disabled. Your account access is active indefinitely.
              </p>
            </div>
          )}

          {/* ── PAYMENT HISTORY ── */}
          <div className="bg-white rounded-[4px] border border-gray-100 overflow-hidden">
            <div className="bg-[#f0f4ff] px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1a3a8f]">Payment History</h2>
              <p className="text-sm text-gray-500 mt-1">
                {payments.length} payment{payments.length !== 1 ? "s" : ""} on record
              </p>
            </div>

            {payments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FiCreditCard className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No payments yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Your first payment will appear here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                        Transaction ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((payment) => {
                      const badge = getStatusBadge(payment.status);
                      const StatusIcon = badge.icon;
                      return (
                        <tr key={payment.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-800">
                              {new Date(payment.payment_date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(payment.payment_date).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-gray-800">
                              TZS {payment.amount?.toLocaleString()}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              <StatusIcon size={14} />
                              <span className="text-xs font-semibold">{badge.label}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-mono text-gray-600 truncate max-w-xs">
                              {payment.proof || payment.transaction_id || "—"}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── INFO BOX ── */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-[4px] p-4">
            <p className="text-sm text-blue-700 leading-relaxed">
              <strong>📋 How it works:</strong>
              <br />
              You need to pay TZS {settings?.monthly_fee?.toLocaleString()} every 30 days to keep your trader account
              active. Payments can be made via M-Pesa, Tigo, Airtel, or HaloPesa.
              <br />
              Click <strong>"Pay Now"</strong> to initiate a payment using your preferred mobile money provider.
            </p>
          </div>
        </div>
      </div>
      <Footer />

      {/* ── PAYMENT MOCKUP MODAL ── */}
      {showPaymentModal && (
        <PaymentMockup
          user={user}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </>
  );
}