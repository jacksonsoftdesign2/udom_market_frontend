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
          <div className={`rounded-[4px] border p-6 mb-6 ${
            paymentStatus.status === "disabled" 
              ? "bg-blue-50 border-blue-200" 
              : paymentStatus.isPaid && paymentStatus.daysRemaining > 5
              ? "bg-green-50 border-green-200"
              : paymentStatus.isPaid && paymentStatus.daysRemaining <= 5
              ? "bg-orange-50 border-orange-200"
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  paymentStatus.status === "disabled" 
                    ? "bg-blue-100" 
                    : paymentStatus.isPaid
                    ? paymentStatus.daysRemaining > 5 ? "bg-green-100" : "bg-orange-100"
                    : "bg-red-100"
                }`}>
                  {paymentStatus.status === "disabled" || (paymentStatus.isPaid && paymentStatus.daysRemaining > 5) ? (
                    <FiCheck className={`w-6 h-6 ${paymentStatus.status === "disabled" ? "text-blue-600" : "text-green-600"}`} />
                  ) : paymentStatus.isPaid && paymentStatus.daysRemaining <= 5 ? (
                    <FiClock className="w-6 h-6 text-orange-600" />
                  ) : (
                    <FiAlertTriangle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <p className={`text-lg font-bold ${
                    paymentStatus.status === "disabled" 
                      ? "text-blue-800" 
                      : paymentStatus.isPaid
                      ? paymentStatus.daysRemaining > 5 ? "text-green-800" : "text-orange-800"
                      : "text-red-800"
                  }`}>
                    {paymentStatus.status === "disabled"
                      ? "✓ No Payment Required"
                      : paymentStatus.isPaid
                      ? "✓ Paid"
                      : "⚠️ Payment Due"}
                  </p>
                  <p className={`text-sm mt-1 ${
                    paymentStatus.status === "disabled" 
                      ? "text-blue-700" 
                      : paymentStatus.isPaid
                      ? paymentStatus.daysRemaining > 5 ? "text-green-700" : "text-orange-700"
                      : "text-red-700"
                  }`}>
                    {paymentStatus.status === "disabled"
                      ? "Monthly payments are disabled"
                      : paymentStatus.isPaid && paymentStatus.daysRemaining > 5
                      ? `${paymentStatus.daysRemaining} days remaining`
                      : paymentStatus.isPaid && paymentStatus.daysRemaining <= 5
                      ? `Only ${paymentStatus.daysRemaining} days left!`
                      : "Complete payment to activate"}
                  </p>
                </div>
              </div>

              {/* Right: Payment button if needed */}
              {paymentStatus.isPaid && paymentStatus.daysRemaining <= 5 ? (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-6 py-3 bg-orange-600 text-white rounded-[4px] font-bold text-sm hover:bg-orange-700 transition flex items-center gap-2 flex-shrink-0"
                >
                  <FiCreditCard size={16} />
                  Pay Now
                </button>
              ) : !paymentStatus.isPaid && paymentStatus.status !== "disabled" ? (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-6 py-3 bg-red-600 text-white rounded-[4px] font-bold text-sm hover:bg-red-700 transition flex items-center gap-2 flex-shrink-0"
                >
                  <FiCreditCard size={16} />
                  Pay Now
                </button>
              ) : null}
            </div>
          </div>

          {/* ── MONTHLY FEE INFO ── */}
          {settings?.monthly_active && settings?.payments_active && (
            <div className="bg-blue-50 border border-blue-200 rounded-[4px] p-4 mb-6">
              <p className="text-blue-700 text-sm font-medium">
                 Monthly fee: <span className="font-bold">TZS {settings?.monthly_fee?.toLocaleString()}</span> per month
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
