import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import RegisterTrader from "./pages/RegisterTrader";

function App() {
  return (
    
      <Routes>

        {/* HOME */}
        <Route path="/" element={<Home />} />

        {/* REGISTER */}
        <Route path="/register-trader" element={<RegisterTrader />} />

      </Routes>
    
  );
}

export default App;