import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import AdminLayout from "./AdminLayout";
import { API } from "../../api";
import {
  FiShield, FiUserPlus, FiUserMinus, FiKey,
  FiCheck, FiClock, FiAlertCircle, FiUser
} from "react-icons/fi";

const token = () => localStorage.getItem("token");
const currentUser = () => JSON.parse(localStorage.getItem("user") || "{}");

export default function AdminManagement() {
  const [admins, setAdmins]           = useState([]);
  const [session, setSession]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [myVote, setMyVote]           = useState(null);       // target_admin_id I voted for
  const [superKeyRequested, setSuperKeyRequested] = useState(false);
  const [password, setPassword]       = useState("");
  const [superKey, setSuperKey]       = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [message, setMessage]         = useState(null);       // { type: 'success'|'error', text }
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm]         = useState({
    first_name: "", middle_name: "", last_name: "",
    gender: "", email: "", phone: "", password: ""
  });
  const [socket, setSocket]           = useState(null);

  const me = currentUser();

  // ── Fetch admins + session ──────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [adminsRes, sessionRes] = await Promise.all([
        fetch(`${API}/admin/admins`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API}/admin/admins/action/session`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      const adminsData  = await adminsRes.json();
      const sessionData = await sessionRes.json();
      setAdmins(adminsData.admins || []);
      setSession(sessionData.session || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
  if (!session || session.status !== 'pending') return;
  const expiresAt = new Date(session.expires_at).getTime();
  const now = Date.now();
  const remaining = expiresAt - now;
  if (remaining <= 0) { fetchData(); return; }
  const timer = setTimeout(() => fetchData(), remaining);
  return () => clearTimeout(timer);
}, [session]);

  // ── Listen for admins_updated from AdminLayout ──────────────────────
  useEffect(() => {
    const handler = () => fetchData();
    window.addEventListener("admins_updated", handler);
    return () => window.removeEventListener("admins_updated", handler);
  }, [fetchData]);

  // ── Socket.io ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!me?.id) return;
    const s = io(
      import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000",
      { query: { adminId: me.id } }
    );
    setSocket(s);

    s.on("vote_update",        () => fetchData());
    s.on("filler_selected",    () => fetchData());
    s.on("sequence_ready",     () => fetchData());
    s.on("approval_progress",  () => fetchData());
    s.on("action_completed",   () => { fetchData(); setMessage({ type: "success", text: "Action completed successfully!" }); });
    s.on("suspicious_activity", () => fetchData());

    return () => s.disconnect();
  }, [me?.id]);

  useEffect(() => {
  const interval = setInterval(() => {
    if (session?.status === 'pending') fetchData();
  }, 5000); // poll every 5 seconds when session is pending
  return () => clearInterval(interval);
}, [session?.status]);

  // ── Helpers ────────────────────────────────────────────────────────
  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const isMyTurn = () => {
    if (!session || session.status !== "approving") return false;
    const approvals = session.approvals || [];
    const sequence  = session.approval_sequence || [];
    return sequence[approvals.length] === me.id;
  };

  const myPositionInSequence = () => {
    if (!session) return null;
    const sequence = session.approval_sequence || [];
    return sequence.indexOf(me.id);
  };

  const alreadyApproved = () => {
    if (!session) return false;
    return (session.approvals || []).some(a => a.admin_id === me.id);
  };

  const isLastInSequence = () => {
    if (!session) return false;
    const sequence = session.approval_sequence || [];
    const approvals = session.approvals || [];
    return sequence[approvals.length] === me.id &&
           approvals.length === sequence.length - 1;
  };

  // ── Vote (initiate action) ─────────────────────────────────────────
  const handleVote = async (actionType, targetId = null) => {
    try {
      const res = await fetch(`${API}/admin/admins/action/initiate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action_type: actionType, target_admin_id: targetId })
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      setMyVote(targetId);
      showMsg("success", data.message);
      fetchData();
    } catch {
      showMsg("error", "Network error");
    }
  };

  // ── Request super key ──────────────────────────────────────────────
  const handleRequestKey = async () => {
    try {
      const res = await fetch(`${API}/admin/admins/request-key`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` }
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      setSuperKeyRequested(true);
      showMsg("success", "Super key sent to your email!");
    } catch {
      showMsg("error", "Network error");
    }
  };

  // ── Submit approval ────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!password || !superKey)
      return showMsg("error", "Enter both password and super key");
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/admin/admins/action/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ session_id: session.id, password, super_key: superKey })
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      setPassword("");
      setSuperKey("");
      setSuperKeyRequested(false);
      showMsg("success", data.message);
      fetchData();
    } catch {
      showMsg("error", "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submit new admin data ──────────────────────────────────────────
  const handleSubmitNewAdmin = async () => {
    const { first_name, last_name, gender, email, phone, password } = addForm;
    if (!first_name || !last_name || !gender || !email || !phone || !password)
      return showMsg("error", "Please fill all required fields");
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/admin/admins/action/submit-data`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ session_id: session.id, ...addForm })
      });
      const data = await res.json();
      if (!res.ok) return showMsg("error", data.message);
      setShowAddForm(false);
      showMsg("success", data.message);
      fetchData();
    } catch {
      showMsg("error", "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const adminCount    = admins.length;
  const canAdd        = adminCount < 5;
  const canDelete     = adminCount > 3;
  const votes = (session?.votes || []).map(v => ({
  ...v,
  admin_id: parseInt(v.admin_id)
}));
  const sequence      = session?.approval_sequence || [];
  const approvals     = session?.approvals || [];
  const requiredVotes = session?.action_type === "DELETE" ? adminCount - 1 : adminCount;

  // ── UI ─────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Admin Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage administrators — min 3, max 5
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-[4px] text-sm font-medium border
          ${message.type === "success"
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-red-50 text-red-700 border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-[4px] p-5 animate-pulse h-24 border border-gray-100" />
          ))}
        </div>
      ) : (
        <>
          {/* ── Admin count badge ── */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-white border border-gray-100
                            rounded-[4px] px-4 py-2 text-sm font-semibold text-[#1a3a8f]">
              <FiShield size={15} />
              {adminCount} / 5 Admins
            </div>
{canAdd && (!session || (session?.status === 'pending' && session?.action_type === 'ADD')) && (
  votes.some(v => v.admin_id === me.id) ? (
    <button
      disabled
      className="flex items-center gap-2 px-4 py-2 rounded-[4px] text-sm
                 font-medium text-white opacity-60 cursor-not-allowed"
      style={{ background: "#1a3a8f" }}>
      <FiClock size={15} />
      Waiting... ({votes.length}/{adminCount} voted)
    </button>
  ) : (
    <button
      onClick={() => handleVote("ADD")}
      className="flex items-center gap-2 px-4 py-2 rounded-[4px] text-sm
                 font-medium text-white transition"
      style={{ background: "#1a3a8f" }}>
      <FiUserPlus size={15} />
      Add Admin
    </button>
  )
)}
          </div>

          {/* ── Admin list ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {admins.map(admin => {
              const votesForThis = votes.filter(v => v.admin_id !== admin.id &&
                session?.target_admin_id === admin.id).length;
              const isTarget = session?.target_admin_id === admin.id;
              const isMe = admin.id === me.id;

              return (
                <div key={admin.id}
                  className={`bg-white border rounded-[4px] p-4 flex items-center
                              justify-between transition
                              ${isTarget ? "border-red-300 bg-red-50" : "border-gray-100"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#e8edf7] flex items-center
                                    justify-center text-[#1a3a8f] font-bold text-xs">
                      {admin.first_name?.[0]}{admin.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {admin.first_name} {admin.middle_name} {admin.last_name}
                        {isMe && <span className="ml-2 text-xs text-blue-500">(You)</span>}
                      </p>
                      <p className="text-xs text-gray-500">{admin.email}</p>
                      <p className="text-xs text-gray-400">{admin.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isTarget && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-[4px]">
                        {votesForThis} vote{votesForThis !== 1 ? "s" : ""}
                      </span>
                    )}
                    {canDelete && !isMe && !session && (
                      <button
                        onClick={() => handleVote("DELETE", admin.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-[4px]
                                   text-xs font-medium text-red-600 border border-red-200
                                   hover:bg-red-50 transition">
                        <FiUserMinus size={13} />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Active session panel ── */}
          {session && (
            <div className="bg-white border border-gray-100 rounded-[4px] p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiClock size={16} className="text-[#1a3a8f]" />
                <h2 className="font-semibold text-gray-800 text-sm">
                  {session.action_type === "ADD" ? "Add Admin" : "Remove Admin"} — In Progress
                </h2>
              </div>

              {/* Voting stage */}
              {session.status === "pending" && (
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    Waiting for all admins to vote.
                    <span className="font-semibold text-[#1a3a8f] ml-1">
                      {votes.length} / {requiredVotes} voted
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {admins
                      .filter(a => session.action_type === "DELETE"
                        ? a.id !== session.target_admin_id : true)
                      .map(a => {
                        const voted = votes.some(v => v.admin_id === a.id);
                        return (
                          <span key={a.id}
                            className={`text-xs px-3 py-1 rounded-[4px] border font-medium
                              ${voted
                                ? "bg-[#1a3a8f] text-white border-[#1a3a8f]"
                                : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                            {a.first_name} {voted ? "✓" : "..."}
                          </span>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* ADD: selected filler fills form */}
              {session.status === "pending" &&
               session.action_type === "ADD" &&
               parseInt(session.selected_filler) === parseInt(me.id) &&
               !showAddForm && (
                <div className="mt-4 p-4 bg-[#e8edf7] rounded-[4px]">
                  <p className="text-sm font-semibold text-[#1a3a8f] mb-2">
                    You have been selected to fill in the new admin details.
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-4 py-2 rounded-[4px] text-sm font-medium text-white"
                    style={{ background: "#1a3a8f" }}>
                    Fill Details
                  </button>
                </div>
              )}
               
            {/* ADD: waiting for filler */}
              {session.status === "pending" &&
               session.action_type === "ADD" &&
               session.selected_filler &&
               parseInt(session.selected_filler) !== parseInt(me.id) && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-[4px]">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <FiClock size={15} />
                    Another admin has been selected to fill the new admin details. Please wait...
                  </div>
                </div>
              )}
              

              {/* Add form */}
              {showAddForm && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: "first_name",  label: "First Name *",  type: "text"     },
                    { key: "middle_name", label: "Middle Name",    type: "text"     },
                    { key: "last_name",   label: "Last Name *",    type: "text"     },
                    { key: "email",       label: "Email *",        type: "email"    },
                    { key: "phone",       label: "Phone *",        type: "text"     },
                    { key: "password",    label: "Password *",     type: "password" },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-500 font-medium mb-1 block">{label}</label>
                      <input
                        type={type}
                        value={addForm[key]}
                        onChange={e => setAddForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-[4px] px-3 py-2
                                   text-sm focus:outline-none focus:border-[#1a3a8f]"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Gender *</label>
                    <select
                      value={addForm.gender}
                      onChange={e => setAddForm(f => ({ ...f, gender: e.target.value }))}
                      className="w-full border border-gray-200 rounded-[4px] px-3 py-2
                                 text-sm focus:outline-none focus:border-[#1a3a8f]">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 flex gap-3 mt-2">
                    <button
                      onClick={handleSubmitNewAdmin}
                      disabled={submitting}
                      className="px-5 py-2 rounded-[4px] text-sm font-medium text-white
                                 disabled:opacity-50"
                      style={{ background: "#1a3a8f" }}>
                      {submitting ? "Submitting..." : "Confirm & Start Approval"}
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-5 py-2 rounded-[4px] text-sm font-medium text-gray-600
                                 border border-gray-200 hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Approval sequence stage */}
              {session.status === "approving" && (
                <div className="mt-2">
                  {/* Sequence indicators */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sequence.map((adminId, idx) => {
                      const done     = idx < approvals.length;
                      const isCurrent = idx === approvals.length;
                      const admin    = admins.find(a => a.id === adminId);
                      return (
                        <div key={adminId}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px]
                                      text-xs font-medium border
                            ${done
                              ? "bg-green-50 text-green-700 border-green-200"
                              : isCurrent
                                ? "bg-[#1a3a8f] text-white border-[#1a3a8f]"
                                : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                          {done
                            ? <FiCheck size={11} />
                            : isCurrent
                              ? <FiKey size={11} />
                              : <FiClock size={11} />}
                          {admin?.first_name || `Admin`}
                          {idx === sequence.length - 1 && !done &&
                            <span className="ml-1 text-yellow-300 text-[10px]">LAST</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* My turn */}
                  {isMyTurn() && !alreadyApproved() && (
                    <div className="bg-[#e8edf7] border border-[#1a3a8f]/20 rounded-[4px] p-4">
                      <p className="text-sm font-semibold text-[#1a3a8f] mb-3">
                        {isLastInSequence() ? "🏁 You are last — " : ""}
                        It's your turn to approve
                      </p>

                      {!superKeyRequested ? (
                        <button
                          onClick={handleRequestKey}
                          className="flex items-center gap-2 px-4 py-2 rounded-[4px]
                                     text-sm font-medium text-white mb-3"
                          style={{ background: "#1a3a8f" }}>
                          <FiKey size={14} />
                          Request Super Key
                        </button>
                      ) : (
                        <p className="text-xs text-green-600 font-medium mb-3">
                          ✓ Super key sent to your email
                        </p>
                      )}

                      {superKeyRequested && (
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-500 font-medium mb-1 block">
                              Your Password
                            </label>
                            <input
                              type="password"
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              placeholder="Enter your password"
                              className="w-full border border-gray-200 rounded-[4px] px-3
                                         py-2 text-sm focus:outline-none focus:border-[#1a3a8f]"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 font-medium mb-1 block">
                              Super Key (6 characters)
                            </label>
                            <input
                              type="text"
                              value={superKey}
                              onChange={e => setSuperKey(e.target.value)}
                              maxLength={6}
                              placeholder="e.g. aB3xK9"
                              className="w-full border border-gray-200 rounded-[4px] px-3
                                         py-2 text-sm font-mono focus:outline-none
                                         focus:border-[#1a3a8f] tracking-widest"
                            />
                          </div>
                          <button
                            onClick={handleApprove}
                            disabled={submitting}
                            className="px-5 py-2 rounded-[4px] text-sm font-medium
                                       text-white disabled:opacity-50"
                            style={{ background: "#1a3a8f" }}>
                            {submitting ? "Verifying..." : "Submit"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Waiting for turn */}
                  {!isMyTurn() && !alreadyApproved() &&
                   sequence.includes(me.id) && (
                    <div className="bg-gray-50 border border-gray-200 rounded-[4px] p-4">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <FiClock size={15} />
                        Wait for your turn...
                        <span className="text-xs text-gray-400">
                          (Position {myPositionInSequence() + 1} of {sequence.length})
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Already approved */}
                  {alreadyApproved() && (
                    <div className="bg-green-50 border border-green-200 rounded-[4px] p-4">
                      <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                        <FiCheck size={15} />
                        You have approved. Waiting for others to complete.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}