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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const token = localStorage.getItem("token");

  // Fetch payment settings, trader's payment history, and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userFromStorage = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(userFromStorage);

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

  // ── CHECK PAYMENT STATUS ──
  const getPaymentStatus = () => {
    // If payments globally disabled
    if (!settings?.payments_active) {
      return {
        isPaid: true,
        status: "disabled",
        message: "No payment required - payments are disabled",
        daysRemaining: null,
      };
    }

    // If monthly payment is disabled
    if (!settings?.monthly_active) {
      return {
        isPaid: true,
        status: "disabled",
        message: "No payment required - monthly payments are disabled",
        daysRemaining: null,
      };
    }

    // Get latest approved payment
    const latestApprovedPayment = payments.find(p => p.status === "approved");

    if (!latestApprovedPayment) {
      // No approved payment yet - payment is due
      return {
        isPaid: false,
        status: "overdue",
        message: `Payment overdue - Please pay TZS ${settings?.monthly_fee?.toLocaleString()}`,
        daysRemaining: 0,
        amountDue: settings?.monthly_fee,
      };
    }

    // Calculate days since last approved payment
    const lastPaymentDate = new Date(latestApprovedPayment.payment_date);
    const today = new Date();
    const daysSincePayment = Math.floor((today - lastPaymentDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = 30 - daysSincePayment;

    if (daysSincePayment >= 30) {
      // Payment is due again (30 days passed)
      return {
        isPaid: false,
        status: "overdue",
        message: `Payment overdue - Please pay TZS ${settings?.monthly_fee?.toLocaleString()}`,
        daysRemaining: 0,
        amountDue: settings?.monthly_fee,
      };
    }

    // Still within 30-day period
    return {
      isPaid: true,
      status: "active",
      message: `✓ Account Active`,
      daysRemaining,
      lastPaymentAmount: latestApprovedPayment.amount,
    };
  };

  const paymentStatus = getPaymentStatus();

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

          {/* ── STATUS CARD ── */}
          <div className="bg-white rounded-[4px] border border-gray-100 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Status */}
              <div>
                <p className="text-gray-600 text-sm font-medium mb-3">Account Status</p>
                <div className="flex items-center gap-3">
                  {paymentStatus.status === "disabled" ? (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FiCheck className="w-6 h-6 text-blue-600" />
                    </div>
                  ) : paymentStatus.isPaid ? (
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FiCheck className="w-6 h-6 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <FiAlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-bold text-gray-800">
                      {paymentStatus.status === "disabled"
                        ? "✓ No Payment Required"
                        : paymentStatus.isPaid
                        ? "✓ Active"
                        : "⚠️ Payment Due"}
                    </p>
                    <p className="text-sm text-gray-500">{paymentStatus.message}</p>
                  </div>
                </div>
              </div>

              {/* Right: Days Remaining or Info */}
              <div>
                {paymentStatus.status === "disabled" ? (
                  <>
                    <p className="text-gray-600 text-sm font-medium mb-3">Payment Status</p>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">Disabled</p>
                      <p className="text-sm text-gray-500 mt-1">You can operate without monthly payments</p>
                    </div>
                  </>
                ) : paymentStatus.isPaid ? (
                  <>
                    <p className="text-gray-600 text-sm font-medium mb-3">Days Remaining</p>
                    <div>
                      <p className="text-4xl font-bold text-green-600">{paymentStatus.daysRemaining}</p>
                      <p className="text-sm text-gray-500 mt-1">days until next payment</p>
                      {paymentStatus.lastPaymentAmount && (
                        <p className="text-xs text-gray-400 mt-2">
                          Last paid: TZS {paymentStatus.lastPaymentAmount?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 text-sm font-medium mb-3">Action Required</p>
                    <div>
                      <p className="text-2xl font-bold text-red-600">Pay Now</p>
                      <p className="text-sm text-gray-500 mt-1">Your account access is limited</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── PAYMENT REQUIRED ALERT ── */}
          {!paymentStatus.isPaid && paymentStatus.status !== "disabled" && (
            <div className="bg-red-50 border border-red-200 rounded-[4px] p-4 mb-6">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-700 font-semibold text-sm">Payment Required</p>
                  <p className="text-red-600 text-sm mt-1">
                    Your account access is limited. You cannot add new products or edit listings until payment is made.
                  </p>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-[4px] text-sm font-semibold hover:bg-red-700 transition"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          )}

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
                {paymentStatus.isPaid && paymentStatus.daysRemaining !== null && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-6 py-3 bg-[#1a3a8f] text-[#F5C518] rounded-[4px] font-bold text-sm hover:bg-[#0f2460] transition flex items-center gap-2 flex-shrink-0"
                  >
                    <FiCreditCard size={16} />
                    Pay Early
                  </button>
                )}
                {!paymentStatus.isPaid && paymentStatus.status !== "disabled" && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-6 py-3 bg-[#1a3a8f] text-[#F5C518] rounded-[4px] font-bold text-sm hover:bg-[#0f2460] transition flex items-center gap-2 flex-shrink-0"
                  >
                    <FiCreditCard size={16} />
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-[4px] p-6 mb-6">
              <p className="text-blue-700 font-medium">
                💡 Monthly payments are currently disabled. Your account access is unrestricted.
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
                      const getStatusBadge = (status) => {
                        const badges = {
                          pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "⏳ Pending" },
                          approved: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "✓ Approved" },
                          rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "❌ Rejected" },
                        };
                        return badges[status] || badges.pending;
                      };
                      const badge = getStatusBadge(payment.status);

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
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] border text-xs font-semibold ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {badge.label}
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