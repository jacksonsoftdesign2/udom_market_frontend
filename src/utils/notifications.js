import { messaging, getToken, onMessage } from "../firebase";
import { API } from "../api";

const VAPID_KEY = "BD0OGGLo6uSYze4LNVFiRMjNB0T8A2uwx4hnb2QSi5vD9NEiArL3yNENtG71VHYMa69Iq3Mox5M3buK4Tt--C9o";

// ── Request permission + get token + save to backend ──
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!token) return null;

    await saveFcmToken(token);
    return token;
  } catch (error) {
    console.error("FCM error:", error);
    return null;
  }
};

// ── Save token to backend ──
export const saveFcmToken = async (token) => {
  try {
    const authToken = localStorage.getItem("token");
    if (!authToken) return;

    const res = await fetch(`${API}/notifications/save-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ fcm_token: token })
    });

    const data = await res.json();
    console.log("Token save response:", data);
  } catch (err) {
    console.error("Failed to save FCM token:", err);
  }
};

// ── Remove token on logout ──
export const removeFcmToken = async () => {
  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!token) return;

    const authToken = localStorage.getItem("token");
    if (!authToken) return;

    await fetch(`${API}/notifications/remove-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ fcm_token: token })
    });

    console.log("[FCM] Token deactivated on logout");
  } catch (err) {
    console.error("Failed to remove FCM token:", err);
  }
};

// ── Play sound ──
const playNotificationSound = () => {
  try {
    const audio = new Audio("/notification.mp3");
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch (e) {}
};

// ── Vibrate ──
const vibrateDevice = () => {
  if ("vibrate" in navigator) {
    navigator.vibrate([200, 100, 200, 100, 200]);
  }
};

// ── Listen for foreground notifications ──
export const listenForForegroundNotifications = (onNotification) => {
  return onMessage(messaging, (payload) => {
    const title = payload.notification?.title || "New Order";
    const body  = payload.notification?.body  || "You have a new order";
    const url   = payload.data?.url || "/trader/dashboard?section=orders";

    playNotificationSound();
    vibrateDevice();

    onNotification({ title, body, url });
  });
};