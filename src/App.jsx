import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


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
      </Routes>
    
  );
}

export default App;