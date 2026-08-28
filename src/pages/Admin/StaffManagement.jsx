import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import AdminLayout from "./AdminLayout";
import { API } from "../../api";
import {
  FiUserPlus, FiKey, FiCheck, FiClock, FiUser,
  FiSlash, FiPlay, FiTrash2, FiActivity
} from "react-icons/fi";

const token = () => localStorage.getItem("token");
const currentUser = () => JSON.parse(localStorage.getItem("user") || "{}");

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [session, setSession] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [superKeyRequested, setSuperKeyRequested] = useState(false);
  const [password, setPassword] = useState("");
  const [superKey, setSuperKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    first_name: "", middle_name: "", last_name: "",
    gender: "", email: "", phone: "", password: ""
  });

  // OTP action state
  const [otpTarget, setOtpTarget] = useState(null); // { staffId, action }
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const me = currentUser();

  const fetchData = useCallback(async () => {
    try {
      const [staffRes, sessionRes, logsRes] = await Promise.all([
        fetch(`${API}/admin/staff`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API}/admin/admins/action/session`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API}/admin/activity-logs`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      const staffData = await staffRes.json();
      const sessionData = await sessionRes.json();
      const logsData = await logsRes.json();
      setStaff(staffData.staff || []);
      setSession(sessionData.session?.target_role === "business_manager" ? sessionData.session : null);
      setLogs(Array.isArray(logsData) ? logsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!me?.id) return;
    const s = io(
      import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000",
      { query: { adminId: me.id } }
    );
    s.on("vote_update", fetchData);
    s.on("filler_selected", fetchData);
    s.on("sequence_ready", fetchData);
    s.on("approval_progress", fetchData);
    s.on("action_completed", () => { fetchData(); showMsg("success", "Action completed!"); });
    return () => s.disconnect();
  }, [me?.id, fetchData]);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const votes = (session?.votes || []).map(v => ({ ...v, admin_id: parseInt(v.admin_id) }));
  const sequence = session?.approval_sequence || [];
  const approvals = session?.approvals || [];

  const isMyTurn = () => session?.status === "approving" && sequence[approvals.length] === me.id;
  const alreadyApproved = () => (session?.approvals || []).some(a => a.admin_id === me.id);
  const alreadyVoted = () => votes.some(v => v.admin_id === me.id);

  // ── Add business manager (voting flow) ──────────────────────────────
  const handleVoteAdd = async () => {
    try {
      const res = await fetch(`${API}/admin/admins/action/initiate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action_type: "ADD", target_role: "business_manager" })
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      showMsg("success", data.message);
      fetchData();
    } catch { showMsg("error", "Network error"); }
  };

  const handleRequestKey = async () => {
    try {
      const res = await fetch(`${API}/admin/admins/request-key`, {
        method: "POST", headers: { Authorization: `Bearer ${token()}` }
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      setSuperKeyRequested(true);
      showMsg("success", "Super key sent to your email!");
    } catch { showMsg("error", "Network error"); }
  };

  const handleApprove = async () => {
    if (!password || !superKey) return showMsg("error", "Enter both password and super key");
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/admin/admins/action/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.id, password, super_key: superKey })
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      setPassword(""); setSuperKey(""); setSuperKeyRequested(false);
      showMsg("success", data.message);
      fetchData();
    } catch { showMsg("error", "Network error"); }
    finally { setSubmitting(false); }
  };

  const handleSubmitNewStaff = async () => {
    const { first_name, last_name, gender, email, phone, password } = addForm;
    if (!first_name || !last_name || !gender || !email || !phone || !password)
      return showMsg("error", "Please fill all required fields");
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/admin/admins/action/submit-data`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.id, ...addForm })
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      setShowAddForm(false);
      showMsg("success", data.message);
      fetchData();
    } catch { showMsg("error", "Network error"); }
    finally { setSubmitting(false); }
  };

  // ── Disable / activate / delete (OTP flow) ──────────────────────────
  const startOtpAction = async (staffId, action) => {
    setOtpTarget({ staffId, action });
    setOtpSent(false);
    setOtpCode("");
    try {
      const res = await fetch(`${API}/admin/staff/request-action-otp`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, action })
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      setOtpSent(true);
      showMsg("success", "Confirmation code sent to your email");
    } catch { showMsg("error", "Network error"); }
  };

  const confirmOtpAction = async () => {
    if (!otpCode) return showMsg("error", "Enter the confirmation code");
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/admin/staff/confirm-action`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...otpTarget, otp_code: otpCode })
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      showMsg("success", data.message);
      setOtpTarget(null); setOtpSent(false); setOtpCode("");
      fetchData();
    } catch { showMsg("error", "Network error"); }
    finally { setSubmitting(false); }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Staff Management</h1>
        <p className="text-gray-500 text-sm mt-1">Business managers — ads & promotions team</p>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-[4px] text-sm font-medium border
          ${message.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="h-24 bg-white rounded-[4px] animate-pulse border border-gray-100" />
      ) : (
        <>
          {/* Add button */}
          {!session && (
            <button onClick={handleVoteAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-[4px] text-sm font-medium text-white mb-6"
              style={{ background: "#1a3a8f" }}>
              <FiUserPlus size={15} /> Add Business Manager
            </button>
          )}
          {session?.status === "pending" && !session.selected_filler && (
            alreadyVoted() ? (
              <div className="mb-6 px-4 py-2 rounded-[4px] text-sm text-white inline-flex items-center gap-2" style={{ background: "#1a3a8f", opacity: 0.7 }}>
                <FiClock size={14} /> Waiting for other admins to vote... ({votes.length} voted)
              </div>
            ) : (
              <button onClick={handleVoteAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-[4px] text-sm font-medium text-white mb-6"
                style={{ background: "#1a3a8f" }}>
                <FiUserPlus size={15} /> Vote to Add Business Manager
              </button>
            )
          )}

          {/* Staff list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {staff.map(s => (
              <div key={s.id} className="bg-white border border-gray-100 rounded-[4px] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#e8edf7] flex items-center justify-center text-[#1a3a8f] font-bold text-xs">
                      {s.first_name?.[0]}{s.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{s.first_name} {s.last_name}</p>
                      <p className="text-xs text-gray-400">{s.user_code}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-[4px] font-medium
                    ${s.is_deleted ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                    {s.is_deleted ? "Disabled" : "Active"}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{s.email}</p>
                <p className="text-xs text-gray-400 mb-3">{s.phone}</p>

                {otpTarget?.staffId === s.id ? (
                  <div className="bg-gray-50 rounded-[4px] p-3 space-y-2">
                    {!otpSent ? (
                      <p className="text-xs text-gray-500">Sending code...</p>
                    ) : (
                      <>
                        <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)}
                          placeholder="Enter code from email"
                          className="w-full border border-gray-200 rounded-[4px] px-3 py-1.5 text-sm" />
                        <div className="flex gap-2">
                          <button onClick={confirmOtpAction} disabled={submitting}
                            className="px-3 py-1.5 rounded-[4px] text-xs font-medium text-white" style={{ background: "#1a3a8f" }}>
                            Confirm
                          </button>
                          <button onClick={() => setOtpTarget(null)}
                            className="px-3 py-1.5 rounded-[4px] text-xs text-gray-500 border border-gray-200">
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {s.is_deleted ? (
                      <button onClick={() => startOtpAction(s.id, "activate")}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-[4px] text-xs font-medium text-green-600 border border-green-200">
                        <FiPlay size={12} /> Activate
                      </button>
                    ) : (
                      <button onClick={() => startOtpAction(s.id, "disable")}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-[4px] text-xs font-medium text-amber-600 border border-amber-200">
                        <FiSlash size={12} /> Disable
                      </button>
                    )}
                    <button onClick={() => startOtpAction(s.id, "delete")}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-[4px] text-xs font-medium text-red-600 border border-red-200">
                      <FiTrash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
            {staff.length === 0 && <p className="text-sm text-gray-400 col-span-2">No business managers yet.</p>}
          </div>

          {/* Session panel (add flow) — same shape as AdminManagement */}
          {session && (
            <div className="bg-white border border-gray-100 rounded-[4px] p-5 mb-6">
              <h2 className="font-semibold text-gray-800 text-sm mb-3">Add Business Manager — In Progress</h2>

              {session.status === "pending" && !session.selected_filler && (
                <p className="text-sm text-gray-600">{votes.length} admin(s) voted so far.</p>
              )}

              {session.status === "pending" && session.selected_filler &&
               parseInt(session.selected_filler) === parseInt(me.id) && !showAddForm && (
                <div className="p-4 bg-[#e8edf7] rounded-[4px]">
                  <p className="text-sm font-semibold text-[#1a3a8f] mb-2">You were selected to fill in the details.</p>
                  <button onClick={() => setShowAddForm(true)} className="px-4 py-2 rounded-[4px] text-sm font-medium text-white" style={{ background: "#1a3a8f" }}>
                    Fill Details
                  </button>
                </div>
              )}

              {showAddForm && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {[
                    { key: "first_name", label: "First Name *" },
                    { key: "middle_name", label: "Middle Name" },
                    { key: "last_name", label: "Last Name *" },
                    { key: "email", label: "Email *", type: "email" },
                    { key: "phone", label: "Phone *" },
                    { key: "password", label: "Password *", type: "password" },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">{label}</label>
                      <input type={type || "text"} value={addForm[key]}
                        onChange={e => setAddForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-[4px] px-3 py-2 text-sm" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Gender *</label>
                    <select value={addForm.gender} onChange={e => setAddForm(f => ({ ...f, gender: e.target.value }))}
                      className="w-full border border-gray-200 rounded-[4px] px-3 py-2 text-sm">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <button onClick={handleSubmitNewStaff} disabled={submitting}
                      className="px-5 py-2 rounded-[4px] text-sm font-medium text-white" style={{ background: "#1a3a8f" }}>
                      {submitting ? "Submitting..." : "Confirm & Start Approval"}
                    </button>
                  </div>
                </div>
              )}

              {session.status === "approving" && isMyTurn() && !alreadyApproved() && (
                <div className="bg-[#e8edf7] rounded-[4px] p-4 mt-2">
                  {!superKeyRequested ? (
                    <button onClick={handleRequestKey} className="flex items-center gap-2 px-4 py-2 rounded-[4px] text-sm font-medium text-white" style={{ background: "#1a3a8f" }}>
                      <FiKey size={14} /> Request Super Key
                    </button>
                  ) : (
                    <div className="space-y-2 mt-2">
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password"
                        className="w-full border border-gray-200 rounded-[4px] px-3 py-2 text-sm" />
                      <input type="text" value={superKey} onChange={e => setSuperKey(e.target.value)} maxLength={6} placeholder="Super key"
                        className="w-full border border-gray-200 rounded-[4px] px-3 py-2 text-sm font-mono" />
                      <button onClick={handleApprove} disabled={submitting}
                        className="px-5 py-2 rounded-[4px] text-sm font-medium text-white" style={{ background: "#1a3a8f" }}>
                        Submit
                      </button>
                    </div>
                  )}
                </div>
              )}

              {session.status === "approving" && !isMyTurn() && !alreadyApproved() && (
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-2"><FiClock size={14} /> Waiting for your turn...</p>
              )}
              {alreadyApproved() && <p className="text-sm text-green-600 mt-2 flex items-center gap-2"><FiCheck size={14} /> You approved. Waiting for others.</p>}
            </div>
          )}

          {/* Activity log */}
          <div className="bg-white border border-gray-100 rounded-[4px] p-5">
            <h2 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
              <FiActivity size={15} /> Recent Activity
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 && <p className="text-sm text-gray-400">No activity yet.</p>}
              {logs.map(l => (
                <div key={l.id} className="text-xs text-gray-600 border-b border-gray-50 pb-2">
                  <span className="font-semibold text-[#1a3a8f]">{l.user_code}</span>{" "}
                  {l.action.replace(/_/g, " ")} — {new Date(l.created_at).toLocaleString()}
                  {l.details?.line1_text && <span className="text-gray-400"> ({l.details.line1_text})</span>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}