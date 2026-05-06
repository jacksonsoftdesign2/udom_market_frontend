import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductDetail from "./pages/ProductDetail";

import Home from "./pages/Home";
import RegisterTrader from "./pages/RegisterTrader";
import Login from "./pages/Login";
import TraderDashboard from "./pages/Trader/TraderDashboard";  
import About from "./pages/About";
import Delivery from "./pages/Delivery";
import ProtectedRoute from "./components/ProtectedRoute";
import TraderOrders from "./pages/TraderOrders";
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
        <Route path="/about" element={<About />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route
  path="/trader/orders"
  element={
    <ProtectedRoute> <TraderOrders /> </ProtectedRoute> } />
      </Routes>
    
  );
}

export default App;