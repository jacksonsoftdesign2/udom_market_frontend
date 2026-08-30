import React from 'react'
import App from './App'
import './index.css'
import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import "./App.css";




if ("serviceWorker" in navigator) {
  // Register PWA service worker
  navigator.serviceWorker.register("/service-worker.js")
    .then(() => console.log("[SW] PWA Service Worker registered"))
    .catch(err => console.error("[SW] PWA Registration failed:", err));

  // Register Firebase messaging service worker
  navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" })
    .then(reg => console.log("[SW] Firebase Registered with scope:", reg.scope))
    .catch(err => console.error("[SW] Firebase Registration failed:", err));
}




createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)