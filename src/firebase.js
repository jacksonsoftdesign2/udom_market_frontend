import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBU72fIkAyAe8_RdiGmGgZo3AmvLrmKnak",
  authDomain: "udom-market-notifications.firebaseapp.com",
  projectId: "udom-market-notifications",
  storageBucket: "udom-market-notifications.firebasestorage.app",
  messagingSenderId: "771482015905",
  appId: "1:771482015905:web:e1e467f02c5cbbf86cb8e0"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
export { getToken, onMessage };
export default app;