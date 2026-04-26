import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductDetail from "./pages/ProductDetail";

import Home from "./pages/Home";
import RegisterTrader from "./pages/RegisterTrader";
import Login from "./pages/Login";
import TraderDashboard from "./pages/Trader/TraderDashboard";  

function App() {
  return (
    
      <Routes>

        {/* HOME */}
        <Route path="/" element={<Home />} />


        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* REGISTER */}
        <Route path="/register-trader" element={<RegisterTrader />} />
        {/* trader-DASHBOARD */}
        <Route path="/trader/dashboard" element={<TraderDashboard />} />
         <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    
  );
}

export default App;