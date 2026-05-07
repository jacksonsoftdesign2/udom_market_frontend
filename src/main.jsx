import React from 'react'
import App from './App'
import './index.css'
import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import "./App.css";




// ── Register Firebase SW with root scope before app loads ──
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/firebase-messaging-sw.js", {
    scope: "/"
  }).then(reg => {
    console.log("[SW] Registered with scope:", reg.scope);
  }).catch(err => {
    console.error("[SW] Registration failed:", err);
  });
}



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)