import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Home from "./pages/Home";
import RegisterTrader from "./pages/RegisterTrader";
import Login from "./pages/Login";

function App() {
  return (
    
      <Routes>

        {/* HOME */}
        <Route path="/" element={<Home />} />


        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* REGISTER */}
        <Route path="/register-trader" element={<RegisterTrader />} />

      </Routes>
    
  );
}

export default App;